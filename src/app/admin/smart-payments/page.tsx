/**
 * Admin Smart Payments Page
 * 
 * Admin interface for managing smart payments
 * Accessible at /admin/smart-payments
 */

import React from 'react';
import { SmartPaymentDashboard } from '@/components/smart-payment-dashboard';

export default function AdminSmartPaymentsPage() {
  // In a real app, you'd get the admin ID from authentication
  const adminId = 'admin-user-123';

  return (
    <div className="min-h-screen bg-gray-50">
      <SmartPaymentDashboard adminId={adminId} />
    </div>
  );
} 