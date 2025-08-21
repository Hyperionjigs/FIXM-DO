# 🚀 Smart Payment System User Guide

## 📖 **Table of Contents**
1. [Overview](#overview)
2. [For Customers](#for-customers)
3. [For Administrators](#for-administrators)
4. [Payment Methods](#payment-methods)
5. [Risk Assessment](#risk-assessment)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## 🎯 **Overview**

The FixMo Smart Payment System is an intelligent payment processing solution that allows you to accept payments through GCash, PayMaya, and GoTyme without requiring formal API access. The system includes:

- **🧠 AI-Powered Risk Assessment** - Automatically evaluates payment risk
- **📱 Enhanced QR Code Generation** - Secure payment instructions
- **⚡ Real-time Monitoring** - Automatic payment detection
- **🛡️ Fraud Prevention** - Identifies suspicious transactions
- **📊 Analytics Dashboard** - Comprehensive payment insights

---

## 👥 **For Customers**

### **How to Make a Payment**

#### **Step 1: Access Payment Form**
1. Navigate to the payment page on FixMo
2. You'll see the Smart Payment Form with amount and description
3. Fill in your details:
   - **Full Name** (required)
   - **Phone Number** (required)
   - **Email** (optional)

#### **Step 2: Select Payment Method**
Choose from available options:
- **GCash** - Fastest processing for small amounts
- **PayMaya** - Balanced option for medium amounts
- **GoTyme** - Secure option for large amounts

#### **Step 3: Choose Priority**
- **Low Priority** - Standard processing (5-15 minutes)
- **Normal Priority** - Regular processing (5-15 minutes)
- **High Priority** - Faster processing (2-5 minutes)
- **Urgent Priority** - Immediate attention (1-2 minutes)

#### **Step 4: Create Payment**
1. Click "Create Payment"
2. System generates risk assessment
3. QR code and payment instructions appear

#### **Step 5: Complete Payment**
1. **Scan QR Code** with your mobile payment app
2. **OR** manually send payment to the provided account number
3. **Take Screenshot** of payment confirmation
4. **Upload Proof** (if required)
5. **Wait for Confirmation**

### **Payment Status Tracking**

The system shows real-time status updates:

- **🔄 Pending** - Payment created, waiting for completion
- **👁️ Detected** - Payment received, being verified
- **✅ Confirmed** - Payment verified and approved
- **🎉 Completed** - Transaction finalized
- **❌ Failed** - Payment failed or expired

### **Risk Assessment Display**

The system shows your payment risk level:

- **🟢 Low Risk (0-30)** - Automatic processing
- **🟡 Medium Risk (31-70)** - Standard processing
- **🔴 High Risk (71-100)** - Manual review required

### **Example Customer Flow**

```
1. Customer wants to pay ₱1,500 for a service
2. Fills form: Name, Phone, selects GCash, Normal priority
3. System assesses risk: 15 points (low risk)
4. Shows: "✅ This payment will be processed automatically"
5. QR code appears with GCash account details
6. Customer scans QR code and sends payment
7. System detects payment automatically
8. Payment confirmed within 5 minutes
9. Customer receives confirmation
```

---

## 👨‍💼 **For Administrators**

### **Accessing the Dashboard**

1. **Login** to admin panel
2. **Navigate** to Smart Payment Dashboard
3. **View** real-time payment overview

### **Dashboard Overview**

#### **Analytics Cards**
- **Total Payments** - Number of all transactions
- **Total Amount** - Sum of all payments
- **Average Risk Score** - Overall risk assessment
- **Fraud Rate** - Percentage of suspicious transactions

#### **Payment Management**
- **Filter by Status** - Pending, Confirmed, Failed, etc.
- **Search Payments** - By customer name, phone, or reference
- **Real-time Updates** - Refreshes every 30 seconds

### **Managing Payments**

#### **Viewing Payment Details**
1. Click the **👁️ Eye** button on any payment
2. View complete payment information:
   - Customer details
   - Payment amount and method
   - Risk assessment
   - Fraud indicators (if any)
   - Payment history

#### **Confirming Payments**
1. **Open** payment details
2. **Review** payment proof and risk assessment
3. **Add notes** (optional)
4. **Click** "Confirm Payment"
5. **System** sends confirmation to customer

#### **Detecting Payments**
1. **Click** "Detect Payment" button
2. **System** simulates payment detection
3. **Status** updates to "Detected"
4. **Auto-confirm** if low risk

#### **Handling High-Risk Payments**
1. **Review** fraud indicators
2. **Check** customer history
3. **Verify** payment proof carefully
4. **Add detailed notes**
5. **Make decision** (confirm/reject)

### **Analytics Tab**

#### **Payment Method Distribution**
- Shows usage of GCash, PayMaya, GoTyme
- Helps optimize payment routing

#### **Risk Score Distribution**
- Visual representation of risk levels
- Helps identify fraud patterns

### **Example Admin Flow**

```
1. Admin logs into dashboard
2. Sees 5 pending payments
3. Clicks on payment with risk score 75
4. Reviews fraud indicators: "New customer", "High amount"
5. Checks payment proof screenshot
6. Adds notes: "Verified with customer"
7. Confirms payment
8. Customer receives confirmation
9. Payment status updates to "Confirmed"
```

---

## 💳 **Payment Methods**

### **GCash**
- **Account**: 09565121085
- **Best for**: Small-medium amounts (<₱1,000)
- **Processing**: Fastest (1-5 minutes)
- **Features**: QR code scanning, direct transfer

### **PayMaya**
- **Account**: 09603845762
- **Best for**: Medium amounts (₱1,000-₱5,000)
- **Processing**: Balanced (5-15 minutes)
- **Features**: QR payments, card integration

### **GoTyme**
- **Account**: 09603845762
- **Best for**: Large amounts (>₱5,000)
- **Processing**: Secure (10-30 minutes)
- **Features**: High security, fraud protection

---

## 🧠 **Risk Assessment**

### **How Risk Scoring Works**

The system evaluates each payment using multiple factors:

#### **Customer History (40%)**
- **New customer**: +20 points
- **Previous failed payments**: +25 points
- **High frequency payments**: +30 points

#### **Transaction Details (35%)**
- **High amount (>₱10K)**: +15 points
- **Very low amount (<₱100)**: +10 points
- **Urgent priority**: +10 points

#### **Behavioral Patterns (25%)**
- **Late night transactions**: +15 points
- **Unusual payment times**: +10 points
- **Multiple rapid payments**: +20 points

### **Risk Levels**

| Risk Score | Level | Processing | Action Required |
|------------|-------|------------|-----------------|
| 0-30 | Low | Automatic | None |
| 31-70 | Medium | Standard | None |
| 71-100 | High | Manual Review | Admin verification |

### **Fraud Indicators**

The system flags suspicious patterns:
- **New customer with high amount**
- **Multiple failed payment attempts**
- **Unusual payment frequency**
- **Late night transactions**
- **Mismatched customer information**

---

## 🔧 **Troubleshooting**

### **Common Customer Issues**

#### **Payment Not Detected**
1. **Check** payment was sent to correct account
2. **Verify** reference number matches
3. **Wait** 5-15 minutes for processing
4. **Contact** support if still pending

#### **QR Code Not Working**
1. **Ensure** mobile payment app is updated
2. **Try** manual account number entry
3. **Check** internet connection
4. **Restart** payment app

#### **Payment Expired**
1. **Create** new payment request
2. **Complete** payment within 60 minutes
3. **Contact** support for refund if needed

#### **High Risk Score**
1. **Provide** additional verification
2. **Wait** for manual review (2-4 hours)
3. **Contact** support for assistance

### **Common Admin Issues**

#### **Payment Not Confirming**
1. **Check** payment proof screenshot
2. **Verify** amount and reference match
3. **Review** customer history
4. **Contact** customer for clarification

#### **System Not Updating**
1. **Refresh** dashboard manually
2. **Check** internet connection
3. **Clear** browser cache
4. **Contact** technical support

#### **High Fraud Rate**
1. **Review** risk assessment parameters
2. **Check** payment patterns
3. **Update** fraud detection rules
4. **Monitor** suspicious activities

---

## ❓ **FAQ**

### **For Customers**

**Q: How long does payment processing take?**
A: Low-risk payments: 5-15 minutes. High-risk payments: 2-4 hours (manual review).

**Q: What if my payment fails?**
A: Check the error message, verify account details, and try again. Contact support if issues persist.

**Q: Can I cancel a payment?**
A: Payments cannot be cancelled once created. Wait for expiry (60 minutes) or contact support.

**Q: Is my payment information secure?**
A: Yes, all data is encrypted and stored securely. We never store payment credentials.

**Q: What payment methods are accepted?**
A: GCash, PayMaya, and GoTyme are currently supported.

### **For Administrators**

**Q: How do I handle suspicious payments?**
A: Review fraud indicators, check customer history, verify payment proof, and make informed decisions.

**Q: Can I override risk assessments?**
A: Yes, you can manually confirm or reject any payment regardless of risk score.

**Q: How often should I check the dashboard?**
A: The dashboard auto-refreshes every 30 seconds. Check at least once per hour during business hours.

**Q: What if a customer disputes a payment?**
A: Review payment proof, customer history, and contact the customer for resolution.

**Q: How do I optimize payment routing?**
A: Monitor payment method usage in analytics and adjust routing rules based on performance.

---

## 📞 **Support**

### **Customer Support**
- **Email**: support@fixmo.com
- **Phone**: +63 956 512 1085
- **Hours**: 24/7

### **Technical Support**
- **Email**: tech@fixmo.com
- **Phone**: +63 960 384 5762
- **Hours**: 8 AM - 8 PM (PHT)

### **Emergency Contact**
- **For urgent payment issues**: +63 956 512 1085
- **For system problems**: +63 960 384 5762

---

## 🎉 **Getting Started**

### **For Customers**
1. **Visit** FixMo payment page
2. **Fill** payment form
3. **Select** payment method
4. **Complete** payment
5. **Wait** for confirmation

### **For Administrators**
1. **Login** to admin dashboard
2. **Review** pending payments
3. **Monitor** risk assessments
4. **Confirm** valid payments
5. **Track** analytics

**The Smart Payment System is designed to be simple, secure, and efficient for both customers and administrators. Start accepting payments today!** 🚀 