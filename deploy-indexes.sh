#!/bin/bash

echo "Deploying Firestore indexes..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Deploy indexes
firebase deploy --only firestore:indexes

echo "Indexes deployed successfully!"
echo ""
echo "If you're still getting index errors, you can also create them manually:"
echo "1. Go to the Firebase Console: https://console.firebase.google.com"
echo "2. Select your project: fixmo-ejgfh"
echo "3. Go to Firestore Database > Indexes"
echo "4. Create the following composite indexes:"
echo "   - Collection: potMoney, Fields: isActive (Ascending), lastUpdated (Descending)"
echo "   - Collection: bonuses, Fields: status (Ascending)"
echo "   - Collection: notifications, Fields: userId (Ascending), createdAt (Descending)"
echo "   - Collection: posts, Fields: status (Ascending), createdAt (Descending)" 