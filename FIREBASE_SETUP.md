# Firebase Setup Guide for FixMo

## Current Configuration
Your app is configured to use Firebase project: `fixmo-ejgfh`

## Required Setup Steps

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fixmo-ejgfh`
3. Navigate to **Authentication** in the left sidebar
4. Click **Get started**
5. Go to **Sign-in method** tab
6. Enable **Email/Password** authentication:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### 2. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose the closest to your users)
5. Click **Done**

### 3. Configure Firestore Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /posts/{postId} {
      allow read: if true; // Anyone can read posts
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /test/{document=**} {
      allow read, write: if true; // For testing purposes
    }
  }
}
```

### 4. Configure Storage Rules

1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Choose **Start in test mode**
4. Go to **Rules** tab and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_pictures/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Google AI API Key (Optional - for AI features)

For the AI photo generation feature to work:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Get an API key
3. Create a `.env.local` file in your project root:

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

## Testing the Setup

1. Visit: http://localhost:9002/debug
2. Test each component:
   - **Firebase Authentication**: Try signing up with a test email
   - **Firestore Database**: Test writing to the database
   - **AI Generation**: Test the AI photo generation (requires API key)

## Common Issues

### "Firebase: Error (auth/operation-not-allowed)"
- **Solution**: Enable Email/Password authentication in Firebase Console

### "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Check that your Firebase config in `src/lib/firebase.ts` is correct

### "Firebase: Error (permission-denied)"
- **Solution**: Update Firestore security rules to allow read/write access

### "AI generation failed"
- **Solution**: Set up Google AI API key in `.env.local`

## Next Steps

After completing the setup:

1. Test authentication at: http://localhost:9002/signup
2. Test the main app at: http://localhost:9002
3. Create a test account and try posting a task

## Production Considerations

For production deployment:

1. Update Firestore rules to be more restrictive
2. Set up proper authentication providers
3. Configure proper CORS settings
4. Set up monitoring and analytics 