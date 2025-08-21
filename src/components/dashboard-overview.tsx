"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAppointments } from '@/hooks/use-appointments';
import { usePayments } from '@/hooks/use-payments';
import { useAuth } from '@/hooks/use-auth';
import { format, isToday, isTomorrow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DashboardOverviewProps {
  userId: string;
  role: 'client' | 'tasker';
}

export function DashboardOverview({ userId, role }: DashboardOverviewProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const {
    appointments,
    isLoading: appointmentsLoading
  } = useAppointments({
    userId,
    role,
    limit: 5
  });

  const {
    transactions,
    isLoading: paymentsLoading
  } = usePayments({
    userId,
    role: 'payer',
    limit: 5
  });

  const upcomingAppointments = appointments.filter(appointment => 
    appointment.status === 'pending' || appointment.status === 'confirmed'
  ).slice(0, 3);

  const recentTransactions = transactions.slice(0, 3);

  const totalEarnings = transactions
    .filter(t => t.status === 'completed' && t.payeeId === userId)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.status === 'completed' && t.payerId === userId)
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'gcash':
        return '📱';
      case 'paymaya':
        return '💳';
      case 'cash':
        return '💵';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAppointments} pending, {confirmedAppointments} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === 'tasker' ? 'Total Earnings' : 'Total Spent'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {role === 'tasker' ? formatAmount(totalEarnings) : formatAmount(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {role === 'tasker' ? 'This month' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.length > 0 
                ? Math.round((confirmedAppointments / appointments.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Appointments completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/schedule')}
                >
                  Schedule Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{appointment.title}</h4>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(appointment.startTime.toDate()), 'MMM d, HH:mm')}
                        </div>
                        <div>
                          {role === 'client' ? appointment.taskerName : appointment.clientName}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/schedule?appointment=${appointment.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/schedule')}
                >
                  View All Appointments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent transactions</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/payment')}
                >
                  Make Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          {formatAmount(transaction.amount)}
                        </div>
                        <div>
                          {format(new Date(transaction.createdAt.toDate()), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {transaction.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/payment')}
                >
                  View All Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/schedule')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>Schedule Appointment</span>
            </Button>
            <Button 
              onClick={() => router.push('/payment')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span>Make Payment</span>
            </Button>
            {role === 'tasker' && (
              <Button 
                onClick={() => router.push('/availability')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Clock className="h-6 w-6 mb-2" />
                <span>Manage Availability</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 