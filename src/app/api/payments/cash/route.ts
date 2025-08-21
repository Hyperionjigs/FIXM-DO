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
      customerPhone
    } = body;

    if (!amount || !referenceNumber || !description || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, referenceNumber, description, customerName' },
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

    // Process cash payment
    const transaction = await PaymentService.processCashPayment(
      amount,
      currency,
      customerName, // This should be the actual user ID
      customerName,
      'platform', // Platform account
      'Fixmotech Platform',
      description
    );

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: 'Cash payment recorded successfully'
    });
  } catch (error) {
    console.error('Error processing cash payment:', error);
    return NextResponse.json(
      { error: 'Failed to process cash payment' },
      { status: 500 }
    );
  }
} 