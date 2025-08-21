# FixMo Admin Dashboard Access Guide

**Date:** December 2024  
**Recipient:** eroybelcesar@gmail.com  
**Subject:** Complete Admin Dashboard Access Instructions

---

## 📧 **Email Delivery Note**
*This guide has been documented and saved locally. The email service is configured but may require SMTP credentials to send emails. You can access this guide directly from the project files.*

---

## 🔐 **Admin Dashboard Access Methods**

### **Method 1: Email Domain Access (Recommended)**

**Automatic Access for Team Members:**
If you have an email ending with `@fixmotech.org`, you automatically get admin access!

**Steps:**
1. **Log into the FixMo application** with your `@fixmotech.org` email
2. **Navigate directly to**: `/admin`
3. **Or use the navigation menu** - you'll see an "Admin Dashboard" link in the header

**Current Admin Email Domains:**
- `@fixmotech.org` (Primary company domain)
- `@admin.fixmotech.org` (Admin subdomain)
- `@fixmotech.com` (Alternative domain)

### **Method 2: Manual User ID Setup**

**For users without admin email domains:**

1. **Log into the FixMo application**
2. **Navigate to** `/admin-setup` or `/debug` to get your User ID
3. **Edit** `src/lib/admin-config.ts` and add your User ID to the `ADMIN_USER_IDS` array:
   ```typescript
   export const ADMIN_USER_IDS: string[] = [
     'your-user-id-here', // Replace with your actual User ID
   ];
   ```
4. **Restart the development server** (Ctrl+C, then `npm run dev`)
5. **Navigate to** `/admin`

### **Method 3: Specific Email Configuration**

**Pre-configured admin emails:**
- `hyperion@fixmotech.com` (Already configured)

---

## 🚀 **Quick Access Steps**

### **Development Environment:**
1. **Start your development server**: `npm run dev`
2. **Log in** with an admin-capable email
3. **Navigate to**: `http://localhost:3002/admin`
4. **Or click "Admin Dashboard"** in the header navigation

### **Production Environment:**
1. **Log in** with an admin-capable email
2. **Navigate to**: `https://yourdomain.com/admin`
3. **Or use the navigation menu**

---

## 📊 **Admin Dashboard Features**

### **Main Dashboard (`/admin`)**
- **System Statistics Overview**
- **User Activity Monitoring**
- **Revenue Tracking**
- **Task Management Overview**
- **Quick Access to All Admin Tools**

### **Transaction Logs (`/admin/transaction-logs`)**
- **Real-time transaction monitoring**
- **Filter by**: Task ID, Transaction Type, User IDs, Dates, Status
- **Export capabilities**: JSON and CSV formats
- **Detailed transaction inspection** with metadata
- **User activity patterns**
- **Payment flow tracking**
- **Geographic activity data**

### **Badge Management (`/admin/badge-management`)**
- **Manage user badges and achievements**
- **Configure badge requirements**
- **View badge statistics**
- **Award badges to users**

### **Verification Management (`/admin/verification-management`)**
- **Review pending verifications**
- **Manage verification queue**
- **Approve/reject verification requests**
- **Monitor verification statistics**

### **Settings (`/admin/settings`)**
- **System configuration**
- **Admin user management**
- **Security settings**
- **Email configuration**

---

## 🔧 **Admin Roles & Permissions**

### **Super Admin**
- **Full access** to all features
- **Can manage other admins**
- **System management capabilities**
- **All permissions enabled**

### **Admin**
- **Most admin features**
- **User and task management**
- **Transaction monitoring**
- **Limited system management**

### **Moderator**
- **Basic monitoring capabilities**
- **View-only access to most features**
- **Limited management tools**

---

## 🛠 **Troubleshooting**

### **Access Denied Error**
**Problem:** "You do not have permission to access this page"

**Solutions:**
1. **Check your email domain** - ensure it ends with `@fixmotech.org`
2. **Verify your User ID** - check `/admin-setup` page
3. **Restart the server** after configuration changes
4. **Clear browser cache** and log in again

### **Admin Dashboard Not Loading**
**Problem:** Dashboard shows loading indefinitely

**Solutions:**
1. **Check authentication** - ensure you're logged in
2. **Verify admin status** - check `/admin-setup` page
3. **Check browser console** for errors
4. **Restart development server**

### **Missing Admin Link in Header**
**Problem:** "Admin Dashboard" link not visible

**Solutions:**
1. **Log out and log back in** with admin email
2. **Check admin configuration** in `src/lib/admin-config.ts`
3. **Verify email domain** is in `ADMIN_EMAIL_DOMAINS`
4. **Clear browser cache**

---

## 📁 **Configuration Files**

### **Main Admin Config:** `src/lib/admin-config.ts`
```typescript
// Admin email domains
export const ADMIN_EMAIL_DOMAINS: string[] = [
  'fixmotech.org',
  'admin.fixmotech.org',
  'fixmotech.com',
];

// Admin user IDs
export const ADMIN_USER_IDS: string[] = [
  // Add specific user IDs here
];

// Admin emails
export const ADMIN_EMAILS: string[] = [
  'hyperion@fixmotech.com',
];
```

### **Admin Routes:** `src/app/admin/`
- `page.tsx` - Main dashboard
- `transaction-logs/page.tsx` - Transaction monitoring
- `badge-management/page.tsx` - Badge management
- `verification-management/page.tsx` - Verification tools
- `settings/page.tsx` - System settings

---

## 📧 **Support & Contact**

**For technical issues:**
- **Check the debug page**: `/debug`
- **Review admin setup**: `/admin-setup`
- **Check browser console** for errors
- **Restart development server**

**For access requests:**
- **Email domain**: Add to `ADMIN_EMAIL_DOMAINS` array
- **User ID**: Add to `ADMIN_USER_IDS` array
- **Specific email**: Add to `ADMIN_EMAILS` array

---

## 🔒 **Security Notes**

1. **Admin access is restricted** to authorized users only
2. **Email domain verification** provides automatic access for team members
3. **User ID verification** provides manual access control
4. **Role-based permissions** limit access based on admin level
5. **All admin actions are logged** for security auditing

---

## 📋 **Quick Reference Commands**

### **Start Development Server:**
```bash
npm run dev
```

### **Access Admin Dashboard:**
- **URL**: `http://localhost:3002/admin`
- **Alternative**: Click "Admin Dashboard" in header navigation

### **Check Admin Status:**
- **URL**: `http://localhost:3002/admin-setup`
- **URL**: `http://localhost:3002/debug`

### **Test Email Service:**
- **URL**: `http://localhost:3002/test-email`
- **API**: `http://localhost:3002/api/test-email`

---

**Document prepared for:** eroybelcesar@gmail.com  
**FixMo Platform Admin Access Guide**  
**Version:** 1.0  
**Last Updated:** December 2024  
**File Location:** `/Volumes/JONGEX/BUILDS/FixMo-master/ADMIN_DASHBOARD_ACCESS_GUIDE.md` 