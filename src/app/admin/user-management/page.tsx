"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Shield, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isAdmin, hasPermission } from '@/lib/admin-config';
import { collection, query, getDocs, where, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  createdAt: any;
  lastSignInTime: any;
  photoVerified: boolean;
  idVerified: boolean;
  isActive: boolean;
  role: string;
  location?: string;
  bio?: string;
  tasksCompleted: number;
  averageRating: number;
  totalReviews: number;
}

interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Check if user is admin
  const userIsAdmin = user && isAdmin(user.uid, user.email || null);
  const canManageUsers = user && hasPermission(user.uid, 'manage_users', user.email || null);

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

    loadUsers();
  }, [user, userIsAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, verificationFilter, sortBy, sortOrder]);

  const loadUsers = async () => {
    if (!user || !userIsAdmin) return;

    setLoading(true);
    try {
      // Fetch users from Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown User',
          photoURL: data.photoURL,
          emailVerified: data.emailVerified || false,
          phoneNumber: data.phoneNumber,
          createdAt: data.createdAt,
          lastSignInTime: data.lastSignInTime,
          photoVerified: data.photoVerified || false,
          idVerified: data.idVerified || false,
          isActive: data.isActive !== false,
          role: data.role || 'user',
          location: data.location,
          bio: data.bio,
          tasksCompleted: data.tasksCompleted || 0,
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
        });
      });

      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData: User[]) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: UserStats = {
      totalUsers: usersData.length,
      verifiedUsers: usersData.filter(u => u.photoVerified && u.idVerified).length,
      activeUsers: usersData.filter(u => u.isActive).length,
      newUsersThisMonth: usersData.filter(u => {
        if (!u.createdAt) return false;
        const createdAt = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt > oneMonthAgo;
      }).length,
    };

    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.isActive;
        if (statusFilter === 'inactive') return !user.isActive;
        return true;
      });
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (verificationFilter === 'verified') return user.photoVerified && user.idVerified;
        if (verificationFilter === 'unverified') return !user.photoVerified || !user.idVerified;
        if (verificationFilter === 'photo-only') return user.photoVerified && !user.idVerified;
        if (verificationFilter === 'id-only') return !user.photoVerified && user.idVerified;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === 'createdAt' || sortBy === 'lastSignInTime') {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: string) => {
    if (!canManageUsers) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to manage users.',
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      
      switch (action) {
        case 'activate':
          await updateDoc(userRef, { isActive: true });
          toast({ title: 'User activated successfully' });
          break;
        case 'deactivate':
          await updateDoc(userRef, { isActive: false });
          toast({ title: 'User deactivated successfully' });
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await deleteDoc(userRef);
            toast({ title: 'User deleted successfully' });
          }
          break;
      }

      // Reload users
      loadUsers();
    } catch (error) {
      console.error('Error performing user action:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to perform user action.',
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['UID', 'Email', 'Display Name', 'Email Verified', 'Photo Verified', 'ID Verified', 'Active', 'Created At', 'Last Sign In', 'Tasks Completed', 'Average Rating'],
      ...filteredUsers.map(user => [
        user.uid,
        user.email,
        user.displayName,
        user.emailVerified ? 'Yes' : 'No',
        user.photoVerified ? 'Yes' : 'No',
        user.idVerified ? 'Yes' : 'No',
        user.isActive ? 'Yes' : 'No',
        user.createdAt?.toDate ? user.createdAt.toDate().toISOString() : user.createdAt,
        user.lastSignInTime?.toDate ? user.lastSignInTime.toDate().toISOString() : user.lastSignInTime,
        user.tasksCompleted,
        user.averageRating
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor all users in your platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportUsers} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={loadUsers} variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Fully Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="photo-only">Photo Only</SelectItem>
                <SelectItem value="id-only">ID Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="lastSignInTime">Last Sign In</SelectItem>
                <SelectItem value="displayName">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="tasksCompleted">Tasks Completed</SelectItem>
                <SelectItem value="averageRating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground">{user.uid}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                            {user.emailVerified && <CheckCircle className="h-3 w-3 text-green-600" />}
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{user.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {user.photoVerified ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span className="text-sm">Photo</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.idVerified ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span className="text-sm">ID</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {user.tasksCompleted} tasks completed
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.averageRating > 0 ? `${user.averageRating.toFixed(1)}/5 rating` : 'No rating'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.createdAt?.toDate ? 
                              `Joined ${user.createdAt.toDate().toLocaleDateString()}` : 
                              'Unknown join date'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/profile/${user.uid}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            {canManageUsers && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.uid, user.isActive ? 'deactivate' : 'activate')}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.uid, 'delete')}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 