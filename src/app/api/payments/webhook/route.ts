import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';
import { PaymentMethod } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const paymentMethod = searchParams.get('method') as PaymentMethod;

    if (!paymentMethod || !['gcash', 'paymaya'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Verify webhook signature (in production, you should verify the signature)
    // const signature = request.headers.get('x-signature');
    // if (!verifyWebhookSignature(body, signature, paymentMethod)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle the webhook
    await PaymentService.handlePaymentWebhook(paymentMethod, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    return NextResponse.json(
      { error: 'Failed to handle webhook' },
      { status: 500 }
    );
  }
}

// Helper function to verify webhook signatures (implement based on payment provider)
function verifyWebhookSignature(payload: any, signature: string | null, method: PaymentMethod): boolean {
  // In production, implement proper signature verification
  // For now, return true for development
  return true;
} 