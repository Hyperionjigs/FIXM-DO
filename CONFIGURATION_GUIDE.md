# FixMo Reference Configuration Guide

This guide explains the comprehensive configuration system built into the FixMo Reference platform.

## Overview

The configuration system provides centralized management of all platform settings through an admin dashboard. It includes settings for security, verification, payments, AI models, performance, and notifications.

## Configuration Categories

### 1. General Settings
- **Platform Name**: The display name for the platform
- **Platform Description**: Description shown to users
- **Maintenance Mode**: Temporarily disable the platform
- **Debug Mode**: Enable detailed logging and debugging

### 2. Security Settings
- **Max Login Attempts**: Number of failed login attempts before lockout (1-10)
- **Session Timeout**: Session duration in seconds (300-86400)
- **Require Two-Factor Authentication**: Force 2FA for all users
- **Password Minimum Length**: Minimum password length (6-32)

### 3. Verification Settings
- **Selfie Verification**: Enable selfie-based identity verification
- **Anti-Spoofing Protection**: Detect and prevent spoofing attempts
- **Verification Timeout**: Time limit for verification process (60-1800 seconds)
- **Max Verification Attempts**: Maximum attempts per user (1-10)

### 4. Notification Settings
- **Email Notifications**: Send notifications via email
- **Push Notifications**: Send push notifications to devices
- **SMS Notifications**: Send notifications via SMS
- **Notification Frequency**: How often to send notifications (immediate/hourly/daily)

### 5. Payment Settings
- **Enable Payments**: Allow users to make payments
- **Currency**: Supported currency (PHP, USD, EUR, GBP)
- **Minimum Payment**: Minimum payment amount
- **Maximum Payment**: Maximum payment amount
- **Transaction Fee**: Percentage fee on transactions (0-10%)

### 6. AI & Performance Settings
- **AI Model Version**: Current AI model version
- **AI Confidence Threshold**: Minimum confidence for AI decisions (0-1)
- **AI Processing Timeout**: Time limit for AI processing (10-300 seconds)
- **Enable AI Testing**: Allow AI model testing
- **Cache Enabled**: Enable data caching
- **Cache Timeout**: Cache duration in seconds (60-86400)
- **Image Compression**: Compress uploaded images
- **Max Image Size**: Maximum image size in bytes (1MB-10MB)

## Accessing Configuration

### Admin Dashboard
1. Navigate to `/admin/settings`
2. Use the tabbed interface to access different configuration categories
3. Make changes and click "Save Changes"
4. Use "Reset to Defaults" to restore default settings

### API Endpoints

#### Get Configuration
```http
GET /api/admin/config
```

#### Update Configuration
```http
PUT /api/admin/config
Content-Type: application/json

{
  "config": {
    "platformName": "Updated Name",
    "maintenanceMode": false
  }
}
```

#### Reset Configuration
```http
POST /api/admin/config
Content-Type: application/json

{
  "action": "reset"
}
```

## Using Configuration in Code

### Configuration Service
```typescript
import { configService } from '@/lib/config-service';

// Get all configuration
const config = configService.getConfig();

// Get specific setting
const isMaintenanceMode = configService.isMaintenanceMode();
const aiVersion = configService.getAIModelVersion();

// Update configuration
await configService.updateConfig({
  maintenanceMode: true
});
```

### React Hook
```typescript
import { useConfig } from '@/hooks/use-config';

function MyComponent() {
  const { 
    config, 
    loading, 
    isMaintenanceMode, 
    isPaymentEnabled,
    updateConfig 
  } = useConfig();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Maintenance Mode: {isMaintenanceMode ? 'On' : 'Off'}</p>
      <p>Payments: {isPaymentEnabled ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
}
```

### Maintenance Mode Component
```typescript
import { MaintenanceMode, MaintenanceBanner } from '@/components/maintenance-mode';

function App() {
  return (
    <MaintenanceMode>
      <MaintenanceBanner />
      <YourAppContent />
    </MaintenanceMode>
  );
}
```

## Configuration Validation

The system validates all configuration values before saving:

- **Numeric ranges**: Ensures values are within acceptable ranges
- **Type checking**: Validates data types
- **Required fields**: Ensures essential settings are provided
- **Business logic**: Validates relationships between settings

## Caching

Configuration is cached for 5 minutes to improve performance:
- Automatic refresh when cache expires
- Manual refresh available
- Fallback to defaults if API is unavailable

## Security

- Admin-only access to configuration
- Permission-based access control
- Input validation and sanitization
- Audit logging of configuration changes

## Default Configuration

```typescript
const defaultConfig = {
  platformName: 'Fixmotech Reference',
  platformDescription: 'Advanced verification and task management platform',
  maintenanceMode: false,
  debugMode: false,
  maxLoginAttempts: 5,
  sessionTimeout: 3600,
  requireTwoFactor: false,
  passwordMinLength: 8,
  selfieVerificationEnabled: true,
  antiSpoofingEnabled: true,
  verificationTimeout: 300,
  maxVerificationAttempts: 3,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  notificationFrequency: 'immediate',
  paymentEnabled: true,
  currency: 'PHP',
  minimumPayment: 100,
  maximumPayment: 10000,
  transactionFee: 2.5,
  aiModelVersion: 'v2.1.0',
  aiConfidenceThreshold: 0.85,
  aiProcessingTimeout: 30,
  enableAITesting: false,
  cacheEnabled: true,
  cacheTimeout: 1800,
  imageCompression: true,
  maxImageSize: 5242880
};
```

## Best Practices

1. **Test Changes**: Always test configuration changes in a development environment
2. **Backup Settings**: Export configuration before making major changes
3. **Monitor Impact**: Watch system performance after configuration changes
4. **Document Changes**: Keep a log of configuration changes and their purpose
5. **Gradual Rollout**: Make changes incrementally to minimize risk

## Troubleshooting

### Common Issues

1. **Configuration not saving**: Check admin permissions and API connectivity
2. **Invalid values**: Review validation errors in the admin interface
3. **Cache issues**: Use the refresh button or wait for cache expiration
4. **Maintenance mode stuck**: Check if maintenance mode is enabled in configuration

### Debug Mode

Enable debug mode to get detailed logging:
- Configuration loading/saving operations
- Validation errors
- Cache operations
- API communication

## Future Enhancements

- Configuration versioning and rollback
- Environment-specific configurations
- Configuration templates
- Automated configuration validation
- Configuration change notifications
- Advanced permission controls 