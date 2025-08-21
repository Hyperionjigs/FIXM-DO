#!/bin/bash

echo "🌐 FixMo Custom Domain Setup"
echo "============================"

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Please provide a domain name"
    echo "Usage: ./setup-custom-domain.sh yourdomain.com"
    echo ""
    echo "Examples:"
    echo "  ./setup-custom-domain.sh fixmo.com"
    echo "  ./setup-custom-domain.sh app.fixmo.com"
    exit 1
fi

DOMAIN=$1
echo "🎯 Setting up custom domain: $DOMAIN"
echo ""

# Add domain to Firebase Hosting
echo "🔥 Adding domain to Firebase Hosting..."
npx firebase-tools hosting:sites:add $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Domain added successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure your DNS provider with these records:"
    echo "   - Type: A"
    echo "   - Name: @ (or your subdomain)"
    echo "   - Value: 151.101.1.195"
    echo "   - Value: 151.101.65.195"
    echo ""
    echo "2. Add CNAME record:"
    echo "   - Type: CNAME"
    echo "   - Name: www"
    echo "   - Value: $DOMAIN"
    echo ""
    echo "3. Wait for DNS propagation (can take up to 48 hours)"
    echo ""
    echo "4. Verify domain ownership in Firebase Console"
    echo "   URL: https://console.firebase.google.com/project/fixmo-ejgfh/hosting"
    echo ""
    echo "5. SSL certificate will be automatically provisioned"
else
    echo "❌ Failed to add domain"
    echo "💡 Make sure you have the necessary permissions"
fi 