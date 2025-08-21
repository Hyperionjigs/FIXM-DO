"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Clock,
  Users,
  Filter
} from 'lucide-react';
import { isAdmin, hasPermission } from '@/lib/admin-config';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationService } from '@/lib/notifications';

interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  verificationType: 'selfie' | 'id-upload';
  selfieURL?: string;
  idDocumentURL?: string;
  verificationResult?: any;
  idValidationResult?: any;
  documentType?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export default function VerificationQueuePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState('');

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

    fetchVerifications();
  }, [user, userIsAdmin, filter]);

  const fetchVerifications = async () => {
    if (!user || !userIsAdmin) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
      
      if (filter !== 'all') {
        q = query(usersRef, where('verificationStatus', '==', filter.toUpperCase()), orderBy('createdAt', 'desc'), limit(50));
      }
      
      const snapshot = await getDocs(q);
      const verificationRequests: VerificationRequest[] = [];

      for (const doc of snapshot.docs) {
        const userData = doc.data();
        
        // Only include users who have submitted verification materials
        if (userData.photoVerified || userData.idVerified || userData.verificationType) {
          verificationRequests.push({
            id: doc.id,
            userId: doc.id,
            userEmail: userData.email || '',
            userDisplayName: userData.displayName || '',
            userPhotoURL: userData.photoURL,
            verificationType: userData.verificationType || 'selfie',
            selfieURL: userData.verificationType === 'selfie' ? userData.photoURL : undefined,
            idDocumentURL: userData.idDocumentURL,
            verificationResult: userData.verificationResult,
            idValidationResult: userData.idValidationResult,
            documentType: userData.documentType,
            submittedAt: userData.photoVerifiedAt ? new Date(userData.photoVerifiedAt) : new Date(),
            status: userData.verificationStatus?.toLowerCase() || 'pending',
            adminNotes: userData.adminNotes,
            reviewedBy: userData.reviewedBy,
            reviewedAt: userData.reviewedAt ? new Date(userData.reviewedAt) : undefined,
          });
        }
      }

      setVerifications(verificationRequests);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch verification requests.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verification: VerificationRequest) => {
    if (!user || !userIsAdmin) return;

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', verification.userId);
      await updateDoc(userRef, {
        verificationStatus: 'VERIFIED',
        photoVerified: true,
        idVerified: true,
        adminNotes: adminNotes || undefined,
        reviewedBy: user.uid,
        reviewedAt: new Date(),
        updatedAt: new Date()
      });

      // Send notification to user
      await NotificationService.notifyVerificationStatus(
        verification.userId,
        'approved',
        adminNotes
      );

      toast({
        title: 'Verification Approved',
        description: `${verification.userDisplayName}'s verification has been approved.`,
      });

      setAdminNotes('');
      setIsDetailModalOpen(false);
      fetchVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve verification.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (verification: VerificationRequest) => {
    if (!user || !userIsAdmin) return;

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', verification.userId);
      await updateDoc(userRef, {
        verificationStatus: 'REJECTED',
        photoVerified: false,
        idVerified: false,
        adminNotes: adminNotes || undefined,
        reviewedBy: user.uid,
        reviewedAt: new Date(),
        updatedAt: new Date()
      });

      // Send notification to user
      await NotificationService.notifyVerificationStatus(
        verification.userId,
        'rejected',
        adminNotes
      );

      toast({
        title: 'Verification Rejected',
        description: `${verification.userDisplayName}'s verification has been rejected.`,
      });

      setAdminNotes('');
      setIsDetailModalOpen(false);
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject verification.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openDetailModal = (verification: VerificationRequest) => {
    setSelectedVerification(verification);
    setAdminNotes(verification.adminNotes || '');
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVerificationTypeIcon = (type: string) => {
    switch (type) {
      case 'selfie':
        return <UserCheck className="h-4 w-4" />;
      case 'id-upload':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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
            <h1 className="text-3xl font-bold mb-2">Verification Queue</h1>
            <p className="text-muted-foreground">
              Review and approve user verification requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {verifications.length} requests
            </Badge>
          </div>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : verifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No verification requests</h3>
              <p className="text-muted-foreground">
                {filter === 'pending' ? 'No pending verification requests at this time.' : 
                 `No ${filter} verification requests found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          verifications.map((verification) => (
            <Card key={verification.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={verification.userPhotoURL} alt={verification.userDisplayName} />
                      <AvatarFallback>{verification.userDisplayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{verification.userDisplayName}</h3>
                      <p className="text-sm text-muted-foreground">{verification.userEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getVerificationTypeIcon(verification.verificationType)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {verification.verificationType.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {verification.submittedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(verification.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailModal(verification)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              Review the verification materials and approve or reject the request.
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedVerification.userPhotoURL} alt={selectedVerification.userDisplayName} />
                      <AvatarFallback>{selectedVerification.userDisplayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedVerification.userDisplayName}</h3>
                      <p className="text-muted-foreground">{selectedVerification.userEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {selectedVerification.submittedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Materials */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedVerification.verificationType === 'selfie' && selectedVerification.selfieURL && (
                      <div>
                        <h4 className="font-medium mb-2">Selfie Photo</h4>
                        <img 
                          src={selectedVerification.selfieURL} 
                          alt="Selfie" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        {selectedVerification.verificationResult && (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <h5 className="font-medium mb-2">AI Verification Results:</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Confidence: {Math.round((selectedVerification.verificationResult.confidence || 0) * 100)}%</div>
                              <div>Liveness: {Math.round((selectedVerification.verificationResult.livenessScore || 0) * 100)}%</div>
                              <div>Quality: {Math.round((selectedVerification.verificationResult.qualityScore || 0) * 100)}%</div>
                              <div>Face Detected: {selectedVerification.verificationResult.faceDetected ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedVerification.verificationType === 'id-upload' && selectedVerification.idDocumentURL && (
                      <div>
                        <h4 className="font-medium mb-2">ID Document</h4>
                        <img 
                          src={selectedVerification.idDocumentURL} 
                          alt="ID Document" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        {selectedVerification.idValidationResult && (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <h5 className="font-medium mb-2">Document Validation:</h5>
                            <div className="text-sm">
                              <div>Type: {selectedVerification.documentType?.replace('-', ' ')}</div>
                              <div>Confidence: {Math.round((selectedVerification.idValidationResult.confidence || 0) * 100)}%</div>
                              <div>Valid: {selectedVerification.idValidationResult.isValid ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this verification request..."
                    className="w-full h-24 p-3 border rounded-lg resize-none"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedVerification)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedVerification)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 