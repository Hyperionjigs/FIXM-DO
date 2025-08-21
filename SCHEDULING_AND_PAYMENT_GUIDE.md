# Scheduling and Payment System Guide

This guide explains the comprehensive scheduling and payment system implemented in the FixMo Reference platform, including GCash and PayMaya integration.

## Table of Contents

1. [Overview](#overview)
2. [Scheduling System](#scheduling-system)
3. [Payment System](#payment-system)
4. [API Endpoints](#api-endpoints)
5. [Components](#components)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)

## Overview

The scheduling and payment system provides:

- **Appointment Management**: Create, view, and manage appointments
- **Availability Management**: Taskers can set their working hours
- **Payment Processing**: Support for GCash, PayMaya, and cash payments
- **Calendar Integration**: Visual calendar interface for scheduling
- **Real-time Updates**: Live status updates and notifications

## Scheduling System

### Features

- **Appointment Booking**: Clients can book appointments with taskers
- **Availability Slots**: Taskers can set their working hours for each day
- **Schedule Blocks**: Mark specific time periods as unavailable
- **Status Management**: Track appointment status (pending, confirmed, cancelled, completed)
- **Reminders**: Automatic appointment reminders

### Data Models

#### Appointment
```typescript
interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  taskerId: string;
  taskerName: string;
  taskId?: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  location: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### AvailabilitySlot
```typescript
interface AvailabilitySlot {
  id?: string;
  taskerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Usage

#### Creating an Appointment
```typescript
import { SchedulingService } from '@/lib/scheduling-service';

const appointment = await SchedulingService.createAppointment({
  clientId: 'client-123',
  clientName: 'John Doe',
  taskerId: 'tasker-456',
  taskerName: 'Jane Smith',
  title: 'Home Cleaning Service',
  description: 'Weekly house cleaning',
  appointmentType: 'service',
  startTime: new Date('2024-01-15T10:00:00Z'),
  endTime: new Date('2024-01-15T12:00:00Z'),
  duration: 120,
  location: '123 Main St, City',
  status: 'pending'
});
```

#### Setting Availability
```typescript
const slots = [
  {
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  },
  {
    dayOfWeek: 2, // Tuesday
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  }
  // ... more days
];

await SchedulingService.setAvailabilitySlots('tasker-456', slots);
```

## Payment System

### Supported Payment Methods

1. **GCash**: Mobile wallet payments
2. **PayMaya**: Digital wallet and card payments
3. **Cash**: Cash on delivery payments

### Features

- **Multiple Payment Methods**: Support for various payment options
- **Transaction Tracking**: Complete payment history
- **Webhook Integration**: Real-time payment status updates
- **QR Code Generation**: For mobile payments
- **Security**: PCI-compliant payment processing

### Data Models

#### PaymentTransaction
```typescript
interface PaymentTransaction {
  id?: string;
  taskId?: string;
  appointmentId?: string;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  referenceNumber?: string;
  description: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  processedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### PaymentMethodConfig
```typescript
interface PaymentMethodConfig {
  id: string;
  name: string;
  type: PaymentMethod;
  isEnabled: boolean;
  isDefault: boolean;
  config: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    sandboxMode: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Usage

#### Processing a GCash Payment
```typescript
import { PaymentService } from '@/lib/payment-service';

const response = await PaymentService.processGCashPayment({
  amount: 1000,
  currency: 'PHP',
  referenceNumber: 'PAY-123456789',
  description: 'Home cleaning service',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+639123456789',
  redirectUrl: 'https://yourapp.com/payment/success',
  webhookUrl: 'https://yourapp.com/api/payments/webhook?method=gcash'
});
```

#### Processing a PayMaya Payment
```typescript
const response = await PaymentService.processPayMayaPayment({
  amount: 1000,
  currency: 'PHP',
  referenceNumber: 'PAY-123456789',
  description: 'Home cleaning service',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+639123456789',
  redirectUrl: 'https://yourapp.com/payment/success',
  webhookUrl: 'https://yourapp.com/api/payments/webhook?method=paymaya'
});
```

## API Endpoints

### Scheduling Endpoints

#### Create Appointment
```
POST /api/appointments/create
```

#### Get User Appointments
```
GET /api/appointments/user?userId={userId}&role={role}&status={status}&limit={limit}
```

#### Update Appointment
```
PATCH /api/appointments/{id}
```

#### Cancel Appointment
```
DELETE /api/appointments/{id}
```

#### Manage Availability
```
GET /api/appointments/availability?taskerId={taskerId}
POST /api/appointments/availability
```

### Payment Endpoints

#### Process GCash Payment
```
POST /api/payments/gcash
```

#### Process PayMaya Payment
```
POST /api/payments/paymaya
```

#### Process Cash Payment
```
POST /api/payments/cash
```

#### Get Payment Methods
```
GET /api/payments/methods
```

#### Get User Transactions
```
GET /api/payments/transactions?userId={userId}&role={role}&limit={limit}
```

#### Payment Webhook
```
POST /api/payments/webhook?method={paymentMethod}
```

## Components

### AppointmentCalendar
A comprehensive calendar component for viewing and managing appointments.

```tsx
<AppointmentCalendar
  userId="user-123"
  role="client"
  onAppointmentSelect={(appointment) => {
    console.log('Selected appointment:', appointment);
  }}
/>
```

### PaymentForm
A payment form component supporting multiple payment methods.

```tsx
<PaymentForm
  amount={1000}
  currency="PHP"
  description="Home cleaning service"
  referenceNumber="PAY-123456789"
  customerName="John Doe"
  customerEmail="john@example.com"
  customerPhone="+639123456789"
  onSuccess={(transactionId) => {
    console.log('Payment successful:', transactionId);
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
/>
```

### AvailabilityManager
A component for taskers to manage their availability.

```tsx
<AvailabilityManager taskerId="tasker-456" />
```

### DashboardOverview
A dashboard component showing appointments and payment information.

```tsx
<DashboardOverview userId="user-123" role="client" />
```

## Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# GCash Configuration
GCASH_MERCHANT_ID=your_gcash_merchant_id
GCASH_API_KEY=your_gcash_api_key
GCASH_SECRET_KEY=your_gcash_secret_key
GCASH_WEBHOOK_URL=https://yourapp.com/api/payments/webhook?method=gcash

# PayMaya Configuration
PAYMAYA_MERCHANT_ID=your_paymaya_merchant_id
PAYMAYA_API_KEY=your_paymaya_api_key
PAYMAYA_SECRET_KEY=your_paymaya_secret_key
PAYMAYA_WEBHOOK_URL=https://yourapp.com/api/payments/webhook?method=paymaya
```

### Firebase Configuration

Ensure your Firebase configuration includes the necessary collections:

- `appointments`
- `availability_slots`
- `schedule_blocks`
- `payment_transactions`
- `payment_methods`

## Usage Examples

### Complete Appointment Booking Flow

```typescript
// 1. Check tasker availability
const isAvailable = await SchedulingService.isTimeSlotAvailable(
  taskerId,
  startTime,
  endTime
);

if (!isAvailable) {
  throw new Error('Time slot not available');
}

// 2. Create appointment
const appointment = await SchedulingService.createAppointment({
  clientId,
  clientName,
  taskerId,
  taskerName,
  title,
  description,
  appointmentType,
  startTime,
  endTime,
  duration,
  location,
  status: 'pending'
});

// 3. Process payment
const paymentResponse = await PaymentService.processGCashPayment({
  amount: appointmentAmount,
  currency: 'PHP',
  referenceNumber: `PAY-${appointment.id}`,
  description: appointment.title,
  customerName: clientName,
  redirectUrl: `${window.location.origin}/payment/success`
});

// 4. Handle payment response
if (paymentResponse.success) {
  // Redirect to payment page or show QR code
  window.open(paymentResponse.paymentUrl, '_blank');
} else {
  // Handle payment error
  console.error('Payment failed:', paymentResponse.errorMessage);
}
```

### Tasker Availability Management

```typescript
// Set weekly availability
const weeklySlots = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 6, startTime: '10:00', endTime: '15:00', isAvailable: true },
  { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false }
];

await SchedulingService.setAvailabilitySlots(taskerId, weeklySlots);

// Create a schedule block (unavailable time)
await SchedulingService.createScheduleBlock({
  taskerId,
  startDate: new Date('2024-01-20'),
  endDate: new Date('2024-01-22'),
  startTime: '00:00',
  endTime: '23:59',
  isBlocked: true,
  reason: 'Vacation'
});
```

### Payment Processing with Webhooks

```typescript
// Webhook handler for payment status updates
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const paymentMethod = searchParams.get('method') as PaymentMethod;

  // Verify webhook signature (implement based on payment provider)
  const signature = request.headers.get('x-signature');
  if (!verifyWebhookSignature(body, signature, paymentMethod)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Handle the webhook
  await PaymentService.handlePaymentWebhook(paymentMethod, body);

  return NextResponse.json({ success: true });
}
```

## Security Considerations

1. **Payment Data**: Never log sensitive payment information
2. **Webhook Verification**: Always verify webhook signatures
3. **API Keys**: Store API keys securely in environment variables
4. **HTTPS**: Use HTTPS for all payment-related communications
5. **Input Validation**: Validate all user inputs
6. **Rate Limiting**: Implement rate limiting for payment endpoints

## Testing

### Test Payment Methods

The system includes simulated payment processing for development:

- GCash payments return a simulated QR code and payment URL
- PayMaya payments return a simulated payment URL
- Cash payments are immediately marked as completed

### Test Data

You can create test appointments and payments using the provided components and API endpoints. The system will work with simulated payment responses in development mode.

## Support

For questions or issues with the scheduling and payment system:

1. Check the API documentation
2. Review the component examples
3. Test with the provided test endpoints
4. Contact the development team

## Future Enhancements

Planned features for future releases:

- **Recurring Appointments**: Support for weekly/monthly recurring appointments
- **Group Appointments**: Multiple clients in a single appointment
- **Advanced Payment Methods**: Support for more payment providers
- **Automated Reminders**: SMS and email reminders
- **Calendar Sync**: Integration with Google Calendar and Outlook
- **Mobile App**: Native mobile applications
- **Analytics**: Detailed reporting and analytics
- **Multi-language Support**: Internationalization 