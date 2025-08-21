import { NextRequest, NextResponse } from 'next/server';
import { fixmotechAssistant } from '@/ai/flows/fixmotech-assistant-flow';
import { configService } from '@/lib/config-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    if (!body.userInput || typeof body.userInput !== 'string') {
      return NextResponse.json(
        { error: 'userInput is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.context || !['post', 'verification', 'payment', 'general', 'admin'].includes(body.context)) {
      return NextResponse.json(
        { error: 'context is required and must be one of: post, verification, payment, general, admin' },
        { status: 400 }
      );
    }

    // Get current platform configuration
    let platformConfig;
    try {
      await configService.initialize();
      const config = configService.getConfig();
      platformConfig = {
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
      platformConfig = {
        maintenanceMode: false,
        debugMode: false,
        selfieVerificationEnabled: true,
        paymentEnabled: true,
        aiModelVersion: 'v2.1.0',
      };
    }

    const result = await fixmotechAssistant({
      userInput: body.userInput,
      context: body.context,
      userRole: body.userRole,
      conversationHistory: body.conversationHistory,
      platformConfig,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in fixmotech-assistant API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process assistant request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 