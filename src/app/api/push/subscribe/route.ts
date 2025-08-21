import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Store subscription in Firestore
    const subscriptionId = btoa(subscription.endpoint).replace(/[^a-zA-Z0-9]/g, '');
    const subscriptionRef = doc(db, 'push-subscriptions', subscriptionId);
    
    await setDoc(subscriptionRef, {
      subscription: subscription,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    console.log('[PWA] Push subscription stored:', subscriptionId);

    return NextResponse.json({ 
      success: true, 
      subscriptionId 
    });

  } catch (error) {
    console.error('[PWA] Failed to store push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to store subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      );
    }

    const subscriptionRef = doc(db, 'push-subscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (!subscriptionDoc.exists()) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionDoc.data()
    });

  } catch (error) {
    console.error('[PWA] Failed to retrieve push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve subscription' },
      { status: 500 }
    );
  }
} 