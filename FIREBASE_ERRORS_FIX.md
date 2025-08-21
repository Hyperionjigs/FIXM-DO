# Firebase Errors Fix Guide

## Issues Identified

### 1. Missing Firestore Indexes
The application is trying to run queries that require composite indexes that don't exist in Firebase.

**Error:** `FirebaseError: The query requires an index`

**Affected Queries:**
- `potMoney` collection: `isActive` + `lastUpdated` (descending)
- `bonuses` collection: `status` field
- `notifications` collection: `userId` + `createdAt` (descending)
- `posts` collection: `status` + `createdAt` (descending)

### 2. Undefined Metadata Field
The verification service is trying to save `undefined` metadata to Firestore.

**Error:** `FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined`

## Fixes Applied

### 1. Code Fixes ✅
- **Fixed metadata issue**: Added null check before saving metadata to Firestore
- **Added fallback queries**: Modified bonus service to handle index errors gracefully
- **Improved error handling**: Added try-catch blocks for individual queries

### 2. Firebase Index Configuration ✅
- Created `firestore.indexes.json` with required composite indexes
- Created `deploy-indexes.sh` script to deploy indexes

## How to Fix Firebase Indexes

### Option 1: Deploy Indexes via Firebase CLI (Recommended)
```bash
# Make sure you have Firebase CLI installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes
./deploy-indexes.sh
```

### Option 2: Manual Creation via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `fixmo-ejgfh`
3. Navigate to **Firestore Database** > **Indexes**
4. Create the following composite indexes:

#### potMoney Collection
- **Fields**: `isActive` (Ascending), `lastUpdated` (Descending)

#### bonuses Collection  
- **Fields**: `status` (Ascending)

#### notifications Collection
- **Fields**: `userId` (Ascending), `createdAt` (Descending)

#### posts Collection
- **Fields**: `status` (Ascending), `createdAt` (Descending)

### Option 3: Use Direct Links (Quick Fix)
Click these links to create indexes directly:

- **potMoney index**: https://console.firebase.google.com/v1/r/project/fixmo-ejgfh/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maXhtby1lamdmaC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcG90TW9uZXkvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoPCgtsYXN0VXBkYXRlZBACGgwKCF9fbmFtZV9fEAI

- **notifications index**: https://console.firebase.google.com/v1/r/project/fixmo-ejgfh/firestore/indexes?create_composite=ClFwcm9qZWN0cy9maXhtby1lamdmaC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbW90aWZpY2F0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

## Testing the Fixes

After creating the indexes:

1. **Wait for indexes to build** (can take 1-5 minutes)
2. **Refresh your application** at http://localhost:3001
3. **Test the features** that were causing errors:
   - Pot money donation
   - Photo verification
   - Dashboard loading

## Notes

- Index building can take several minutes
- The application now has fallback error handling
- If indexes are still building, the app will use simpler queries temporarily
- All errors should be resolved once indexes are ready

## Verification

To verify indexes are working:
1. Check Firebase Console > Firestore > Indexes
2. Look for "Building" status to change to "Enabled"
3. Test the application features again 