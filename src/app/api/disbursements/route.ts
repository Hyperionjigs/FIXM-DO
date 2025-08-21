import { NextRequest, NextResponse } from 'next/server';
import { DisbursementService, DisbursementRequest } from '@/lib/disbursement-service';
import { isAdmin } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const disbursementRequest: DisbursementRequest = {
      taskerId: body.taskerId,
      taskerName: body.taskerName,
      taskerPhone: body.taskerPhone,
      taskerEmail: body.taskerEmail,
      amount: body.amount,
      currency: body.currency || 'PHP',
      taskId: body.taskId,
      taskTitle: body.taskTitle,
      taskNumber: body.taskNumber,
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber,
      description: body.description,
      adminId: body.adminId,
      adminName: body.adminName
    };

    // Create disbursement
    const result = await DisbursementService.createDisbursement(disbursementRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        disbursementId: result.disbursementId,
        referenceNumber: result.referenceNumber,
        paymentInstructions: result.paymentInstructions,
        accountInfo: result.accountInfo,
        message: 'Disbursement created successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errorMessage || 'Failed to create disbursement' 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Disbursement creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskerId = searchParams.get('taskerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let disbursements;

    if (taskerId) {
      // Get disbursements for specific tasker
      disbursements = await DisbursementService.getTaskerDisbursements(taskerId, limit);
    } else if (status === 'pending') {
      // Get pending disbursements
      disbursements = await DisbursementService.getPendingDisbursements(limit);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      disbursements,
      count: disbursements.length
    });
  } catch (error) {
    console.error('Disbursement retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 