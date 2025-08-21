"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  CreditCard, 
  Smartphone, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Upload,
  Eye,
  FileText,
  Hash
} from 'lucide-react';

interface Disbursement {
  id: string;
  taskerId: string;
  taskerName: string;
  taskerPhone: string;
  taskerEmail?: string;
  amount: number;
  currency: string;
  taskId: string;
  taskTitle: string;
  taskNumber?: string; // New field for unique task number
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  referenceNumber: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  adminId: string;
  adminName: string;
  paymentProof?: string;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DisbursementRequest {
  taskerId: string;
  taskerName: string;
  taskerPhone: string;
  taskerEmail?: string;
  amount: number;
  currency: string;
  taskId: string;
  taskTitle: string;
  taskNumber: string; // New field for unique task number
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  referenceNumber?: string;
  description?: string;
  adminId: string;
  adminName: string;
}

export function DisbursementManager() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [loadingTaskDetails, setLoadingTaskDetails] = useState(false);

  // Form state for creating disbursement
  const [formData, setFormData] = useState<DisbursementRequest>({
    taskerId: '',
    taskerName: '',
    taskerPhone: '',
    taskerEmail: '',
    amount: 0,
    currency: 'PHP',
    taskId: '',
    taskTitle: '',
    taskNumber: '', // New field
    paymentMethod: 'gcash',
    description: '',
    adminId: 'admin-user-id', // This should come from auth context
    adminName: 'FixMo Admin'
  });

  useEffect(() => {
    fetchPendingDisbursements();
  }, []);

  const fetchPendingDisbursements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/disbursements?status=pending');
      const data = await response.json();
      
      if (data.success) {
        setDisbursements(data.disbursements);
      }
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate unique task number
   */
  const generateTaskNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TASK-${timestamp.slice(-6)}-${random}`;
  };

  /**
   * Fetch task details and generate transaction description
   */
  const fetchTaskDetails = async (taskId: string) => {
    if (!taskId) return;
    
    setLoadingTaskDetails(true);
    try {
      // Try to fetch task details from the posts collection
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTaskDetails(data.task);
      } else {
        // If task not found, create a basic structure
        setTaskDetails({
          id: taskId,
          title: formData.taskTitle,
          status: 'completed',
          createdAt: new Date(),
          completedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      // Create a basic structure if fetch fails
      setTaskDetails({
        id: taskId,
        title: formData.taskTitle,
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      });
    } finally {
      setLoadingTaskDetails(false);
    }
  };

  /**
   * Generate transaction description based on task details
   */
  const generateTransactionDescription = () => {
    if (!taskDetails) return '';
    
    const completionDate = taskDetails.completedAt 
      ? new Date(taskDetails.completedAt.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    
    const confirmationDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `This is a payment for the ${taskDetails.title || formData.taskTitle} job rendered on ${completionDate}, marked complete by you on ${completionDate} and marked confirmed by ${formData.taskerName} on ${confirmationDate}`;
  };

  /**
   * Handle task ID change
   */
  const handleTaskIdChange = (taskId: string) => {
    setFormData({...formData, taskId});
    if (taskId) {
      fetchTaskDetails(taskId);
      // Generate task number if not already set
      if (!formData.taskNumber) {
        setFormData(prev => ({...prev, taskNumber: generateTaskNumber()}));
      }
    }
  };

  const createDisbursement = async () => {
    setLoading(true);
    try {
      // Generate task number if not set
      const finalFormData = {
        ...formData,
        taskNumber: formData.taskNumber || generateTaskNumber(),
        description: formData.description || generateTransactionDescription()
      };

      const response = await fetch('/api/disbursements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // This should come from auth context
        },
        body: JSON.stringify(finalFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateDialog(false);
        setFormData({
          taskerId: '',
          taskerName: '',
          taskerPhone: '',
          taskerEmail: '',
          amount: 0,
          currency: 'PHP',
          taskId: '',
          taskTitle: '',
          taskNumber: '',
          paymentMethod: 'gcash',
          description: '',
          adminId: 'admin-user-id',
          adminName: 'FixMo Admin'
        });
        setTaskDetails(null);
        fetchPendingDisbursements();
      } else {
        alert('Failed to create disbursement: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating disbursement:', error);
      alert('Error creating disbursement');
    } finally {
      setLoading(false);
    }
  };

  const updateDisbursementStatus = async (disbursementId: string, action: string, additionalData?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/disbursements/${disbursementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          action,
          adminId: 'admin-user-id',
          ...additionalData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchPendingDisbursements();
        setShowDetailsDialog(false);
        setShowCancelDialog(false);
        setCancelReason('');
        setPaymentProof('');
      } else {
        alert('Failed to update disbursement: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating disbursement:', error);
      alert('Error updating disbursement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'gcash':
        return '📱';
      case 'paymaya':
        return '💳';
      case 'gotyme':
        return '🏦';
      default:
        return '💳';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Disbursement Manager</h1>
          <p className="text-muted-foreground">Manage payments to taskers</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <CreditCard className="w-4 h-4 mr-2" />
          Create Disbursement
        </Button>
      </div>

      {/* Disbursements List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Disbursements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : disbursements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending disbursements
            </div>
          ) : (
            <div className="space-y-4">
              {disbursements.map((disbursement) => (
                <div key={disbursement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getPaymentMethodIcon(disbursement.paymentMethod)}</span>
                        <h3 className="font-medium">{disbursement.taskerName}</h3>
                        {getStatusBadge(disbursement.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Amount:</span> {formatAmount(disbursement.amount, disbursement.currency)}
                        </div>
                        <div>
                          <span className="font-medium">Tasker:</span> {disbursement.taskerPhone}
                        </div>
                        <div>
                          <span className="font-medium">Task:</span> {disbursement.taskTitle}
                        </div>
                        <div>
                          <span className="font-medium">Task #:</span> <span className="font-mono text-blue-600">{disbursement.taskNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(disbursement.createdAt)}
                        </div>
                      </div>
                      {disbursement.description && (
                        <p className="text-sm text-muted-foreground mt-2">{disbursement.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDisbursement(disbursement);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Disbursement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Disbursement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskerId">Tasker ID</Label>
                <Input
                  id="taskerId"
                  value={formData.taskerId}
                  onChange={(e) => setFormData({...formData, taskerId: e.target.value})}
                  placeholder="Enter tasker ID"
                />
              </div>
              <div>
                <Label htmlFor="taskerName">Tasker Name</Label>
                <Input
                  id="taskerName"
                  value={formData.taskerName}
                  onChange={(e) => setFormData({...formData, taskerName: e.target.value})}
                  placeholder="Enter tasker name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskerPhone">Phone Number</Label>
                <Input
                  id="taskerPhone"
                  value={formData.taskerPhone}
                  onChange={(e) => setFormData({...formData, taskerPhone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="taskerEmail">Email (Optional)</Label>
                <Input
                  id="taskerEmail"
                  type="email"
                  value={formData.taskerEmail}
                  onChange={(e) => setFormData({...formData, taskerEmail: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value: 'gcash' | 'paymaya' | 'gotyme') => setFormData({...formData, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="paymaya">PayMaya</SelectItem>
                    <SelectItem value="gotyme">GoTyme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskId">Task ID</Label>
                <Input
                  id="taskId"
                  value={formData.taskId}
                  onChange={(e) => handleTaskIdChange(e.target.value)}
                  placeholder="Enter task ID"
                />
              </div>
              <div>
                <Label htmlFor="taskNumber">Task Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="taskNumber"
                    value={formData.taskNumber}
                    onChange={(e) => setFormData({...formData, taskNumber: e.target.value})}
                    placeholder="Auto-generated task number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({...formData, taskNumber: generateTaskNumber()})}
                    className="px-3"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={formData.taskTitle}
                onChange={(e) => setFormData({...formData, taskTitle: e.target.value})}
                placeholder="Enter task title"
              />
            </div>

            {/* Transaction Details Preview */}
            {(taskDetails || formData.taskId) && (
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Transaction Details Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Task Number:</span>
                      <span className="text-blue-600 font-mono">{formData.taskNumber || 'Not generated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Task Title:</span>
                      <span>{formData.taskTitle || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="font-semibold">₱{formData.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <span className="capitalize">{formData.paymentMethod}</span>
                    </div>
                    {loadingTaskDetails && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading task details...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={generateTransactionDescription() || "Enter description or leave blank for auto-generated description"}
                rows={4}
              />
              {!formData.description && taskDetails && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated description will be used based on task details
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createDisbursement} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Disbursement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disbursement Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Disbursement Details</DialogTitle>
          </DialogHeader>
          {selectedDisbursement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tasker Name</Label>
                  <p className="font-medium">{selectedDisbursement.taskerName}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{selectedDisbursement.taskerPhone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{formatAmount(selectedDisbursement.amount, selectedDisbursement.currency)}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">{selectedDisbursement.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task ID</Label>
                  <p className="font-medium">{selectedDisbursement.taskId}</p>
                </div>
                <div>
                  <Label>Task Number</Label>
                  <p className="font-medium font-mono text-blue-600">{selectedDisbursement.taskNumber || 'Not assigned'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Title</Label>
                  <p className="font-medium">{selectedDisbursement.taskTitle}</p>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <p className="font-medium">{selectedDisbursement.referenceNumber}</p>
                </div>
              </div>

              {selectedDisbursement.description && (
                <div>
                  <Label>Description</Label>
                  <p className="font-medium">{selectedDisbursement.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDisbursement.status)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{formatDate(selectedDisbursement.createdAt)}</p>
                </div>
              </div>

              {selectedDisbursement.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <Label>Payment Proof URL (Optional)</Label>
                    <Input
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      placeholder="Enter payment proof URL"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCancelDialog(true);
                        setShowDetailsDialog(false);
                      }}
                    >
                      Cancel Disbursement
                    </Button>
                    <Button
                      onClick={() => updateDisbursementStatus(selectedDisbursement.id, 'complete', { paymentProof })}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Mark as Completed
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Disbursement Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Disbursement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this disbursement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Cancellation</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDisbursement && cancelReason.trim()) {
                  updateDisbursementStatus(selectedDisbursement.id, 'cancel', { reason: cancelReason });
                }
              }}
              disabled={!cancelReason.trim() || loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 