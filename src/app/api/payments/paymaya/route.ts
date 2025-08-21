import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      amount,
      currency = 'PHP',
      referenceNumber,
      description,
      customerName,
      customerEmail,
      customerPhone,
      redirectUrl
    } = body;

    if (!amount || !referenceNumber || !description || !customerName || !redirectUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, referenceNumber, description, customerName, redirectUrl' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Process PayMaya payment
    const response = await PaymentService.processPayMayaPayment({
      amount,
      currency,
      referenceNumber,
      description,
      customerName,
      customerEmail,
      customerPhone,
      redirectUrl
    });

    if (response.success) {
      return NextResponse.json({
        success: true,
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl,
        qrCode: response.qrCode
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: response.errorMessage 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing PayMaya payment:', error);
    return NextResponse.json(
      { error: 'Failed to process PayMaya payment' },
      { status: 500 }
    );
  }
} 