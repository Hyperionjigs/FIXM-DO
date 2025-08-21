# Transaction Logging System

## Overview

The FixMo platform implements a comprehensive transaction logging system that creates secure audit files for every transaction between taskers and clients. This system ensures complete transparency and accountability while maintaining strict security controls.

## Key Features

### 🔒 **Admin-Only Access**
- Transaction logs are stored securely in the database with `adminOnly: true` flag
- Only authorized admin users can access transaction data
- Firestore security rules prevent unauthorized access

### 📝 **Comprehensive Transaction Tracking**
The system logs the following transaction types:
- **Task Creation** - When a client creates a new task
- **Task Claiming** - When a tasker accepts a task
- **Task Completion** - When a task is marked as completed
- **Review Submission** - When reviews are submitted
- **Payment Processing** - When payments are processed
- **Dispute Filing** - When disputes are filed
- **Refund Issuance** - When refunds are issued

### 🛡️ **Security & Privacy**
- **PII Sanitization** - Automatic removal of sensitive data (SSNs, credit cards, phone numbers, emails)
- **Audit Hashing** - Cryptographic hashes for data integrity verification
- **IP Tracking** - Records client IP addresses for security monitoring
- **User Agent Logging** - Tracks browser/device information
- **Location Data** - Optional location tracking for security purposes

### 📊 **Data Structure**

Each transaction log contains:

```typescript
interface TransactionLog {
  id?: string;
  transactionId: string;        // Unique UUID for this transaction
  taskId: string;              // Associated task ID
  transactionType: TransactionType;
  
  // Parties involved
  clientId: string;
  clientName: string;
  taskerId?: string;
  taskerName?: string;
  
  // Transaction details
  amount?: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  
  // Metadata
  description: string;
  metadata: Record<string, any>; // Additional transaction-specific data
  ipAddress?: string;
  userAgent?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  
  // Security and audit
  adminOnly: boolean;          // Ensures only admins can access
  encrypted: boolean;          // Indicates if sensitive data is encrypted
  auditHash?: string;          // Cryptographic hash for integrity
}
```

## Implementation

### 1. Transaction Logger Service

Located at `src/lib/transaction-logger.ts`, this service provides:

- **Singleton Pattern** - Ensures consistent logging across the application
- **Type Safety** - Full TypeScript support with proper interfaces
- **Error Handling** - Robust error handling and logging
- **Data Sanitization** - Automatic PII removal from comments and descriptions

### 2. Integration Points

The transaction logging is integrated into all major transaction flows:

#### Task Creation (`src/app/post/page.tsx`)
```typescript
// Log transaction for task creation
await TransactionLoggerService.logTaskCreation(
  docRef.id,
  user.uid,
  user.displayName || user.email || 'Anonymous',
  values.pay,
  values.title,
  TransactionLoggerService.getClientIP(),
  TransactionLoggerService.getUserAgent()
);
```

#### Task Claiming (`src/app/post/[id]/page.tsx`)
```typescript
// Log transaction for task claiming
await TransactionLoggerService.logTaskClaiming(
  post.id,
  post.authorId,
  post.authorName,
  user.uid,
  user.displayName || 'Anonymous',
  post.pay,
  post.title,
  TransactionLoggerService.getClientIP(),
  TransactionLoggerService.getUserAgent()
);
```

#### Task Completion (`src/app/post/[id]/page.tsx`)
```typescript
// Log transaction for task completion
await TransactionLoggerService.logTaskCompletion(
  post.id,
  post.authorId,
  post.authorName,
  post.taskerId!,
  post.taskerName!,
  post.pay,
  post.title,
  'tasker', // Completed by tasker
  TransactionLoggerService.getClientIP(),
  TransactionLoggerService.getUserAgent()
);
```

#### Review Submission (`src/app/dashboard/page.tsx`)
```typescript
// Log transaction for review submission
await TransactionLoggerService.logReviewSubmission(
  task.id,
  task.authorId,
  task.authorName,
  task.taskerId!,
  task.taskerName!,
  user.uid,
  user.displayName || 'Anonymous',
  personToReview,
  personToReviewName,
  rating,
  comment,
  TransactionLoggerService.getClientIP(),
  TransactionLoggerService.getUserAgent()
);
```

### 3. Admin API Endpoint

Located at `src/app/api/admin/transaction-logs/route.ts`, this provides:

- **Secure Access** - JWT token verification and admin role checking
- **Filtering** - Multiple filter options (task ID, transaction type, user IDs, date range)
- **Pagination** - Efficient data loading with pagination support
- **Export Functionality** - JSON and CSV export capabilities
- **Rate Limiting** - Built-in protection against abuse

### 4. Admin Dashboard

Located at `src/app/admin/transaction-logs/page.tsx`, this provides:

- **Real-time Viewing** - Live transaction log display
- **Advanced Filtering** - Multiple filter options with instant search
- **Export Tools** - One-click export to JSON or CSV
- **Detail Viewing** - Detailed transaction information in modal dialogs
- **Responsive Design** - Works on desktop and mobile devices

## Security Configuration

### Firestore Security Rules

```javascript
// Transaction logs - ADMIN ONLY ACCESS
// These contain sensitive transaction data and are only accessible by admin users
match /transaction_logs/{logId} {
  allow read, write: if false; // No direct access - only through admin functions
}
```

### Admin Access Control

To configure admin access:

1. **Add Admin User IDs** in `src/app/api/admin/transaction-logs/route.ts`:
```typescript
const ADMIN_USER_IDS = [
  'your-admin-user-id-here',
  'another-admin-user-id',
];
```

2. **Add Admin User IDs** in `src/app/admin/transaction-logs/page.tsx`:
```typescript
const ADMIN_USER_IDS = [
  'your-admin-user-id-here',
  'another-admin-user-id',
];
```

## Usage

### For Admins

1. **Access the Admin Dashboard**
   - Navigate to `/admin/transaction-logs`
   - Must be logged in with admin privileges

2. **View Transaction Logs**
   - Use filters to find specific transactions
   - Click the eye icon to view detailed information
   - Export data as needed

3. **Monitor Activity**
   - Track all transactions in real-time
   - Identify suspicious patterns
   - Generate reports for compliance

### For Developers

1. **Adding New Transaction Types**
   - Update the `TransactionType` enum in `src/types/index.ts`
   - Add corresponding logging method in `TransactionLoggerService`
   - Update admin dashboard filters

2. **Customizing Logging**
   - Modify the `createTransactionLog` method for custom fields
   - Update PII sanitization rules as needed
   - Add new metadata fields for specific transaction types

## Compliance & Audit

### Data Retention
- Transaction logs are retained indefinitely for audit purposes
- Regular backups ensure data preservation
- Export functionality allows for external audit trails

### Audit Trail
- Every transaction has a unique ID and timestamp
- Cryptographic hashes ensure data integrity
- IP addresses and user agents provide security context

### Privacy Protection
- PII is automatically sanitized from logs
- Sensitive data is marked and can be encrypted
- Access is restricted to authorized admin users only

## Monitoring & Alerts

### Suspicious Activity Detection
- Monitor for unusual transaction patterns
- Track failed transaction attempts
- Alert on potential security issues

### Performance Monitoring
- Transaction logging is asynchronous and non-blocking
- Minimal impact on user experience
- Efficient database queries with proper indexing

## Future Enhancements

### Planned Features
- **Real-time Notifications** - Alert admins to suspicious activity
- **Advanced Analytics** - Transaction pattern analysis
- **Machine Learning** - Automated fraud detection
- **Enhanced Encryption** - End-to-end encryption for sensitive data
- **Audit Reports** - Automated compliance reporting

### Integration Opportunities
- **Payment Processors** - Direct integration with Stripe, PayPal, etc.
- **Compliance Tools** - Integration with regulatory reporting systems
- **Security Platforms** - Integration with SIEM systems for monitoring

## Support

For questions or issues with the transaction logging system:

1. Check the console logs for error messages
2. Verify admin user IDs are correctly configured
3. Ensure Firestore security rules are properly deployed
4. Contact the development team for technical support

---

**Note**: This transaction logging system is designed to provide maximum transparency while maintaining strict security controls. All access is logged and monitored to ensure compliance with privacy regulations and security best practices. 