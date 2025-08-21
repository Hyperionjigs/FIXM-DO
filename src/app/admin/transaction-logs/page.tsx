"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Search, Filter, Eye, Calendar, Users, FileText } from 'lucide-react';
import { formatPHP } from '@/lib/currency-utils';
import type { TransactionLog, TransactionType } from '@/types';
import { isAdmin, hasPermission } from '@/lib/admin-config';

interface TransactionLogsResponse {
  success: boolean;
  data: {
    transactionLogs: TransactionLog[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      hasNextPage: boolean;
    };
    filters: Record<string, any>;
  };
}

export default function AdminTransactionLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    taskId: '',
    transactionType: '',
    clientId: '',
    taskerId: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState<TransactionLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Check if user is admin
  const userIsAdmin = user && isAdmin(user.uid, user.email || null);

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

    fetchTransactionLogs();
  }, [user, userIsAdmin]);

  const fetchTransactionLogs = async () => {
    if (!user || !userIsAdmin) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/admin/transaction-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'x-user-id': user.uid,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction logs');
      }

      const data: TransactionLogsResponse = await response.json();
      setTransactionLogs(data.data.transactionLogs);
    } catch (error) {
      console.error('Error fetching transaction logs:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch transaction logs.',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTransactionLogs = async (format: 'json' | 'csv' = 'json') => {
    if (!user || !userIsAdmin) return;

    try {
      const response = await fetch('/api/admin/transaction-logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'x-user-id': user.uid,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export transaction logs');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Export Successful',
        description: `Transaction logs exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error exporting transaction logs:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export transaction logs.',
      });
    }
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    const colors: Record<TransactionType, string> = {
      task_created: 'bg-blue-100 text-blue-800',
      task_claimed: 'bg-green-100 text-green-800',
      task_completed: 'bg-purple-100 text-purple-800',
      review_submitted: 'bg-yellow-100 text-yellow-800',
      payment_processed: 'bg-emerald-100 text-emerald-800',
      dispute_filed: 'bg-red-100 text-red-800',
      refund_issued: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return 'N/A';
    if (currency === 'PHP' || !currency) {
      return formatPHP(amount);
    }
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Logs</h1>
        <p className="text-muted-foreground">
          Secure audit trail of all transactions between taskers and clients.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Task ID"
              value={filters.taskId}
              onChange={(e) => setFilters({ ...filters, taskId: e.target.value })}
            />
            <Select value={filters.transactionType} onValueChange={(value) => setFilters({ ...filters, transactionType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="task_created">Task Created</SelectItem>
                <SelectItem value="task_claimed">Task Claimed</SelectItem>
                <SelectItem value="task_completed">Task Completed</SelectItem>
                <SelectItem value="review_submitted">Review Submitted</SelectItem>
                <SelectItem value="payment_processed">Payment Processed</SelectItem>
                <SelectItem value="dispute_filed">Dispute Filed</SelectItem>
                <SelectItem value="refund_issued">Refund Issued</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Client ID"
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            />
            <Input
              placeholder="Tasker ID"
              value={filters.taskerId}
              onChange={(e) => setFilters({ ...filters, taskerId: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchTransactionLogs} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-2 mb-6">
        <Button onClick={() => exportTransactionLogs('json')} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        <Button onClick={() => exportTransactionLogs('csv')} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Transaction Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Logs ({transactionLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading transaction logs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Tasker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.transactionId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(log.transactionType)}>
                        {log.transactionType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.taskId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.clientName}</div>
                        <div className="text-sm text-muted-foreground">{log.clientId.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.taskerName ? (
                        <div>
                          <div className="font-medium">{log.taskerName}</div>
                          <div className="text-sm text-muted-foreground">{log.taskerId?.slice(0, 8)}...</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatAmount(log.amount, log.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDetailDialogOpen && selectedLog?.id === log.id} onOpenChange={(open) => {
                        setIsDetailDialogOpen(open);
                        if (!open) setSelectedLog(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Transaction ID</label>
                                  <p className="text-sm font-mono">{selectedLog.transactionId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Task ID</label>
                                  <p className="text-sm font-mono">{selectedLog.taskId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <Badge className={getTransactionTypeColor(selectedLog.transactionType)}>
                                    {selectedLog.transactionType.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Badge variant={selectedLog.status === 'completed' ? 'default' : 'secondary'}>
                                    {selectedLog.status}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Amount</label>
                                  <p className="text-sm">{formatAmount(selectedLog.amount, selectedLog.currency)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">IP Address</label>
                                  <p className="text-sm">{selectedLog.ipAddress || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm">{selectedLog.description}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Metadata</label>
                                <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Created</label>
                                  <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Completed</label>
                                  <p className="text-sm">{formatDate(selectedLog.completedAt)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && transactionLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transaction logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 