#!/bin/bash

echo "🔍 Checking FixMo domain availability..."
echo "======================================"

domains=(
    "fixmo.app"
    "fixmo.io" 
    "fixmo.net"
    "getfixmo.com"
    "fixmo.co"
    "fixmo.tech"
    "fixmo.services"
)

for domain in "${domains[@]}"; do
    echo -n "Checking $domain... "
    
    # Use nslookup to check if domain exists
    if nslookup "$domain" >/dev/null 2>&1; then
        echo "❌ TAKEN"
    else
        echo "✅ AVAILABLE"
    fi
done

echo ""
echo "💡 Recommended: fixmo.app (modern, app-focused)"
echo "💡 Alternative: fixmo.io (tech startup vibe)"
echo ""
echo "🎯 Once you choose a domain, run:"
echo "   ./setup-custom-domain.sh yourdomain.com" 