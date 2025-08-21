import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';
import { getWallet, WalletName } from '@/lib/wallets';

/**
 * POST /api/payments/checkout
 *
 * Body:
 * {
 *   amount: number;
 *   currency?: string; // default: "PHP"
 *   paymentMethod: WalletName;
 *   description?: string;
 *   customerName: string;
 * }
 *
 * The route creates a pending Firestore transaction and immediately
 * returns the static wallet instructions so the payer can complete the transfer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      amount,
      paymentMethod,
      customerName,
      currency = 'PHP',
      description = '',
    } = body as {
      amount?: number;
      paymentMethod?: WalletName;
      customerName?: string;
      currency?: string;
      description?: string;
    };

    if (!amount || !paymentMethod || !customerName) {
      return NextResponse.json(
        { error: 'amount, paymentMethod and customerName are required' },
        { status: 400 },
      );
    }

    // Generate unique reference number (FIX-<timestamp>)
    const referenceNumber = `FIX-${Date.now()}`;

    // Persist transaction (non-blocking). We await here so we can get doc ID back
    const transaction = await PaymentService.createPaymentTransaction({
      payerId: customerName, // substitute with auth uid when available
      payerName: customerName,
      payeeId: 'platform',
      payeeName: 'Fixmotech Platform',
      amount,
      currency,
      paymentMethod,
      status: 'pending',
      referenceNumber,
      description,
    });

    const wallet = getWallet(paymentMethod);

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      wallet: wallet.name,
      accountNumber: wallet.accountNumber,
      qrCodeUrl: wallet.qrCodeUrl,
      referenceNumber,
      amount,
      currency,
      message: `Please transfer ${currency} ${amount} to ${wallet.displayName} (${wallet.accountNumber}) and include the reference # ${referenceNumber} in the notes or remarks field.`,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}