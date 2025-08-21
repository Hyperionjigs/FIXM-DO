# Admin Emails Guide - Future Reference

## 🔐 **Current Admin-Capable Emails**

As of the current setup, these are the **only emails capable of admin access**:

- **eroybelcesar@gmail.com**
- **jong_eroy@icloud.com** 
- **jong@xp-plus.com**

**Note**: This list may change in the future as more admin users are added.

## 🚀 **Initial Admin Setup (When Ready)**

### **Step 1: Get Your User ID**
1. **Start the development server**:
   ```bash
   cd /Volumes/JONGEX/BUILDS/FixMo-Reference
   npm run dev
   ```

2. **Navigate to debug page**: `http://localhost:9002/debug`

3. **Log in** with one of the admin-capable emails above

4. **Copy your User ID** from the debug page (click the copy button)

### **Step 2: Configure Admin Access**
1. **Edit the admin config file**: `src/lib/admin-config.ts`

2. **Add your User ID** to the `ADMIN_USER_IDS` array:
   ```typescript
   export const ADMIN_USER_IDS: string[] = [
     'your-user-id-here', // Replace with actual User ID from debug page
   ];
   ```

3. **Assign admin role** (optional, defaults to admin):
   ```typescript
   export const ADMIN_USER_ROLES: Record<string, string> = {
     'your-user-id-here': ADMIN_ROLES.SUPER_ADMIN, // or ADMIN_ROLES.ADMIN
   };
   ```

4. **Restart the development server** (Ctrl+C, then `npm run dev`)

### **Step 3: Access Admin Dashboard**
1. **Navigate to**: `http://localhost:9002/admin/transaction-logs`
2. **You should now see the transaction logs dashboard**

## 📊 **What You'll See in Admin Dashboard**

### **Transaction Logs Features:**
- **Real-time transaction monitoring**
- **Filter by**: Task ID, Transaction Type, User IDs, Dates, Status
- **Export capabilities**: JSON and CSV formats
- **Detailed transaction inspection** with metadata
- **User activity patterns**
- **Payment flow tracking**
- **Geographic activity data**

### **Transaction Types Tracked:**
- `task_created` - When tasks are created
- `task_claimed` - When tasks are claimed by taskers
- `task_completed` - When tasks are completed
- `review_submitted` - When reviews are submitted
- `payment_processed` - When payments are processed
- `dispute_filed` - When disputes are filed
- `refund_issued` - When refunds are issued

## 🔧 **Adding New Admin Users (Future)**

### **Step 1: Get New User's ID**
1. Have the new admin user log into the app
2. Navigate to `/debug` page
3. Copy their User ID

### **Step 2: Update Admin Configuration**
1. **Add to `ADMIN_USER_IDS`**:
   ```typescript
   export const ADMIN_USER_IDS: string[] = [
     'existing-admin-id',
     'new-admin-id-here', // Add new admin
   ];
   ```

2. **Assign role in `ADMIN_USER_ROLES`**:
   ```typescript
   export const ADMIN_USER_ROLES: Record<string, string> = {
     'existing-admin-id': ADMIN_ROLES.SUPER_ADMIN,
     'new-admin-id-here': ADMIN_ROLES.ADMIN, // or MODERATOR
   };
   ```

3. **Restart the development server**

### **Step 3: Verify Access**
- New admin should be able to access `/admin/transaction-logs`
- Test permissions and functionality

## 🛡️ **Admin Roles & Permissions**

### **Super Admin**
- **Full access** to all features
- **Can manage other admins**
- **System management capabilities**
- **All permissions**: view/export logs, manage users, manage tasks, system management

### **Admin**
- **Most features** except system management
- **Can view and export transaction logs**
- **Can manage users and tasks**
- **Permissions**: view/export logs, manage users, manage tasks, view system stats

### **Moderator**
- **Limited access** for basic monitoring
- **Can view transaction logs**
- **Cannot export or manage data**
- **Permissions**: view logs, view users, view tasks, view system stats

## 🔍 **Troubleshooting**

### **"Access Denied" Error**
- Check your user ID is correctly added to `ADMIN_USER_IDS`
- Verify you're logged in with the correct account
- Restart the application after making changes

### **Can't See Transaction Logs**
- Check your role has the required permissions
- Verify the API endpoint is working correctly
- Check browser console for error messages

### **Export Not Working**
- Ensure you have export permissions (`export_transaction_logs`)
- Check browser download settings
- Verify the API response in network tab

## 📁 **Key Files**

- **Admin Config**: `src/lib/admin-config.ts`
- **Transaction Logger**: `src/lib/transaction-logger.ts`
- **Admin Dashboard**: `src/app/admin/transaction-logs/page.tsx`
- **Admin API**: `src/app/api/admin/transaction-logs/route.ts`
- **Debug Page**: `src/app/debug/page.tsx`

## 🎯 **Quick Commands**

```bash
# Start development server
npm run dev

# Access debug page
http://localhost:9002/debug

# Access admin dashboard
http://localhost:9002/admin/transaction-logs
```

## 📝 **Notes**

- **Security**: Admin configuration should be stored securely in production
- **Environment Variables**: Consider using env vars for admin user IDs in production
- **Database Storage**: Future versions may store admin config in Firestore
- **JWT Verification**: Implement proper JWT token verification for production

---

**Last Updated**: Current setup
**Next Reminder**: Every other day until initial admin setup is complete 