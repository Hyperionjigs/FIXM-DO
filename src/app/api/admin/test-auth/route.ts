import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, hasPermission, isAdminByEmailDomain, isAdminByUserId, getUserPermissions } from '@/lib/admin-config';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized - Missing or invalid authorization header',
        authHeader: authHeader ? 'Present but invalid format' : 'Missing'
      }, { status: 401 });
    }

    // Extract and verify the Firebase JWT token
    const token = authHeader.substring(7);
    let userId: string;
    let userEmail: string | null;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      userEmail = decodedToken.email;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ 
        error: 'Unauthorized - Invalid token',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - User ID required' }, { status: 401 });
    }

    // Test admin access
    const adminCheck = {
      userId,
      userEmail,
      isAdmin: isAdmin(userId, userEmail),
      isAdminByEmail: isAdminByEmailDomain(userEmail),
      isAdminByUserId: isAdminByUserId(userId),
      hasManageSystemPermission: hasPermission(userId, 'manage_system', userEmail),
      allPermissions: getUserPermissions(userId, userEmail),
      emailDomain: userEmail ? userEmail.split('@')[1] : null,
      adminEmailDomains: ['fixmotech.org', 'admin.fixmotech.org', 'fixmotech.com']
    };

    console.log('Admin test:', adminCheck);

    return NextResponse.json({
      success: true,
      message: 'Authentication test completed',
      user: {
        userId,
        userEmail,
        isAdmin: adminCheck.isAdmin,
        permissions: adminCheck.allPermissions
      },
      debug: adminCheck
    });

  } catch (error) {
    console.error('Error in auth test:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 