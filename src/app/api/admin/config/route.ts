import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, hasPermission, isAdminByEmailDomain, isAdminByUserId, getUserPermissions } from '@/lib/admin-config';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

// In production, this would be stored in a database
// For now, we'll use a simple in-memory store
let systemConfig = {
  // General Settings
  platformName: 'Fixmotech Reference',
  platformDescription: 'Advanced verification and task management platform',
  maintenanceMode: false,
  debugMode: false,
  
  // Security Settings
  maxLoginAttempts: 5,
  sessionTimeout: 3600,
  requireTwoFactor: false,
  passwordMinLength: 8,
  
  // Verification Settings
  selfieVerificationEnabled: true,
  antiSpoofingEnabled: true,
  verificationTimeout: 300,
  maxVerificationAttempts: 3,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  notificationFrequency: 'immediate' as 'immediate' | 'hourly' | 'daily',
  
  // Payment Settings
  paymentEnabled: true,
  currency: 'PHP',
  minimumPayment: 100,
  maximumPayment: 10000,
  transactionFee: 2.5,
  
  // AI Settings
  aiModelVersion: 'v2.1.0',
  aiConfidenceThreshold: 0.85,
  aiProcessingTimeout: 30,
  enableAITesting: false,
  
  // Performance Settings
  cacheEnabled: true,
  cacheTimeout: 1800,
  imageCompression: true,
  maxImageSize: 5242880, // 5MB
};

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    // Extract and verify the Firebase JWT token
    const token = authHeader.substring(7);
    let userId: string;
    let userEmail: string | null;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      userEmail = decodedToken.email;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    // Debug logging
    console.log('Auth check:', {
      userId,
      userEmail,
      isAdmin: isAdmin(userId, userEmail),
      isAdminByEmail: isAdminByEmailDomain(userEmail),
      isAdminByUserId: isAdminByUserId(userId),
      hasPermission: hasPermission(userId, 'manage_system', userEmail)
    });

    if (!isAdmin(userId, userEmail)) {
      return NextResponse.json({ 
        error: 'Access denied - Not an admin',
        debug: { userId, userEmail, isAdminByEmail: isAdminByEmailDomain(userEmail) }
      }, { status: 403 });
    }

    if (!hasPermission(userId, 'manage_system', userEmail)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions - Cannot manage system',
        debug: { userId, userEmail, permissions: getUserPermissions(userId, userEmail) }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      config: systemConfig,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    // Extract and verify the Firebase JWT token
    const token = authHeader.substring(7);
    let userId: string;
    let userEmail: string | null;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      userEmail = decodedToken.email;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    if (!isAdmin(userId, userEmail)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!hasPermission(userId, 'manage_system', userEmail)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Config data is required' }, { status: 400 });
    }

    // Validate the configuration
    const validationResult = validateConfig(config);
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Invalid configuration',
        details: validationResult.errors 
      }, { status: 400 });
    }

    // Update the configuration
    systemConfig = {
      ...systemConfig,
      ...config,
    };

    // In production, save to database
    console.log('Saving system config:', systemConfig);

    return NextResponse.json({
      success: true,
      config: systemConfig,
      lastUpdated: new Date().toISOString(),
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    // Extract and verify the Firebase JWT token
    const token = authHeader.substring(7);
    let userId: string;
    let userEmail: string | null;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      userEmail = decodedToken.email;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    if (!isAdmin(userId, userEmail)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!hasPermission(userId, 'manage_system', userEmail)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      // Reset to default configuration
      systemConfig = {
        platformName: 'Fixmotech Reference',
        platformDescription: 'Advanced verification and task management platform',
        maintenanceMode: false,
        debugMode: false,
        maxLoginAttempts: 5,
        sessionTimeout: 3600,
        requireTwoFactor: false,
        passwordMinLength: 8,
        selfieVerificationEnabled: true,
        antiSpoofingEnabled: true,
        verificationTimeout: 300,
        maxVerificationAttempts: 3,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationFrequency: 'immediate' as 'immediate' | 'hourly' | 'daily',
        paymentEnabled: true,
        currency: 'PHP',
        minimumPayment: 100,
        maximumPayment: 10000,
        transactionFee: 2.5,
        aiModelVersion: 'v2.1.0',
        aiConfidenceThreshold: 0.85,
        aiProcessingTimeout: 30,
        enableAITesting: false,
        cacheEnabled: true,
        cacheTimeout: 1800,
        imageCompression: true,
        maxImageSize: 5242880,
      };

      return NextResponse.json({
        success: true,
        config: systemConfig,
        lastUpdated: new Date().toISOString(),
        message: 'Configuration reset to defaults',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing config action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate general settings
  if (config.platformName && typeof config.platformName !== 'string') {
    errors.push('Platform name must be a string');
  }

  if (config.maxLoginAttempts && (config.maxLoginAttempts < 1 || config.maxLoginAttempts > 10)) {
    errors.push('Max login attempts must be between 1 and 10');
  }

  if (config.sessionTimeout && (config.sessionTimeout < 300 || config.sessionTimeout > 86400)) {
    errors.push('Session timeout must be between 300 and 86400 seconds');
  }

  if (config.passwordMinLength && (config.passwordMinLength < 6 || config.passwordMinLength > 32)) {
    errors.push('Password minimum length must be between 6 and 32');
  }

  if (config.verificationTimeout && (config.verificationTimeout < 60 || config.verificationTimeout > 1800)) {
    errors.push('Verification timeout must be between 60 and 1800 seconds');
  }

  if (config.maxVerificationAttempts && (config.maxVerificationAttempts < 1 || config.maxVerificationAttempts > 10)) {
    errors.push('Max verification attempts must be between 1 and 10');
  }

  if (config.transactionFee && (config.transactionFee < 0 || config.transactionFee > 10)) {
    errors.push('Transaction fee must be between 0 and 10 percent');
  }

  if (config.aiConfidenceThreshold && (config.aiConfidenceThreshold < 0 || config.aiConfidenceThreshold > 1)) {
    errors.push('AI confidence threshold must be between 0 and 1');
  }

  if (config.aiProcessingTimeout && (config.aiProcessingTimeout < 10 || config.aiProcessingTimeout > 300)) {
    errors.push('AI processing timeout must be between 10 and 300 seconds');
  }

  if (config.cacheTimeout && (config.cacheTimeout < 60 || config.cacheTimeout > 86400)) {
    errors.push('Cache timeout must be between 60 and 86400 seconds');
  }

  if (config.maxImageSize && (config.maxImageSize < 1048576 || config.maxImageSize > 10485760)) {
    errors.push('Max image size must be between 1MB and 10MB');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
} 