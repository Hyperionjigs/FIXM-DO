import { NextRequest, NextResponse } from 'next/server';
import { BonusService } from '@/lib/bonus-service';
import { getPHPSymbol } from '@/lib/currency-utils';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'PHP' } = await request.json();

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: `Donation amount too high. Maximum allowed is ${getPHPSymbol()}10,000.` },
        { status: 400 }
      );
    }

    // Add donation to pot money
    const success = await BonusService.addDonation(amount, currency);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to process donation. Please try again.' },
        { status: 500 }
      );
    }

    // Get updated pot money stats
    const stats = await BonusService.getPotMoneyStats();

    return NextResponse.json({
      success: true,
      message: `Thank you for your donation of ${getPHPSymbol()}${amount.toFixed(2)}!`,
      stats
    });

  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await BonusService.getPotMoneyStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching pot money stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 