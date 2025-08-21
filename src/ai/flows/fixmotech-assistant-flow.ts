'use server';
/**
 * @fileOverview A context-aware Fixmotech assistant flow that provides intelligent suggestions
 * and assistance based on user context and platform configuration.
 *
 * - fixmotechAssistant - A function that provides context-aware assistance
 * - FixmotechAssistantInput - The input type for the fixmotechAssistant function
 * - FixmotechAssistantOutput - The return type for the fixmotechAssistant function
 */

import { z } from 'genkit';
import { configService } from '@/lib/config-service';
import { getPHPSymbol } from '@/lib/currency-utils';

const FixmotechAssistantInputSchema = z.object({
  userInput: z.string().describe('The user-provided input or question.'),
  context: z.enum(['post', 'verification', 'payment', 'general', 'admin']).describe('The context where the assistant is being used.'),
  userRole: z.enum(['user', 'admin', 'moderator']).optional().describe('The role of the user making the request.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional().describe('The history of the conversation between the user and the assistant.'),
  platformConfig: z.object({
    maintenanceMode: z.boolean().optional(),
    debugMode: z.boolean().optional(),
    selfieVerificationEnabled: z.boolean().optional(),
    paymentEnabled: z.boolean().optional(),
    aiModelVersion: z.string().optional(),
  }).optional().describe('Current platform configuration context.'),
});

export type FixmotechAssistantInput = z.infer<typeof FixmotechAssistantInputSchema>;

const FixmotechAssistantOutputSchema = z.object({
  response: z.string().describe('The assistant\'s response to the user input.'),
  suggestions: z.array(z.string()).optional().describe('Suggested actions or next steps.'),
  contextAwareInfo: z.object({
    isMaintenanceMode: z.boolean().optional(),
    verificationStatus: z.string().optional(),
    paymentStatus: z.string().optional(),
    aiModelInfo: z.string().optional(),
  }).optional().describe('Context-aware information based on platform state.'),
  confidence: z.number().min(0).max(1).describe('Confidence level of the response (0-1).'),
  requiresAction: z.boolean().describe('Whether the response requires user action.'),
  actionType: z.enum(['none', 'verification', 'payment', 'admin', 'support']).optional().describe('Type of action required.'),
});

export type FixmotechAssistantOutput = z.infer<typeof FixmotechAssistantOutputSchema>;

export async function fixmotechAssistant(input: FixmotechAssistantInput): Promise<FixmotechAssistantOutput> {
  return fixmotechAssistantFlow(input);
}

// Context-aware response generation
function generateContextAwareResponse(
  userInput: string, 
  context: string, 
  userRole?: string,
  platformConfig?: any
): string {
  const lowerInput = userInput.toLowerCase();
  
  // Maintenance mode context
  if (platformConfig?.maintenanceMode) {
    return "The platform is currently under maintenance. Please check back later or contact support if you need urgent assistance.";
  }

  // Post creation context
  if (context === 'post') {
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return "I can help you create a great post! Here are some tips:\n\n" +
             "• Be specific about what you need or offer\n" +
             "• Include relevant details like location, timing, and budget\n" +
             "• Use clear, descriptive language\n" +
             "• Add photos if relevant to your post";
    }
    
    if (lowerInput.includes('category') || lowerInput.includes('type')) {
      return "Choose the category that best fits your post:\n\n" +
             "• **Home Services**: Cleaning, repairs, maintenance\n" +
             "• **Delivery**: Transport, pickup, moving\n" +
             "• **Tutoring**: Education, lessons, homework help\n" +
             "• **Events**: Parties, catering, photography\n" +
             "• **Other**: Everything else";
    }
    
    if (lowerInput.includes('payment') || lowerInput.includes('money')) {
      if (!platformConfig?.paymentEnabled) {
        return "Payments are currently disabled on the platform. Please contact support for assistance.";
      }
      return "Payment information:\n\n" +
             "• Set your budget range when creating the post\n" +
             "• Payment is processed securely through our platform\n" +
             "• Transaction fee: " + (platformConfig?.transactionFee || 2.5) + "%\n" +
             "• Minimum payment: " + getPHPSymbol() + (platformConfig?.minimumPayment || 100);
    }
  }

  // Verification context
  if (context === 'verification') {
    if (!platformConfig?.selfieVerificationEnabled) {
      return "Selfie verification is currently disabled. Please contact support for assistance.";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('issue')) {
      return "Selfie verification help:\n\n" +
             "• Ensure good lighting and clear visibility\n" +
             "• Look directly at the camera\n" +
             "• Remove glasses or hats if possible\n" +
             "• Follow the on-screen instructions\n" +
             "• If issues persist, contact support";
    }
    
    if (lowerInput.includes('failed') || lowerInput.includes('error')) {
      return "If verification failed:\n\n" +
             "• Check your internet connection\n" +
             "• Try again with better lighting\n" +
             "• Ensure your face is clearly visible\n" +
             "• Contact support if problems continue";
    }
  }

  // Payment context
  if (context === 'payment') {
    if (!platformConfig?.paymentEnabled) {
      return "Payments are currently unavailable. Please try again later or contact support.";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return "Payment assistance:\n\n" +
             "• Ensure you have sufficient funds\n" +
             "• Check your payment method is valid\n" +
             "• Verify the amount is within limits\n" +
             "• Contact support for payment issues";
    }
  }

  // Admin context
  if (context === 'admin' && userRole === 'admin') {
    if (lowerInput.includes('config') || lowerInput.includes('settings')) {
      return "Admin configuration help:\n\n" +
             "• Access settings via /admin/settings\n" +
             "• Configure platform parameters\n" +
             "• Monitor system status\n" +
             "• Manage user permissions";
    }
    
    if (lowerInput.includes('maintenance')) {
      return "Maintenance mode controls:\n\n" +
             "• Enable/disable via admin settings\n" +
             "• Set maintenance message\n" +
             "• Monitor system status\n" +
             "• Coordinate with team";
    }
  }

  // General context
  if (context === 'general') {
    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return "How can I help you today?\n\n" +
             "• Create or manage posts\n" +
             "• Complete verification\n" +
             "• Process payments\n" +
             "• Get platform assistance";
    }
    
    if (lowerInput.includes('status') || lowerInput.includes('system')) {
      const status = [];
      if (platformConfig?.maintenanceMode) status.push("🛠️ Maintenance mode active");
      if (platformConfig?.debugMode) status.push("🐛 Debug mode enabled");
      if (platformConfig?.selfieVerificationEnabled) status.push("✅ Verification enabled");
      if (platformConfig?.paymentEnabled) status.push("💳 Payments enabled");
      
      return "Platform Status:\n\n" + status.join("\n") + "\n\nAI Model: " + (platformConfig?.aiModelVersion || 'v2.1.0');
    }
  }

  // Default response
  return "I'm here to help! Please let me know what you need assistance with regarding the Fixmotech platform.";
}

// Generate suggestions based on context
function generateSuggestions(context: string, userInput: string, userRole?: string): string[] {
  const lowerInput = userInput.toLowerCase();
  const suggestions: string[] = [];

  if (context === 'post') {
    suggestions.push("Add photos to your post");
    suggestions.push("Set a clear budget range");
    suggestions.push("Specify your location");
    suggestions.push("Include timing requirements");
  }

  if (context === 'verification') {
    suggestions.push("Ensure good lighting");
    suggestions.push("Remove glasses/hats");
    suggestions.push("Look directly at camera");
    suggestions.push("Follow on-screen prompts");
  }

  if (context === 'payment') {
    suggestions.push("Verify payment method");
    suggestions.push("Check account balance");
    suggestions.push("Review transaction details");
    suggestions.push("Contact support if needed");
  }

  if (context === 'admin' && userRole === 'admin') {
    suggestions.push("Review system logs");
    suggestions.push("Check user activity");
    suggestions.push("Monitor performance");
    suggestions.push("Update configurations");
  }

  return suggestions;
}

// Determine if action is required
function determineActionRequired(context: string, userInput: string, platformConfig?: any): {
  requiresAction: boolean;
  actionType?: 'none' | 'verification' | 'payment' | 'admin' | 'support';
} {
  const lowerInput = userInput.toLowerCase();

  if (platformConfig?.maintenanceMode) {
    return { requiresAction: true, actionType: 'support' };
  }

  if (context === 'verification' && lowerInput.includes('failed')) {
    return { requiresAction: true, actionType: 'verification' };
  }

  if (context === 'payment' && lowerInput.includes('error')) {
    return { requiresAction: true, actionType: 'payment' };
  }

  if (context === 'admin' && lowerInput.includes('urgent')) {
    return { requiresAction: true, actionType: 'admin' };
  }

  return { requiresAction: false, actionType: 'none' };
}

const fixmotechAssistantFlow = async (input: FixmotechAssistantInput): Promise<FixmotechAssistantOutput> => {
  const { userInput, context, userRole, platformConfig } = input;

  // Get current platform configuration if not provided
  let currentConfig = platformConfig;
  if (!currentConfig) {
    try {
      await configService.initialize();
      const config = configService.getConfig();
      currentConfig = {
        maintenanceMode: config.maintenanceMode,
        debugMode: config.debugMode,
        selfieVerificationEnabled: config.selfieVerificationEnabled,
        paymentEnabled: config.paymentEnabled,
        aiModelVersion: config.aiModelVersion,
        transactionFee: config.transactionFee,
        minimumPayment: config.minimumPayment,
      };
    } catch (error) {
      console.warn('Failed to load platform config, using defaults');
      currentConfig = {
        maintenanceMode: false,
        debugMode: false,
        selfieVerificationEnabled: true,
        paymentEnabled: true,
        aiModelVersion: 'v2.1.0',
      };
    }
  }

  // Generate context-aware response
  const response = generateContextAwareResponse(userInput, context, userRole, currentConfig);
  
  // Generate suggestions
  const suggestions = generateSuggestions(context, userInput, userRole);
  
  // Determine action requirements
  const { requiresAction, actionType } = determineActionRequired(context, userInput, currentConfig);
  
  // Calculate confidence based on context match and input clarity
  const confidence = Math.min(0.9, 0.7 + (userInput.length > 10 ? 0.1 : 0) + (context !== 'general' ? 0.1 : 0));

  return {
    response,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    contextAwareInfo: {
      isMaintenanceMode: currentConfig.maintenanceMode,
      verificationStatus: currentConfig.selfieVerificationEnabled ? 'enabled' : 'disabled',
      paymentStatus: currentConfig.paymentEnabled ? 'enabled' : 'disabled',
      aiModelInfo: `Using ${currentConfig.aiModelVersion}`,
    },
    confidence,
    requiresAction,
    actionType,
  };
}; 