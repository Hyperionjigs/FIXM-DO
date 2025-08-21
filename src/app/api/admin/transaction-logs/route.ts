import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, getDocs, where, limit, startAfter, QueryDocumentSnapshot, Firestore, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TransactionLog } from '@/types';
import { isAdmin, hasPermission } from '@/lib/admin-config';

/**
 * GET /api/admin/transaction-logs
 * Retrieve transaction logs with filtering and pagination
 * ADMIN ONLY ACCESS
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // In a real implementation, you would verify the JWT token here
    // For now, we'll use a simple approach - you should implement proper JWT verification
    // const decodedToken = await verifyIdToken(token);
    // const userId = decodedToken.uid;
    
    // For demonstration, we'll extract user ID from a custom header
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    // Check if user is admin and has permission to view transaction logs
    if (!isAdmin(userId) || !hasPermission(userId, 'view_transaction_logs')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const transactionType = searchParams.get('transactionType');
    const clientId = searchParams.get('clientId');
    const taskerId = searchParams.get('taskerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100); // Max 100 per page

    // Build query
    let q = query(collection(db as Firestore, 'transaction_logs'), orderBy('createdAt', 'desc'));

    // Add filters
    if (taskId) {
      q = query(q, where('taskId', '==', taskId));
    }
    if (transactionType) {
      q = query(q, where('transactionType', '==', transactionType));
    }
    if (clientId) {
      q = query(q, where('clientId', '==', clientId));
    }
    if (taskerId) {
      q = query(q, where('taskerId', '==', taskerId));
    }
    if (status) {
      q = query(q, where('status', '==', status));
    }
    if (startDate) {
      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      q = query(q, where('createdAt', '>=', startTimestamp));
    }
    if (endDate) {
      const endTimestamp = Timestamp.fromDate(new Date(endDate));
      q = query(q, where('createdAt', '<=', endTimestamp));
    }

    // Add pagination
    q = query(q, limit(pageSize));

    // Execute query
    const querySnapshot = await getDocs(q);
    const transactionLogs: TransactionLog[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactionLogs.push({
        id: doc.id,
        ...data,
      } as TransactionLog);
    });

    // Calculate pagination info
    const totalCount = transactionLogs.length; // Note: This is just the current page count
    const hasNextPage = transactionLogs.length === pageSize;

    return NextResponse.json({
      success: true,
      data: {
        transactionLogs,
        pagination: {
          page,
          pageSize,
          totalCount,
          hasNextPage,
        },
        filters: {
          taskId,
          transactionType,
          clientId,
          taskerId,
          status,
          startDate,
          endDate,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching transaction logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/transaction-logs/export
 * Export transaction logs as a secure file
 * ADMIN ONLY ACCESS
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access (same as GET)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing or invalid authorization header' }, { status: 401 });
    }

    const userId = request.headers.get('x-user-id');
    if (!userId || !isAdmin(userId) || !hasPermission(userId, 'export_transaction_logs')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { filters, format = 'json' } = body;

    // Build query with filters
    let q = query(collection(db as Firestore, 'transaction_logs'), orderBy('createdAt', 'desc'));

    if (filters) {
      if (filters.taskId) {
        q = query(q, where('taskId', '==', filters.taskId));
      }
      if (filters.transactionType) {
        q = query(q, where('transactionType', '==', filters.transactionType));
      }
      if (filters.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }
      if (filters.taskerId) {
        q = query(q, where('taskerId', '==', filters.taskerId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.startDate) {
        const startTimestamp = Timestamp.fromDate(new Date(filters.startDate));
        q = query(q, where('createdAt', '>=', startTimestamp));
      }
      if (filters.endDate) {
        const endTimestamp = Timestamp.fromDate(new Date(filters.endDate));
        q = query(q, where('createdAt', '<=', endTimestamp));
      }
    }

    // Limit export size for security
    q = query(q, limit(1000));

    const querySnapshot = await getDocs(q);
    const transactionLogs: TransactionLog[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactionLogs.push({
        id: doc.id,
        ...data,
      } as TransactionLog);
    });

    // Create export data
    const exportData = {
      exportInfo: {
        exportedBy: userId,
        exportedAt: new Date().toISOString(),
        totalRecords: transactionLogs.length,
        filters: filters || {},
        format,
      },
      transactionLogs,
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Transaction ID',
        'Task ID',
        'Transaction Type',
        'Client ID',
        'Client Name',
        'Tasker ID',
        'Tasker Name',
        'Amount',
        'Currency',
        'Status',
        'Description',
        'IP Address',
        'Created At',
        'Completed At',
      ];

      const csvRows = transactionLogs.map(log => [
        log.transactionId,
        log.taskId,
        log.transactionType,
        log.clientId,
        log.clientName,
        log.taskerId || '',
        log.taskerName || '',
        log.amount || '',
        log.currency || '',
        log.status,
        log.description,
        log.ipAddress || '',
        log.createdAt.toDate().toISOString(),
        log.completedAt?.toDate().toISOString() || '',
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transaction-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default JSON format
    return NextResponse.json({
      success: true,
      data: exportData,
    });

  } catch (error) {
    console.error('Error exporting transaction logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 