"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ReportService } from '@/lib/reports';
import { Report } from '@/types';

interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId?: string;
  reportedTaskId?: string;
  reportedUserName?: string;
  reportedTaskTitle?: string;
}

const reportTypes = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'scam', label: 'Scam' },
  { value: 'other', label: 'Other' },
];

export function ReportDialog({
  isOpen,
  onOpenChange,
  reportedUserId,
  reportedTaskId,
  reportedUserName,
  reportedTaskTitle,
}: ReportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<Report['reportType']>('inappropriate_content');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a report.' });
      return;
    }

    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Description required', description: 'Please provide a description of the issue.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (reportedUserId) {
        await ReportService.reportUser(
          user.uid,
          user.displayName || 'Anonymous',
          reportedUserId,
          reportType,
          description
        );
        toast({ title: 'Report Submitted', description: `Your report about ${reportedUserName} has been submitted.` });
      } else if (reportedTaskId) {
        await ReportService.reportTask(
          user.uid,
          user.displayName || 'Anonymous',
          reportedTaskId,
          reportType,
          description
        );
        toast({ title: 'Report Submitted', description: `Your report about "${reportedTaskTitle}" has been submitted.` });
      }

      onOpenChange(false);
      setDescription('');
      setReportType('inappropriate_content');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your report.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setDescription('');
      setReportType('inappropriate_content');
    }
  };

  const getReportTitle = () => {
    if (reportedUserId) {
      return `Report User: ${reportedUserName}`;
    } else if (reportedTaskId) {
      return `Report Task: ${reportedTaskTitle}`;
    }
    return 'Submit Report';
  };

  const getReportDescription = () => {
    if (reportedUserId) {
      return `Help us understand what's wrong with ${reportedUserName}'s profile or behavior.`;
    } else if (reportedTaskId) {
      return `Help us understand what's wrong with this task post.`;
    }
    return 'Help us understand the issue you\'re reporting.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getReportTitle()}</DialogTitle>
          <DialogDescription>
            {getReportDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={(value: Report['reportType']) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 