import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get task details from Firestore
    const taskDoc = await getDoc(doc(db as Firestore, 'posts', taskId));
    
    if (!taskDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const taskData = taskDoc.data();
    const task = {
      id: taskDoc.id,
      ...taskData
    };

    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Task retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 