import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface SecurityConfig {
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  allowedOrigins: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  allowedOrigins: ['http://localhost:3000', 'https://fixmo-ejgfh.web.app']
};

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(
  request: NextRequest,
  config: SecurityConfig = defaultSecurityConfig
): NextResponse | null {
  const clientId = getClientId(request);
  const now = Date.now();
  
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + config.rateLimitWindowMs
    });
    return null;
  }
  
  if (clientData.count >= config.rateLimitMaxRequests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  // Increment count
  clientData.count++;
  return null;
}

/**
 * CORS middleware
 */
export function corsMiddleware(
  request: NextRequest,
  config: SecurityConfig = defaultSecurityConfig
): NextResponse | null {
  const origin = request.headers.get('origin');
  
  if (origin && !config.allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'CORS policy violation' },
      { status: 403 }
    );
  }
  
  return null;
}

/**
 * Input validation middleware
 */
export function validateInput(data: any, schema: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Authentication middleware
 */
export async function authMiddleware(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Missing or invalid authorization header' };
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await (auth as any).verifyIdToken(token);
    
    return { user: decodedToken };
  } catch (error) {
    return { user: null, error: 'Invalid authentication token' };
  }
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

/**
 * Comprehensive security middleware
 */
export async function securityMiddleware(
  request: NextRequest,
  config: SecurityConfig = defaultSecurityConfig
): Promise<NextResponse | null> {
  // Check CORS
  const corsResponse = corsMiddleware(request, config);
  if (corsResponse) return corsResponse;
  
  // Check rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, config);
  if (rateLimitResponse) return rateLimitResponse;
  
  return null;
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `${ip}-${request.headers.get('user-agent') || 'unknown'}`;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate image data
 */
export function validateImageData(imageData: string): { valid: boolean; error?: string } {
  if (!imageData) {
    return { valid: false, error: 'Image data is required' };
  }
  
  if (!imageData.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image data format' };
  }
  
  // Check file size (base64 encoded)
  const base64Data = imageData.split(',')[1];
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (sizeInBytes > maxSizeInBytes) {
    return { valid: false, error: `Image size must be less than ${maxSizeInMB}MB` };
  }
  
  return { valid: true };
} 