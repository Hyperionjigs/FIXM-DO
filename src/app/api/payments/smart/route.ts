import { NextRequest, NextResponse } from 'next/server';
import { SmartPaymentService, SmartPaymentRequest } from '@/lib/smart-payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { amount, currency, description, customerName, customerPhone, paymentMethod } = body;
    
    if (!amount || !customerName || !customerPhone || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create smart payment request
    const paymentRequest: SmartPaymentRequest = {
      amount: parseFloat(amount),
      currency: currency || 'PHP',
      referenceNumber: body.referenceNumber || `FIXMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      description: description || `Payment for ${customerName}`,
      customerName,
      customerEmail: body.customerEmail,
      customerPhone,
      paymentMethod: paymentMethod as 'gcash' | 'paymaya' | 'gotyme',
      priority: body.priority || 'normal',
      customerRiskLevel: body.customerRiskLevel || 'low',
      expiresIn: body.expiresIn || 60
    };

    // Create smart payment
    const response = await SmartPaymentService.createSmartPayment(paymentRequest);

    if (response.success) {
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { success: false, error: response.errorMessage },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Smart payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const action = searchParams.get('action');

    if (action === 'analytics') {
      // Get payment analytics
      const analytics = await SmartPaymentService.getPaymentAnalytics();
      return NextResponse.json({ success: true, analytics });
    }

    if (paymentId) {
      // Get specific payment
      const payment = await SmartPaymentService.getPayment(paymentId);
      if (payment) {
        return NextResponse.json({ success: true, payment });
      } else {
        return NextResponse.json(
          { success: false, error: 'Payment not found' },
          { status: 404 }
        );
      }
    }

    // Get pending payments
    const limit = parseInt(searchParams.get('limit') || '50');
    const pendingPayments = await SmartPaymentService.getPendingPayments(limit);
    
    return NextResponse.json({ success: true, payments: pendingPayments });

  } catch (error) {
    console.error('Smart payment GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, action, adminId, notes, reason } = body;

    if (!paymentId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'confirm':
        success = await SmartPaymentService.confirmPayment(paymentId, adminId || 'system', notes);
        break;
      
      case 'detect':
        success = await SmartPaymentService.detectPayment(paymentId);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to process action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Smart payment PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 