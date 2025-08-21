# Payment Account Configuration Guide

## 🎯 **Current Configuration**

Your FixMo payment system is now configured with the following account details:

### **GCash Account** ✅ **CONFIGURED**
- **Phone Number**: `09565121085`
- **Account Name**: `FixMo Platform`
- **Status**: Active
- **Instructions**: Send to GCash number: 09565121085

### **PayMaya Account** ✅ **CONFIGURED**
- **Phone Number**: `09603845762`
- **Account Name**: `FixMo Platform`
- **Status**: Active
- **Instructions**: Send to PayMaya number: 09603845762

### **GoTyme Account** ✅ **CONFIGURED**
- **Phone Number**: `09603845762`
- **Account Name**: `FixMo Platform`
- **Status**: Active
- **Instructions**: Send to GoTyme number: 09603845762

### **Cash Payments** ❌ **REMOVED**
- **Status**: Disabled
- **Reason**: Digital payments only (GCash, PayMaya, GoTyme)

## 🔧 **How to Update Payment Account Details**

### **Method 1: Edit Configuration File (Recommended)**

1. **Open the configuration file**:
   ```bash
   src/lib/payment-config.ts
   ```

2. **Update the account details**:
   ```typescript
   export const PAYMENT_CONFIG = {
     gcash: {
       phoneNumber: '09565121085', // Update this
       accountName: 'FixMo Platform', // Update this
       instructions: 'Send to GCash number: 09565121085',
       isActive: true
     },
     // ... other configurations
   };
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

### **Method 2: Using the Update Function**

You can also update account details programmatically:

```typescript
import { updatePaymentAccount } from '@/lib/payment-config';

// Update GCash account
updatePaymentAccount('gcash', {
  phoneNumber: 'new-number-here',
  accountName: 'New Account Name'
});

// Update PayMaya account
updatePaymentAccount('paymaya', {
  phoneNumber: 'paymaya-number-here',
  accountName: 'FixMo Platform',
  isActive: true
});
```

## 📱 **Adding PayMaya Account**

To add your PayMaya account:

1. **Get your PayMaya account number** (phone number linked to PayMaya)

2. **Update the configuration**:
   ```typescript
   paymaya: {
     phoneNumber: 'your-paymaya-number', // Add your PayMaya number here
     accountName: 'FixMo Platform',
     instructions: 'Send to PayMaya account',
     isActive: true // Change this to true
   }
   ```

3. **Restart the server** and PayMaya payments will be active

## 🏦 **Adding GoTyme Account**

To add your GoTyme account:

1. **Get your GoTyme account number** (phone number linked to GoTyme)

2. **Update the configuration**:
   ```typescript
   gotyme: {
     phoneNumber: 'your-gotyme-number', // Add your GoTyme number here
     accountName: 'FixMo Platform',
     instructions: 'Send to GoTyme account',
     isActive: true // Change this to true
   }
   ```

3. **Restart the server** and GoTyme payments will be active

**Note**: GoTyme also has API integration available. If you get merchant account credentials, you can enable automated payments by setting up the environment variables in the GoTyme service.

## 🔄 **How the Payment System Works Now**

### **For Customers:**

1. **Select Payment Method**: GCash, PayMaya, or Cash
2. **See Account Details**: Your account number is displayed
3. **Follow Instructions**: Step-by-step payment instructions
4. **Send Payment**: Using the provided account number
5. **Upload Proof**: Screenshot of payment confirmation
6. **Wait for Verification**: Admin confirms payment

### **For Admins:**

1. **Monitor Payments**: View pending payments in admin dashboard
2. **Verify Payments**: Check payment proof screenshots
3. **Confirm/Reject**: Approve or reject payments
4. **Track Transactions**: Complete audit trail

## 💰 **Money Flow**

### **GCash Payments:**
- **From**: Customer's GCash account
- **To**: Your GCash account (`09565121085`)
- **Method**: Direct transfer via GCash app
- **Verification**: Manual screenshot review

### **PayMaya Payments:**
- **From**: Customer's PayMaya account
- **To**: Your PayMaya account (`09603845762`)
- **Method**: Direct transfer via PayMaya app
- **Verification**: Manual screenshot review

### **GoTyme Payments:**
- **From**: Customer's GoTyme account
- **To**: Your GoTyme account (`09603845762`)
- **Method**: Direct transfer via GoTyme app
- **Verification**: Manual screenshot review



## 🛡️ **Security Features**

- **Account Verification**: Only configured accounts are used
- **Payment Proof**: Screenshot verification required
- **Admin Approval**: All payments require admin confirmation
- **Audit Trail**: Complete transaction logging
- **Expiry Management**: Payments expire after 60 minutes

## 📞 **Support Information**

### **Admin Contact:**
- **Email**: `eroybelcesar@gmail.com`
- **Phone**: `09565121085`
- **Business Hours**: 9:00 AM - 6:00 PM (PHT)
- **Response Time**: Within 15 minutes during business hours

### **Payment Support:**
- **Email**: `payments@fixmo.com`
- **Phone**: `09565121085`
- **In-App**: Use chat feature for immediate support

## 🚀 **Next Steps**

1. **Test the payment system** with small amounts
2. **Add PayMaya account** when available
3. **Train admin team** on payment verification
4. **Monitor payment flows** and optimize as needed
5. **Consider payment aggregators** for automation

## ✅ **Configuration Complete**

Your payment system is now fully configured and ready to accept payments! Customers will see your specific account details and clear instructions for making payments.

**The money will go directly to your configured accounts:**
- **GCash**: `09565121085`
- **PayMaya**: `09603845762`
- **GoTyme**: `09603845762` 