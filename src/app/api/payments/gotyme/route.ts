import { NextRequest, NextResponse } from 'next/server';
import { GotymeService } from '@/lib/gotyme-service';
import { GotymePaymentRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const paymentRequest: GotymePaymentRequest = {
      amount: body.amount,
      currency: body.currency || 'PHP',
      referenceNumber: body.referenceNumber,
      description: body.description,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      redirectUrl: body.redirectUrl,
      webhookUrl: body.webhookUrl
    };

    // Initialize Gotyme service
    const gotymeService = GotymeService.initialize();

    // Create payment
    const result = await gotymeService.createPayment(paymentRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        qrCode: result.qrCode,
        message: 'Gotyme payment created successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errorMessage || 'Failed to create Gotyme payment' 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Gotyme payment API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Initialize Gotyme service
    const gotymeService = GotymeService.initialize();

    // Check payment status
    const status = await gotymeService.checkPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      message: 'Payment status retrieved successfully'
    });
  } catch (error) {
    console.error('Gotyme status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 