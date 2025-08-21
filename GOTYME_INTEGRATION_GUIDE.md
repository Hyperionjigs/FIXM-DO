# Gotyme Integration Guide for FixMo

## 🏦 **Overview**

This guide provides comprehensive information for integrating Gotyme payment method into the FixMo platform. Gotyme is a rapidly growing digital wallet in the Philippines, backed by Robinsons Bank, offering secure, fast, and convenient payment processing with competitive fees.

## 📊 **Market Analysis**

### **Gotyme (Robinsons Bank)**
- **Market Share**: ~8% of mobile wallet users in Philippines (growing rapidly)
- **User Base**: 5+ million registered users
- **Features**: QR payments, bank transfers, bill payments, investments, savings
- **Merchant Fees**: 1.2% - 2.5% per transaction (competitive rates)
- **Settlement**: 1-2 business days
- **Backing**: Robinsons Bank (strong financial institution)
- **QR Compatibility**: Compatible with existing QR payment infrastructure

### **Advantages of Gotyme Integration**
- ✅ **Lower Fees**: Often 0.5-1% lower than GCash/PayMaya
- ✅ **Growing User Base**: Rapid adoption among younger demographics
- ✅ **Bank Integration**: Seamless bank transfers
- ✅ **Investment Features**: Users can earn interest on wallet balance
- ✅ **Robust Security**: Bank-grade security measures
- ✅ **Excellent UX**: User-friendly mobile app

## 🔧 **Technical Implementation**

### **1. Environment Configuration**

Add these environment variables to your `.env.local`:

```bash
# Gotyme Configuration
GOTYME_MERCHANT_ID=your_gotyme_merchant_id
GOTYME_API_KEY=your_gotyme_api_key
GOTYME_SECRET_KEY=your_gotyme_secret_key
GOTYME_WEBHOOK_SECRET=your_gotyme_webhook_secret

# Payment Settings (update existing)
PAYMENT_SANDBOX_MODE=true
PAYMENT_WEBHOOK_URL=https://yourapp.com/api/payments/webhook
```

### **2. API Integration Patterns**

#### **Gotyme API Integration**
```typescript
import { GotymeService } from '@/lib/gotyme-service';

const gotymeService = GotymeService.initialize();

// Create payment
const payment = await gotymeService.createPayment({
  amount: 1000,
  currency: 'PHP',
  referenceNumber: 'PAY-123456789',
  description: 'Home cleaning service',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+639123456789',
  redirectUrl: 'https://yourapp.com/payment/success',
  webhookUrl: 'https://yourapp.com/api/payments/webhook?method=gotyme'
});
```

### **3. Enhanced Payment Service Integration**

Update the unified payment service to include Gotyme:

```typescript
import { EnhancedPaymentService } from '@/lib/enhanced-payment-service';

const paymentService = new EnhancedPaymentService();

// Process payment with Gotyme as preferred method
const result = await paymentService.processPayment({
  amount: 1000,
  currency: 'PHP',
  referenceNumber: 'PAY-123456789',
  description: 'Home cleaning service',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+639123456789',
  redirectUrl: 'https://yourapp.com/payment/success',
  preferredMethod: 'gotyme', // New Gotyme preference
  retryCount: 3
});
```

## 🛡️ **Security Best Practices**

### **1. Webhook Security**
```typescript
// Verify Gotyme webhook signatures
export async function verifyGotymeWebhookSignature(
  payload: any,
  signature: string
): Promise<boolean> {
  const secret = process.env.GOTYME_WEBHOOK_SECRET;
    
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

### **2. Gotyme-Specific Validation**
```typescript
// Validate Gotyme payment requests
function validateGotymePaymentRequest(request: any): void {
  if (!request.amount || request.amount < 1) {
    throw new Error('Invalid amount - minimum ₱1');
  }
  if (!request.referenceNumber || request.referenceNumber.length < 5) {
    throw new Error('Invalid reference number');
  }
  if (!request.customerName || request.customerName.length < 2) {
    throw new Error('Invalid customer name');
  }
  if (!request.customerPhone || !isValidPhilippinePhone(request.customerPhone)) {
    throw new Error('Invalid Philippine phone number');
  }
}
```

## 📱 **User Experience Considerations**

### **1. Smart Payment Method Selection**
```typescript
// Enhanced payment method selection including Gotyme
function selectOptimalPaymentMethod(userPreferences: any, amount: number): PaymentMethod {
  // Check user's preferred method
  if (userPreferences.preferredMethod) {
    return userPreferences.preferredMethod;
  }
  
  // Check user's payment history
  const history = userPreferences.paymentHistory || {};
  if (history.gotyme > history.gcash && history.gotyme > history.paymaya) {
    return 'gotyme';
  }
  
  // Smart selection based on amount and user demographics
  if (amount < 3000 && userPreferences.age < 35) {
    return 'gotyme'; // Younger users prefer Gotyme for smaller amounts
  }
  
  // Default fallback logic
  return amount < 5000 ? 'gcash' : 'paymaya';
}
```

### **2. Gotyme QR Code Display**
```typescript
// Enhanced QR code component with Gotyme branding
function PaymentQRCode({ qrCode, paymentUrl, expiresAt, method }: PaymentQRCodeProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const getMethodInfo = (method: PaymentMethod) => {
    switch (method) {
      case 'gotyme':
        return {
          name: 'Gotyme',
          color: '#00A3E0',
          icon: '🏦',
          instructions: 'Scan with Gotyme app'
        };
      case 'gcash':
        return {
          name: 'GCash',
          color: '#0066CC',
          icon: '📱',
          instructions: 'Scan with GCash app'
        };
      case 'paymaya':
        return {
          name: 'PayMaya',
          color: '#FF6B35',
          icon: '💳',
          instructions: 'Scan with PayMaya app'
        };
      default:
        return {
          name: 'Payment',
          color: '#666',
          icon: '💳',
          instructions: 'Scan QR code'
        };
    }
  };
  
  const methodInfo = getMethodInfo(method);
  
  return (
    <div className="payment-qr-container" style={{ borderColor: methodInfo.color }}>
      <div className="method-header">
        <span className="method-icon">{methodInfo.icon}</span>
        <span className="method-name">{methodInfo.name}</span>
      </div>
      <img src={qrCode} alt={`${methodInfo.name} QR Code`} />
      <p className="instructions">{methodInfo.instructions}</p>
      <p className="expiry">Expires in: {Math.floor(timeLeft / 60000)}m {Math.floor((timeLeft % 60000) / 1000)}s</p>
      <button 
        onClick={() => window.open(paymentUrl, '_blank')}
        style={{ backgroundColor: methodInfo.color }}
      >
        Pay with {methodInfo.name}
      </button>
    </div>
  );
}
```

## 🔄 **Webhook Handling**

### **1. Enhanced Webhook Endpoint**
```typescript
// Enhanced webhook handler with Gotyme support
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') as PaymentMethod;
    
    // Verify webhook signature based on method
    const signature = request.headers.get('x-signature');
    let isValid = false;
    
    switch (method) {
      case 'gotyme':
        isValid = await verifyGotymeWebhookSignature(body, signature!);
        break;
      case 'gcash':
        isValid = await verifyGCashWebhookSignature(body, signature!);
        break;
      case 'paymaya':
        isValid = await verifyPayMayaWebhookSignature(body, signature!);
        break;
      default:
        return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    }
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Process webhook based on method
    switch (method) {
      case 'gotyme':
        await gotymeService.processWebhook(body);
        break;
      case 'gcash':
        await gcashService.processWebhook(body);
        break;
      case 'paymaya':
        await paymayaService.processWebhook(body);
        break;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

## 📈 **Analytics & Monitoring**

### **1. Payment Method Analytics**
```typescript
// Enhanced analytics including Gotyme
async function getPaymentMethodAnalytics(timeRange: { start: Date; end: Date }) {
  const analytics = await paymentService.getPaymentAnalytics(undefined, timeRange);
  
  return {
    totalTransactions: analytics.totalTransactions,
    successRate: analytics.successRate,
    averageAmount: analytics.averageAmount,
    methodBreakdown: {
      gotyme: analytics.methodBreakdown?.gotyme || 0,
      gcash: analytics.methodBreakdown?.gcash || 0,
      paymaya: analytics.methodBreakdown?.paymaya || 0,
      cash: analytics.methodBreakdown?.cash || 0
    },
    preferredMethod: analytics.preferredMethod,
    revenue: analytics.successfulTransactions * analytics.averageAmount
  };
}
```

## 🧪 **Testing Strategy**

### **1. Gotyme-Specific Tests**
```typescript
// Test Gotyme payment service
describe('GotymeService', () => {
  it('should process Gotyme payment successfully', async () => {
    const service = new GotymeService();
    const result = await service.createPayment({
      amount: 1000,
      currency: 'PHP',
      referenceNumber: 'TEST-123',
      description: 'Test payment',
      customerName: 'Test User',
      customerPhone: '+639123456789',
      redirectUrl: 'https://test.com/success'
    });
    
    expect(result.success).toBe(true);
    expect(result.paymentMethod).toBe('gotyme');
    expect(result.qrCode).toBeDefined();
  });
  
  it('should handle Gotyme webhook correctly', async () => {
    const webhookPayload = {
      transactionId: 'GOTYME_123',
      status: 'success',
      amount: 1000,
      signature: 'valid_signature'
    };
    
    const result = await processGotymeWebhook(webhookPayload);
    expect(result.success).toBe(true);
  });
});
```

## 🚀 **Deployment Checklist**

### **Pre-Production**
- [ ] Set up Gotyme merchant account
- [ ] Configure sandbox environment
- [ ] Test payment flows end-to-end
- [ ] Verify webhook signature validation
- [ ] Test error handling and retry logic
- [ ] Validate security measures
- [ ] Test QR code generation and scanning

### **Production**
- [ ] Set up production Gotyme merchant account
- [ ] Configure production webhook URLs
- [ ] Update environment variables
- [ ] Enable monitoring and alerting
- [ ] Set up backup payment methods
- [ ] Configure rate limiting
- [ ] Test with small amounts first
- [ ] Monitor Gotyme-specific metrics

### **Post-Deployment**
- [ ] Monitor Gotyme payment success rates
- [ ] Track user preferences for Gotyme
- [ ] Analyze Gotyme vs other payment methods
- [ ] Optimize based on performance data
- [ ] Plan for scaling Gotyme integration

## 📞 **Support & Troubleshooting**

### **Gotyme-Specific Issues**

1. **QR Code Not Scanning**
   - Verify QR code format compatibility
   - Check Gotyme app version
   - Ensure proper QR code generation

2. **Payment Timeout**
   - Gotyme typically has 15-minute timeout
   - Implement proper timeout handling
   - Check network connectivity

3. **Webhook Not Received**
   - Verify Gotyme webhook URL configuration
   - Check server accessibility
   - Verify webhook secret configuration

### **Contact Information**

- **Gotyme Business Support**: business@gotyme.com.ph
- **Gotyme Technical Support**: techsupport@gotyme.com.ph
- **Robinsons Bank Support**: support@robinsonsbank.com.ph

## 🔮 **Future Enhancements**

### **Gotyme-Specific Features**
- **Savings Integration**: Link to Gotyme savings accounts
- **Investment Features**: Integrate with Gotyme investment products
- **Loyalty Program**: Gotyme rewards integration
- **Split Payments**: Multiple Gotyme accounts in single transaction
- **Recurring Payments**: Subscription billing with Gotyme

### **Advanced Integration**
- **Bank Transfers**: Direct Robinsons Bank integration
- **Credit Cards**: Gotyme card payment support
- **International Payments**: Cross-border payment support
- **Business Accounts**: Corporate Gotyme account integration

---

This guide provides a comprehensive foundation for integrating Gotyme into your FixMo platform. Gotyme offers competitive advantages with lower fees and growing user adoption, making it an excellent addition to your payment ecosystem. 