import { NextRequest, NextResponse } from 'next/server';
import { DisbursementService } from '@/lib/disbursement-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const disbursementId = id;
    
    if (!disbursementId) {
      return NextResponse.json(
        { success: false, error: 'Disbursement ID is required' },
        { status: 400 }
      );
    }

    const disbursement = await DisbursementService.getDisbursement(disbursementId);

    if (!disbursement) {
      return NextResponse.json(
        { success: false, error: 'Disbursement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      disbursement
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const disbursementId = id;
    const body = await request.json();
    
    if (!disbursementId) {
      return NextResponse.json(
        { success: false, error: 'Disbursement ID is required' },
        { status: 400 }
      );
    }

    const { action, adminId, paymentProof, notes, reason } = body;

    let success = false;

    switch (action) {
      case 'mark_processing':
        success = await DisbursementService.markAsProcessing(disbursementId, adminId);
        break;
      
      case 'complete':
        success = await DisbursementService.completeDisbursement(
          disbursementId, 
          adminId, 
          paymentProof, 
          notes
        );
        break;
      
      case 'cancel':
        if (!reason) {
          return NextResponse.json(
            { success: false, error: 'Reason is required for cancellation' },
            { status: 400 }
          );
        }
        success = await DisbursementService.cancelDisbursement(disbursementId, adminId, reason);
        break;
      
      case 'upload_proof':
        if (!paymentProof) {
          return NextResponse.json(
            { success: false, error: 'Payment proof is required' },
            { status: 400 }
          );
        }
        success = await DisbursementService.uploadPaymentProof(disbursementId, paymentProof);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Disbursement ${action} successful`
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Failed to ${action} disbursement` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Disbursement update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 