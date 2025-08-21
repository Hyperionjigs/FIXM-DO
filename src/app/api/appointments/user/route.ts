import { NextRequest, NextResponse } from 'next/server';
import { SchedulingService } from '@/lib/scheduling-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') as 'client' | 'tasker';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['client', 'tasker'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be either "client" or "tasker"' },
        { status: 400 }
      );
    }

    const appointments = await SchedulingService.getUserAppointments(
      userId,
      role,
      status as any,
      limit
    );

    return NextResponse.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error getting user appointments:', error);
    return NextResponse.json(
      { error: 'Failed to get appointments' },
      { status: 500 }
    );
  }
} 