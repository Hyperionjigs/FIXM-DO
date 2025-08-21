# GCash & PayMaya Integration Guide

## 🏦 **Overview**

This guide provides comprehensive information for integrating GCash and PayMaya payment methods into the FixMo platform. Both are leading digital payment solutions in the Philippines, offering secure, fast, and convenient payment processing.

## 📊 **Market Analysis**

### **GCash (Globe Telecom)**
- **Market Share**: ~60% of mobile wallet users in Philippines
- **User Base**: 66+ million registered users
- **Features**: QR payments, bank transfers, bill payments, investments
- **Merchant Fees**: 1.5% - 3% per transaction
- **Settlement**: 1-3 business days

### **PayMaya (PLDT)**
- **Market Share**: ~25% of mobile wallet users in Philippines
- **User Base**: 28+ million registered users
- **Features**: QR payments, card payments, international transfers
- **Merchant Fees**: 1.5% - 2.5% per transaction
- **Settlement**: 1-2 business days

## 🔧 **Technical Implementation**

### **1. Environment Configuration**

Add these environment variables to your `.env.local`:

```bash
# GCash Configuration
GCASH_MERCHANT_ID=your_gcash_merchant_id
GCASH_API_KEY=your_gcash_api_key
GCASH_SECRET_KEY=your_gcash_secret_key
GCASH_WEBHOOK_SECRET=your_gcash_webhook_secret

# PayMaya Configuration
PAYMAYA_MERCHANT_ID=your_paymaya_merchant_id
PAYMAYA_PUBLIC_KEY=your_paymaya_public_key
PAYMAYA_SECRET_KEY=your_paymaya_secret_key
PAYMAYA_WEBHOOK_SECRET=your_paymaya_webhook_secret

# Payment Settings
PAYMENT_SANDBOX_MODE=true
PAYMENT_WEBHOOK_URL=https://yourapp.com/api/payments/webhook
```

### **2. API Integration Patterns**

#### **GCash API Integration**
```typescript
import { GCashService } from '@/lib/gcash-service';

const gcashService = GCashService.initialize();

// Create payment
const payment = await gcashService.createPayment({
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

#### **PayMaya API Integration**
```typescript
import { PayMayaService } from '@/lib/paymaya-service';

const paymayaService = PayMayaService.initialize();

// Create payment
const payment = await paymayaService.createPayment({
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

### **3. Enhanced Payment Service**

Use the unified payment service for automatic method selection and retry logic:

```typescript
import { EnhancedPaymentService } from '@/lib/enhanced-payment-service';

const paymentService = new EnhancedPaymentService();

// Process payment with automatic fallback
const result = await paymentService.processPayment({
  amount: 1000,
  currency: 'PHP',
  referenceNumber: 'PAY-123456789',
  description: 'Home cleaning service',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+639123456789',
  redirectUrl: 'https://yourapp.com/payment/success',
  preferredMethod: 'gcash', // Optional: prefer GCash
  retryCount: 3 // Optional: number of retry attempts
});
```

## 🛡️ **Security Best Practices**

### **1. Webhook Security**
```typescript
// Verify webhook signatures
export async function verifyWebhookSignature(
  payload: any,
  signature: string,
  method: 'gcash' | 'paymaya'
): Promise<boolean> {
  const secret = method === 'gcash' 
    ? process.env.GCASH_WEBHOOK_SECRET 
    : process.env.PAYMAYA_WEBHOOK_SECRET;
    
  const expectedSignature = crypto
    .createHmac('sha256', secret!)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### **2. Input Validation**
```typescript
// Validate payment requests
function validatePaymentRequest(request: any): void {
  if (!request.amount || request.amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (!request.referenceNumber || request.referenceNumber.length < 5) {
    throw new Error('Invalid reference number');
  }
  if (!request.customerName || request.customerName.length < 2) {
    throw new Error('Invalid customer name');
  }
  if (!request.redirectUrl || !isValidUrl(request.redirectUrl)) {
    throw new Error('Invalid redirect URL');
  }
}
```

### **3. Rate Limiting**
```typescript
// Implement rate limiting for payment endpoints
import rateLimit from 'express-rate-limit';

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many payment requests, please try again later'
});

app.use('/api/payments', paymentLimiter);
```

## 📱 **User Experience Considerations**

### **1. Payment Method Selection**
```typescript
// Smart payment method selection
function selectOptimalPaymentMethod(userPreferences: any, amount: number): PaymentMethod {
  // Check user's preferred method
  if (userPreferences.preferredMethod) {
    return userPreferences.preferredMethod;
  }
  
  // Check user's payment history
  if (userPreferences.paymentHistory?.gcash > userPreferences.paymentHistory?.paymaya) {
    return 'gcash';
  }
  
  // Default to GCash for smaller amounts, PayMaya for larger amounts
  return amount < 5000 ? 'gcash' : 'paymaya';
}
```

### **2. QR Code Display**
```typescript
// Enhanced QR code component
function PaymentQRCode({ qrCode, paymentUrl, expiresAt }: PaymentQRCodeProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        // Handle expiration
        onExpired?.();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  return (
    <div className="payment-qr-container">
      <img src={qrCode} alt="Payment QR Code" />
      <p>Scan with {paymentMethod === 'gcash' ? 'GCash' : 'PayMaya'} app</p>
      <p>Expires in: {Math.floor(timeLeft / 60000)}m {Math.floor((timeLeft % 60000) / 1000)}s</p>
      <button onClick={() => window.open(paymentUrl, '_blank')}>
        Pay Online
      </button>
    </div>
  );
}
```

### **3. Payment Status Updates**
```typescript
// Real-time payment status updates
function usePaymentStatus(transactionId: string, method: PaymentMethod) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  
  useEffect(() => {
    const checkStatus = async () => {
      const result = await paymentService.checkPaymentStatus(transactionId, method);
      setStatus(result.success ? 'completed' : 'failed');
      setLastChecked(new Date());
    };
    
    // Check immediately
    checkStatus();
    
    // Poll every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [transactionId, method]);
  
  return { status, lastChecked };
}
```

## 🔄 **Webhook Handling**

### **1. Webhook Endpoint**
```typescript
// Enhanced webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') as PaymentMethod;
    
    // Verify webhook signature
    const signature = request.headers.get('x-signature');
    if (!verifyWebhookSignature(body, signature!, method)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Process webhook based on method
    switch (method) {
      case 'gcash':
        await gcashService.processWebhook(body);
        break;
      case 'paymaya':
        await paymayaService.processWebhook(body);
        break;
      default:
        return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

### **2. Webhook Processing**
```typescript
// Process webhook notifications
async function processPaymentWebhook(payload: any, method: PaymentMethod) {
  const { transactionId, status, amount, referenceNumber } = payload;
  
  // Update transaction status
  await updateTransactionStatus(transactionId, status);
  
  // Send notifications
  if (status === 'success') {
    await sendPaymentSuccessNotification(referenceNumber);
    await triggerOrderFulfillment(referenceNumber);
  } else if (status === 'failed') {
    await sendPaymentFailureNotification(referenceNumber);
  }
  
  // Log for analytics
  await logPaymentEvent({
    transactionId,
    method,
    status,
    amount,
    timestamp: new Date()
  });
}
```

## 📈 **Analytics & Monitoring**

### **1. Payment Analytics**
```typescript
// Get payment analytics
async function getPaymentAnalytics(timeRange: { start: Date; end: Date }) {
  const analytics = await paymentService.getPaymentAnalytics(undefined, timeRange);
  
  return {
    totalTransactions: analytics.totalTransactions,
    successRate: analytics.successRate,
    averageAmount: analytics.averageAmount,
    preferredMethod: analytics.preferredMethod,
    revenue: analytics.successfulTransactions * analytics.averageAmount
  };
}
```

### **2. Error Monitoring**
```typescript
// Monitor payment errors
function logPaymentError(error: Error, context: PaymentContext) {
  console.error('Payment Error:', {
    error: error.message,
    stack: error.stack,
    context: {
      method: context.method,
      amount: context.amount,
      referenceNumber: context.referenceNumber,
      timestamp: new Date().toISOString()
    }
  });
  
  // Send to monitoring service
  sendToMonitoringService({
    type: 'payment_error',
    severity: 'high',
    data: { error: error.message, context }
  });
}
```

## 🧪 **Testing Strategy**

### **1. Unit Tests**
```typescript
// Test payment service
describe('PaymentService', () => {
  it('should process GCash payment successfully', async () => {
    const service = new EnhancedPaymentService();
    const result = await service.processPayment({
      amount: 1000,
      currency: 'PHP',
      referenceNumber: 'TEST-123',
      description: 'Test payment',
      customerName: 'Test User',
      redirectUrl: 'https://test.com/success',
      preferredMethod: 'gcash'
    });
    
    expect(result.success).toBe(true);
    expect(result.paymentMethod).toBe('gcash');
  });
});
```

### **2. Integration Tests**
```typescript
// Test webhook handling
describe('Payment Webhooks', () => {
  it('should process GCash webhook correctly', async () => {
    const webhookPayload = {
      transactionId: 'GCASH_123',
      status: 'success',
      amount: 1000,
      signature: 'valid_signature'
    };
    
    const result = await processWebhook(webhookPayload, 'gcash');
    expect(result.success).toBe(true);
  });
});
```

## 🚀 **Deployment Checklist**

### **Pre-Production**
- [ ] Set up sandbox accounts for both GCash and PayMaya
- [ ] Configure webhook endpoints in sandbox mode
- [ ] Test payment flows end-to-end
- [ ] Verify webhook signature validation
- [ ] Test error handling and retry logic
- [ ] Validate security measures

### **Production**
- [ ] Set up production merchant accounts
- [ ] Configure production webhook URLs
- [ ] Update environment variables
- [ ] Enable monitoring and alerting
- [ ] Set up backup payment methods
- [ ] Configure rate limiting
- [ ] Test with small amounts first

### **Post-Deployment**
- [ ] Monitor payment success rates
- [ ] Track user preferences
- [ ] Analyze payment patterns
- [ ] Optimize based on performance data
- [ ] Plan for scaling

## 📞 **Support & Troubleshooting**

### **Common Issues**

1. **Webhook Not Received**
   - Check webhook URL configuration
   - Verify server accessibility
   - Check firewall settings

2. **Payment Timeout**
   - Increase timeout settings
   - Implement retry logic
   - Check network connectivity

3. **Signature Verification Failed**
   - Verify secret keys
   - Check signature generation logic
   - Ensure consistent encoding

### **Contact Information**

- **GCash Business Support**: business@globe.com.ph
- **PayMaya Merchant Support**: merchantsupport@paymaya.com
- **Technical Documentation**: Available in respective developer portals

## 🔮 **Future Enhancements**

### **Planned Features**
- **Split Payments**: Support for multiple payment methods in single transaction
- **Recurring Payments**: Subscription billing support
- **International Payments**: Cross-border payment support
- **Advanced Analytics**: Machine learning-based fraud detection
- **Mobile SDK**: Native mobile app integration

### **Integration Opportunities**
- **Bank Transfers**: Direct bank integration
- **Credit Cards**: International card support
- **Crypto Payments**: Digital currency support
- **Buy Now Pay Later**: Installment payment options

---

This guide provides a comprehensive foundation for integrating GCash and PayMaya into your FixMo platform. For specific implementation questions or custom requirements, refer to the official documentation or contact the respective payment providers. 