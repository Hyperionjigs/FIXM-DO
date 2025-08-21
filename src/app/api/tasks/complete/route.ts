import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Firestore, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BonusService } from '@/lib/bonus-service';
import { NotificationService } from '@/lib/notifications';
import { getPHPSymbol } from '@/lib/currency-utils';

export async function POST(request: NextRequest) {
  try {
    const { taskId, taskerId, tipAmount = 0 } = await request.json();

    // Validate input
    if (!taskId || !taskerId) {
      return NextResponse.json(
        { error: 'Task ID and tasker ID are required.' },
        { status: 400 }
      );
    }

    // Get task details
    const taskDoc = await getDoc(doc(db as Firestore, 'posts', taskId));
    if (!taskDoc.exists()) {
      return NextResponse.json(
        { error: 'Task not found.' },
        { status: 404 }
      );
    }

    const task = taskDoc.data();
    
    // Verify tasker is assigned to this task
    if (task.taskerId !== taskerId) {
      return NextResponse.json(
        { error: 'Unauthorized. You are not assigned to this task.' },
        { status: 403 }
      );
    }

    // Check if task is already completed
    if (task.status === 'completed') {
      return NextResponse.json(
        { error: 'Task is already completed.' },
        { status: 400 }
      );
    }

    // Calculate bonus
    const bonus = await BonusService.calculateBonus(
      taskId,
      taskerId,
      task.taskerName || 'Anonymous',
      task.authorId,
      task.authorName,
      task.pay,
      tipAmount
    );

    // Update task status to completed
    await updateDoc(doc(db as Firestore, 'posts', taskId), {
      status: 'completed',
      completedAt: Timestamp.now()
    });

    let paymentBreakdown = null;
    let bonusMessage = '';

    // Process bonus if available
    if (bonus) {
      paymentBreakdown = await BonusService.processBonus(bonus);
      bonusMessage = `🎉 Congratulations! You received a random bonus of ${getPHPSymbol()}${bonus.bonusAmount.toFixed(2)}!`;
    }

    // Send notifications
    await NotificationService.notifyTaskCompleted(
      taskId,
      task.title,
      task.authorId,
      taskerId,
      task.authorName
    );

    // Prepare response
    const response: any = {
      success: true,
      message: 'Task completed successfully!',
      taskId,
      basePayment: task.pay,
      tipAmount,
      totalAmount: task.pay + tipAmount
    };

    if (bonus && paymentBreakdown) {
      response.bonus = {
        amount: bonus.bonusAmount,
        percentage: bonus.bonusPercentage,
        message: bonusMessage
      };
      response.paymentBreakdown = paymentBreakdown;
      response.totalAmount = paymentBreakdown.totalAmount;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 