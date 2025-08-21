import { NextRequest, NextResponse } from 'next/server';
import { SchedulingService } from '@/lib/scheduling-service';
import { useAuth } from '@/hooks/use-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      taskerId,
      taskerName,
      title,
      description,
      appointmentType,
      startTime,
      endTime,
      duration,
      location
    } = body;

    if (!taskerId || !taskerName || !title || !startTime || !endTime || !duration || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user (you'll need to implement proper authentication)
    // For now, we'll use a placeholder
    const clientId = 'current-user-id'; // Replace with actual user ID
    const clientName = 'Current User'; // Replace with actual user name

    // Check if the time slot is available
    const isAvailable = await SchedulingService.isTimeSlotAvailable(
      taskerId,
      new Date(startTime),
      new Date(endTime)
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await SchedulingService.createAppointment({
      clientId,
      clientName,
      taskerId,
      taskerName,
      title,
      description,
      appointmentType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      location,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 