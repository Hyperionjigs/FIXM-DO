#!/bin/bash

echo "🚀 Starting FixMo deployment..."

# Build the app
echo "📦 Building the app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "✅ Firebase deployment successful!"
        echo "🌐 Your app is now live!"
    else
        echo "❌ Firebase deployment failed"
        echo "💡 Alternative: You can deploy manually to Vercel, Netlify, or GitHub Pages"
    fi
else
    echo "❌ Build failed"
    exit 1
fi 