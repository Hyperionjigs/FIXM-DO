# FixMo Verification System Documentation

## Overview

The FixMo verification system provides a comprehensive identity verification solution that supports multiple verification methods and can integrate with external verification providers. The system is designed to be secure, scalable, and user-friendly.

## Features

- **Multiple Verification Methods**: Selfie verification and ID document upload
- **Provider Integration**: Support for internal AI, Clerk, Onfido, and Jumio
- **Real-time Processing**: Instant verification results with detailed feedback
- **Secure Storage**: All verification data is securely stored in Firebase
- **Analytics**: Comprehensive logging and analytics for verification attempts
- **n8n Integration**: Webhook support for advanced workflow automation

## Architecture

### Core Components

1. **VerificationService** (`src/lib/verification-service.ts`)
   - Central service for all verification operations
   - Handles image upload, verification, and status updates
   - Provides clean interface for different verification providers

2. **VerificationModal** (`src/components/verification-modal.tsx`)
   - Main UI component for verification process
   - Supports both selfie and ID document verification
   - Real-time camera capture and image processing

3. **EnhancedVerificationModal** (`src/components/enhanced-verification-modal.tsx`)
   - Advanced verification modal with provider selection
   - Multi-provider support with feature comparison
   - Enhanced user experience with detailed feedback

4. **useVerificationStatus** (`src/hooks/use-verification-status.tsx`)
   - React hook for managing verification state
   - Provides verification status across the application
   - Handles loading states and error management

### Data Flow

```
User Input → Verification Modal → Verification Service → Provider API → Result Processing → Status Update → UI Feedback
```

## Verification Methods

### 1. Selfie Verification

**Process:**
1. User grants camera access
2. Camera captures live video feed
3. User takes a selfie photo
4. Image is processed by selected verification provider
5. Results are analyzed for liveness, quality, and face detection
6. Verification status is updated in database

**Requirements:**
- Good lighting conditions
- Clear face visibility
- Single face in frame
- Direct camera gaze

### 2. ID Document Verification

**Process:**
1. User selects document type (Government ID, Passport, Company ID)
2. User uploads clear photo of document
3. Document is validated by selected provider
4. OCR and authenticity checks are performed
5. Results are processed and stored

**Supported Documents:**
- Government-issued IDs
- Passports
- Company IDs (with photo and company name)

## Verification Providers

### 1. Internal AI (Default)

**Features:**
- Fast processing (1-3 seconds)
- Privacy-focused (no external data transmission)
- Simulated verification for development
- 70% success rate simulation

**Use Case:** Development, testing, and privacy-conscious users

### 2. Clerk

**Features:**
- Industry-standard verification
- High accuracy rates
- Compliance ready
- Professional identity verification

**Integration:** Requires Clerk API credentials

### 3. Onfido

**Features:**
- Advanced document verification
- Face matching capabilities
- Global coverage
- Comprehensive fraud detection

**Integration:** Requires Onfido API credentials

### 4. Jumio

**Features:**
- Multi-document support
- Real-time verification
- Advanced fraud detection
- Global document recognition

**Integration:** Requires Jumio API credentials

## API Endpoints

### 1. Verification Webhook

**Endpoint:** `POST /api/verification-webhook`

**Purpose:** Receives verification results from external providers or n8n workflows

**Headers:**
```
x-n8n-signature: <webhook_signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "verificationType": "selfie" | "id-document",
  "result": {
    "isVerified": boolean,
    "confidence": number,
    "livenessScore": number,
    "qualityScore": number,
    "faceDetected": boolean,
    "reasons": string[],
    "recommendations": string[]
  },
  "imageUrl": "string",
  "documentType": "string",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification result processed successfully"
}
```

### 2. Pot Money Donation

**Endpoint:** `POST /api/pot-money/donate`

**Purpose:** Handles donations to the bonus system

### 3. Task Completion

**Endpoint:** `POST /api/tasks/complete`

**Purpose:** Processes task completion and triggers bonus calculations

## n8n Integration

### Webhook Configuration

1. **Create n8n Webhook Node:**
   - Method: POST
   - URL: `https://your-domain.com/api/verification-webhook`
   - Headers: Add `x-n8n-signature` with your webhook secret

2. **Webhook Payload Structure:**
   ```json
   {
     "userId": "{{ $json.userId }}",
     "verificationType": "{{ $json.verificationType }}",
     "result": {
       "isVerified": "{{ $json.isVerified }}",
       "confidence": "{{ $json.confidence }}",
       "livenessScore": "{{ $json.livenessScore }}",
       "qualityScore": "{{ $json.qualityScore }}",
       "faceDetected": "{{ $json.faceDetected }}",
       "reasons": "{{ $json.reasons }}",
       "recommendations": "{{ $json.recommendations }}"
     },
     "imageUrl": "{{ $json.imageUrl }}",
     "documentType": "{{ $json.documentType }}",
     "metadata": "{{ $json.metadata }}"
   }
   ```

### Example n8n Workflow

1. **Trigger:** Webhook receives verification request
2. **Process:** Send image to external verification service
3. **Validate:** Process verification results
4. **Notify:** Send results back to FixMo webhook
5. **Log:** Store verification attempt in database

## Security Considerations

### Data Protection

- All verification images are encrypted in transit
- Images are stored securely in Firebase Storage
- Verification results are logged for audit purposes
- User consent is required for verification processing

### Privacy Compliance

- GDPR compliance for EU users
- Data retention policies implemented
- User data deletion capabilities
- Transparent privacy policies

### Access Control

- Webhook signature validation
- Rate limiting on verification endpoints
- User authentication required
- Admin-only access to verification logs

## Configuration

### Environment Variables

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Verification Providers (Optional)
CLERK_API_KEY=your_clerk_api_key
ONFIDO_API_KEY=your_onfido_api_key
JUMIO_API_KEY=your_jumio_api_key

# Webhook Security
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### Firebase Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own verification data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Verification logs (admin only)
    match /verificationLogs/{logId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own verification folder
    match /verifications/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Usage Examples

### Basic Verification

```typescript
import { VerificationService } from '@/lib/verification-service';

// Verify selfie
const result = await VerificationService.verifySelfie(imageData, userId);

// Validate ID document
const result = await VerificationService.validateIDDocument(imageData, documentType, userId);

// Get verification status
const status = await VerificationService.getVerificationStatus(userId);
```

### React Component Usage

```typescript
import { useVerificationStatus } from '@/hooks/use-verification-status';

function MyComponent() {
  const { isVerified, isPending, canPost, loading } = useVerificationStatus();
  
  if (loading) return <div>Loading...</div>;
  if (!isVerified) return <div>Please verify your identity</div>;
  
  return <div>You can post tasks!</div>;
}
```

### Modal Integration

```typescript
import { VerificationModal } from '@/components/verification-modal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Verify Identity
      </button>
      
      <VerificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Clear browser cache

2. **Verification Failed**
   - Check lighting conditions
   - Ensure face is clearly visible
   - Try different verification provider

3. **Webhook Not Receiving Data**
   - Verify webhook URL is correct
   - Check webhook signature
   - Ensure proper JSON format

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG_VERIFICATION=true
```

This will log detailed verification information to the console.

## Future Enhancements

### Planned Features

1. **Biometric Verification**
   - Fingerprint scanning
   - Voice recognition
   - Behavioral analysis

2. **Advanced AI**
   - Deep learning models
   - Real-time fraud detection
   - Adaptive verification thresholds

3. **Multi-language Support**
   - International document recognition
   - Localized verification flows
   - Regional compliance support

4. **Blockchain Integration**
   - Decentralized identity verification
   - Immutable verification records
   - Cross-platform identity portability

### Integration Roadmap

1. **Phase 1:** Basic verification (Complete)
2. **Phase 2:** External provider integration (In Progress)
3. **Phase 3:** Advanced AI and biometrics (Planned)
4. **Phase 4:** Blockchain and decentralization (Future)

## Support

For technical support or questions about the verification system:

- **Documentation:** This file and inline code comments
- **Issues:** GitHub repository issues
- **Email:** support@fixmotech.com

## License

This verification system is part of the FixMo platform and is proprietary software. All rights reserved. 