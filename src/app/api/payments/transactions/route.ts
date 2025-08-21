import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') as 'payer' | 'payee';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['payer', 'payee'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be either "payer" or "payee"' },
        { status: 400 }
      );
    }

    const transactions = await PaymentService.getUserTransactions(userId, role, limit);

    return NextResponse.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
} 