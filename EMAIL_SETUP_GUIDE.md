# FixMo Email Service Setup Guide

## 🎯 **Overview**

This guide will help you set up the email service for FixMo with `eroybelcesar@gmail.com` as the default sender. The email service supports multiple email templates and can be used for user notifications, payment confirmations, and admin alerts.

## 📧 **Email Service Features**

### **Available Email Templates:**
- ✅ **Welcome Email** - New user onboarding
- ✅ **Payment Confirmation** - Payment success notifications
- ✅ **Task Completion** - Task completion notifications
- ✅ **Verification Status** - Account verification updates
- ✅ **Admin Notifications** - System alerts for administrators
- ✅ **Custom Emails** - Send custom messages

### **Email Service Capabilities:**
- 🔒 **Secure SMTP** - TLS/SSL encryption
- 📱 **Responsive Templates** - Mobile-friendly email design
- 🎨 **Professional Design** - Branded email templates
- 📊 **Delivery Tracking** - Email delivery status
- ⚡ **High Performance** - Fast email delivery
- 🔧 **Easy Configuration** - Simple setup process

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Install Dependencies**
```bash
npm install nodemailer @types/nodemailer
```

### **Step 2: Set Environment Variables**
Create or update your `.env.local` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=eroybelcesar@gmail.com
SMTP_PASS=your_app_password_here

# Email sender configuration
SENDER_EMAIL=eroybelcesar@gmail.com
SENDER_NAME=FixMo Support

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### **Step 3: Generate Gmail App Password**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable **2-Step Verification** if not already enabled
3. Go to **Security** → **App passwords**
4. Select **Mail** and generate a new app password
5. Copy the generated password and use it as `SMTP_PASS`

### **Step 4: Test the Email Service**
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3001/test-email`
3. Click **Test Connection** to verify setup
4. Send a test email to verify functionality

## 🔧 **Detailed Configuration**

### **Gmail SMTP Settings**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=eroybelcesar@gmail.com
SMTP_PASS=your_16_character_app_password
```

### **Alternative Email Providers**

#### **Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=eroybelcesar@outlook.com
SMTP_PASS=your_password
```

#### **Yahoo Mail:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=eroybelcesar@yahoo.com
SMTP_PASS=your_app_password
```

#### **Custom SMTP Server:**
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your_password
```

## 📁 **Files Created/Modified**

### **New Files:**
- `src/lib/email-service.ts` - Main email service
- `src/app/api/test-email/route.ts` - Email testing API
- `src/app/test-email/page.tsx` - Email testing interface
- `EMAIL_SETUP_GUIDE.md` - This guide

### **Modified Files:**
- `src/lib/config-service.ts` - Added email configuration
- `src/app/api/admin/config/route.ts` - Added email settings
- `env.example` - Added email environment variables
- `package.json` - Added nodemailer dependencies

## 🧪 **Testing the Email Service**

### **1. Connection Test**
```bash
curl -X GET http://localhost:3001/api/test-email
```

### **2. Send Test Email**
```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "testType": "welcome"
  }'
```

### **3. Web Interface**
Visit `http://localhost:3001/test-email` for a user-friendly testing interface.

## 📧 **Email Templates**

### **Welcome Email**
- **Subject:** Welcome to FixMo! 🎉
- **Content:** New user onboarding with platform features
- **Use Case:** User registration

### **Payment Confirmation**
- **Subject:** Payment Confirmed - FixMo 💰
- **Content:** Payment details and confirmation
- **Use Case:** Successful payment processing

### **Task Completion**
- **Subject:** Task Completed - Payment Processed 💰
- **Content:** Task details and payment information
- **Use Case:** Task completion notification

### **Verification Status**
- **Subject:** Verification Approved/Update - FixMo ✅/📋
- **Content:** Account verification status
- **Use Case:** Identity verification updates

### **Admin Notification**
- **Subject:** Admin Alert: [Subject] ⚠️
- **Content:** System alerts and notifications
- **Use Case:** Administrative notifications

## 🔧 **Integration Examples**

### **Send Welcome Email**
```typescript
import { emailService } from '@/lib/email-service';

// Send welcome email to new user
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');
```

### **Send Payment Confirmation**
```typescript
await emailService.sendPaymentConfirmationEmail('user@example.com', 'John Doe', {
  amount: 1000,
  currency: 'PHP',
  paymentId: 'PAY-123456',
  paymentMethod: 'GCash'
});
```

### **Send Task Completion**
```typescript
await emailService.sendTaskCompletionEmail('user@example.com', 'John Doe', {
  taskId: 'TASK-789',
  taskTitle: 'House Cleaning',
  amount: 500,
  currency: 'PHP'
});
```

### **Send Verification Status**
```typescript
// Approved
await emailService.sendVerificationStatusEmail('user@example.com', 'John Doe', 'approved');

// Rejected with reason
await emailService.sendVerificationStatusEmail('user@example.com', 'John Doe', 'rejected', 'ID document unclear');
```

### **Send Admin Notification**
```typescript
await emailService.sendAdminNotification(
  ['admin@fixmo.com', 'eroybelcesar@gmail.com'],
  'System Alert',
  'High transaction volume detected',
  { volume: 1000, timestamp: new Date().toISOString() }
);
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. "Authentication failed" Error**
**Solution:** 
- Verify your Gmail app password is correct
- Ensure 2-Step Verification is enabled
- Check that you're using the app password, not your regular password

#### **2. "Connection timeout" Error**
**Solution:**
- Check your internet connection
- Verify SMTP settings (host, port, secure)
- Try different SMTP ports (587, 465, 25)

#### **3. "Email not received"**
**Solution:**
- Check spam/junk folder
- Verify recipient email address
- Check email service logs
- Test with a different email provider

#### **4. "Invalid sender email" Error**
**Solution:**
- Ensure sender email matches SMTP user
- Check email format and domain
- Verify email account exists

### **Debug Mode:**
Enable debug logging by setting:
```env
DEBUG=email:*
```

## 🔒 **Security Best Practices**

### **1. Environment Variables**
- Never commit email passwords to version control
- Use `.env.local` for local development
- Use secure environment variables in production

### **2. App Passwords**
- Use app-specific passwords, not regular passwords
- Generate unique passwords for each environment
- Rotate passwords regularly

### **3. Rate Limiting**
- Implement rate limiting for email sending
- Monitor email sending patterns
- Set daily/monthly email limits

### **4. Email Validation**
- Validate email addresses before sending
- Implement email verification for new users
- Use email templates to prevent injection attacks

## 📊 **Monitoring & Analytics**

### **Email Metrics to Track:**
- ✅ **Delivery Rate** - Percentage of emails delivered
- ✅ **Open Rate** - Percentage of emails opened
- ✅ **Click Rate** - Percentage of links clicked
- ✅ **Bounce Rate** - Percentage of failed deliveries
- ✅ **Spam Complaints** - Number of spam reports

### **Logging:**
```typescript
// Email service logs all activities
console.log('✅ Email sent successfully to user@example.com: message-id-123');
console.log('❌ Failed to send email: Authentication failed');
```

## 🚀 **Production Deployment**

### **1. Environment Variables**
Set production environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=eroybelcesar@gmail.com
SMTP_PASS=your_production_app_password
SENDER_EMAIL=eroybelcesar@gmail.com
SENDER_NAME=FixMo Support
NEXT_PUBLIC_APP_URL=https://fixmo.com
```

### **2. Email Service Verification**
```bash
# Test production email service
curl -X GET https://fixmo.com/api/test-email
```

### **3. Monitoring Setup**
- Set up email delivery monitoring
- Configure error alerts
- Monitor email service performance

## 📞 **Support & Maintenance**

### **Regular Maintenance:**
- ✅ **Monthly:** Review email delivery rates
- ✅ **Quarterly:** Update email templates
- ✅ **Annually:** Rotate app passwords
- ✅ **As needed:** Update sender information

### **Contact Information:**
- **Technical Support:** eroybelcesar@gmail.com
- **Email Issues:** Check logs and test interface
- **Template Updates:** Modify email-service.ts

## 🎉 **Success Checklist**

- [ ] Email service installed and configured
- [ ] Gmail app password generated and set
- [ ] Environment variables configured
- [ ] Connection test successful
- [ ] Test email sent and received
- [ ] All email templates tested
- [ ] Production environment configured
- [ ] Monitoring and logging set up

---

**🎯 Email service is now ready to use with eroybelcesar@gmail.com as the sender!**

For any questions or issues, please refer to the troubleshooting section or contact the development team. 