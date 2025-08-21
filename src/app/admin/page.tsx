"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  Activity,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Bug
} from 'lucide-react';
import Link from 'next/link';
import { isAdmin, hasPermission, getAdminUserInfo } from '@/lib/admin-config';
import { getPHPSymbol } from '@/lib/currency-utils';

interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTasks: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeDisputes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const userIsAdmin = user && isAdmin(user.uid, user.email || null);
  const adminInfo = user ? getAdminUserInfo(user.uid, user.email || null) : null;

  useEffect(() => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
      });
      return;
    }

    if (!userIsAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
      });
      return;
    }

    fetchAdminStats();
  }, [user, userIsAdmin]);

  const fetchAdminStats = async () => {
    if (!user || !userIsAdmin) return;

    setLoading(true);
    try {
      // For now, we'll use mock data
      // In production, this would fetch from your API
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalTasks: 892,
        totalTransactions: 2156,
        totalRevenue: 45678.90,
        pendingVerifications: 23,
        activeDisputes: 5,
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch admin statistics.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.displayName || user.email}. Manage your Fixmotech platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/debug">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Debug Tools
              </Button>
            </Link>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {adminInfo?.role || 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <span className="text-2xl font-bold text-muted-foreground">{getPHPSymbol()}</span>
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold">{getPHPSymbol()}{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDisputes}</div>
            <p className="text-xs text-muted-foreground">
              Need resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/verification-queue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review and approve pending user verifications
              </p>
              <Button variant="outline" className="w-full">
                Review Verifications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/transaction-logs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and export detailed transaction records
              </p>
              <Button variant="outline" className="w-full">
                View Logs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage user accounts and permissions
              </p>
              <Button variant="outline" className="w-full">
                Manage Users
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure platform settings and preferences
              </p>
              <Button variant="outline" className="w-full">
                Open Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/debug">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access debugging tools, storage management, and system diagnostics
              </p>
              <Button variant="outline" className="w-full">
                Open Debug Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New user registration</p>
                <p className="text-xs text-muted-foreground">john.doe@example.com joined 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <span className="text-lg font-bold text-blue-500">{getPHPSymbol()}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment processed</p>
                <p className="text-xs text-muted-foreground">Task #1234 payment completed 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Verification pending</p>
                <p className="text-xs text-muted-foreground">Selfie verification submitted 10 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 