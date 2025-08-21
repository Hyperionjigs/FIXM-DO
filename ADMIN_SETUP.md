# Admin Setup Guide

## Quick Setup

To configure admin access for the transaction logging system, follow these steps:

### 1. Quick Setup with Email Domain (Recommended)

**Option A: Email Domain Access (Easiest)**
If you have an email ending with `@fixmotech.org`, you automatically get admin access!

1. **Log into the FixMo application** with your `@fixmotech.org` email
2. **Navigate to** `/admin-setup` to verify your admin status
3. **Access the admin dashboard** at `/admin`

**Option B: Manual User ID Setup**
If you prefer manual configuration:

1. **Log into the FixMo application**
2. **Navigate to** `/debug` or `/admin-setup`
3. **Copy your User ID** from the page
4. **Edit** `src/lib/admin-config.ts` and add your User ID to the `ADMIN_USER_IDS` array

### 2. Configure Admin Access

**For Email Domain Access (Recommended):**
No configuration needed! Users with `@fixmotech.org` emails automatically get admin access.

**For Manual User ID Setup:**
Edit the file `src/lib/admin-config.ts` and add your user ID:

```typescript
// Admin user IDs - Add your admin user IDs here
export const ADMIN_USER_IDS: string[] = [
  'your-user-id-here', // Replace with your actual user ID
  // Add more admin user IDs as needed
];

// Admin user role mapping
export const ADMIN_USER_ROLES: Record<string, string> = {
  'your-user-id-here': ADMIN_ROLES.SUPER_ADMIN, // Give yourself super admin role
  // Add more user role mappings as needed
};
```

### 3. Restart the Application

After making changes to the admin configuration:

1. **Stop the development server** (Ctrl+C)
2. **Restart the application**:
   ```bash
   npm run dev
   ```

### 4. Access the Admin Dashboard

1. **Log into the application** with your admin account
2. **Navigate to** `/admin/transaction-logs`
3. **You should now see the transaction logs dashboard**

## Admin Roles

The system supports three admin roles:

### Super Admin
- **Full access** to all features
- **Can manage other admins**
- **System management capabilities**

### Admin
- **Most features** except system management
- **Can view and export transaction logs**
- **Can manage users and tasks**

### Moderator
- **Limited access** for basic monitoring
- **Can view transaction logs**
- **Cannot export or manage data**

## Security Best Practices

### 1. Use Strong Authentication
- Ensure your Firebase Auth is properly configured
- Use strong passwords and enable 2FA if available

### 2. Limit Admin Access
- Only grant admin access to trusted users
- Regularly review admin user list
- Remove access for users who no longer need it

### 3. Monitor Admin Activity
- Regularly check transaction logs for admin actions
- Set up alerts for suspicious activity
- Keep admin user list updated

### 4. Secure Configuration
- In production, store admin configuration securely
- Use environment variables for sensitive data
- Implement proper role-based access control

## Troubleshooting

### "Access Denied" Error
- **Check your user ID** is correctly added to `ADMIN_USER_IDS`
- **Verify you're logged in** with the correct account
- **Restart the application** after making changes

### Can't See Transaction Logs
- **Check your role** has the required permissions
- **Verify the API endpoint** is working correctly
- **Check browser console** for error messages

### Export Not Working
- **Ensure you have export permissions** (`export_transaction_logs`)
- **Check browser download settings**
- **Verify the API response** in network tab

## Production Deployment

For production deployment, consider these additional security measures:

### 1. Environment Variables
Store admin configuration in environment variables:

```typescript
export const ADMIN_USER_IDS: string[] = 
  process.env.ADMIN_USER_IDS?.split(',') || [];
```

### 2. Database Storage
Store admin configuration in the database:

```typescript
// Store admin users in Firebase
const adminUsersRef = collection(db, 'admin_users');
```

### 3. JWT Verification
Implement proper JWT token verification:

```typescript
import { verifyIdToken } from 'firebase-admin/auth';

const decodedToken = await verifyIdToken(token);
const userId = decodedToken.uid;
```

### 4. Rate Limiting
Add rate limiting to admin endpoints:

```typescript
// Implement rate limiting for admin API calls
const rateLimit = require('express-rate-limit');
```

## Support

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify your user ID** is correct
3. **Ensure you're logged in** with the right account
4. **Restart the application** after configuration changes
5. **Contact the development team** for technical support

---

**Note**: This setup guide is for development purposes. In production, implement proper security measures and admin management systems. 