import { NextRequest, NextResponse } from 'next/server';
import { SchedulingService } from '@/lib/scheduling-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskerId = searchParams.get('taskerId');

    if (!taskerId) {
      return NextResponse.json(
        { error: 'taskerId is required' },
        { status: 400 }
      );
    }

    const availabilitySlots = await SchedulingService.getAvailabilitySlots(taskerId);

    return NextResponse.json({
      success: true,
      availabilitySlots
    });
  } catch (error) {
    console.error('Error getting availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to get availability slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskerId, slots } = body;

    if (!taskerId || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'taskerId and slots array are required' },
        { status: 400 }
      );
    }

    await SchedulingService.setAvailabilitySlots(taskerId, slots);

    return NextResponse.json({
      success: true,
      message: 'Availability slots updated successfully'
    });
  } catch (error) {
    console.error('Error setting availability slots:', error);
    return NextResponse.json(
      { error: 'Failed to set availability slots' },
      { status: 500 }
    );
  }
} 