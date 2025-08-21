# Custom Domain Setup Guide for FixMo

## Overview
This guide will help you set up a custom domain for your FixMo app hosted on Firebase.

## Prerequisites
- A domain name (purchased or owned)
- Access to your domain's DNS settings
- Firebase project access

## Step 1: Choose Your Domain

### Option A: Purchase a New Domain
Recommended domain registrars:
- **Google Domains** (now Squarespace) - Easy integration with Firebase
- **Namecheap** - Good prices and features
- **GoDaddy** - Popular choice
- **Cloudflare** - Good security features

### Option B: Use Existing Domain
- Use a subdomain: `app.yourdomain.com`
- Use the main domain: `yourdomain.com`

## Step 2: Add Domain to Firebase

### Using the Script
```bash
./setup-custom-domain.sh yourdomain.com
```

### Manual Method
```bash
npx firebase-tools hosting:sites:add yourdomain.com
```

## Step 3: Configure DNS Records

### For Root Domain (yourdomain.com)
Add these A records in your DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | @ | 151.101.1.195 |
| A | @ | 151.101.65.195 |

### For Subdomain (app.yourdomain.com)
Add these A records:

| Type | Name | Value |
|------|------|-------|
| A | app | 151.101.1.195 |
| A | app | 151.101.65.195 |

### CNAME Record (Optional)
For www subdomain:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | yourdomain.com |

## Step 4: Verify Domain Ownership

1. Go to [Firebase Console](https://console.firebase.google.com/project/fixmo-ejgfh/hosting)
2. Click on your domain
3. Follow the verification steps
4. Wait for DNS propagation (up to 48 hours)

## Step 5: SSL Certificate

Firebase automatically provisions SSL certificates for custom domains. This may take up to 24 hours.

## Step 6: Update Firebase Configuration

After verification, update your `firebase.json`:

```json
{
  "hosting": {
    "public": ".next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "site": "yourdomain.com"
  }
}
```

## Step 7: Deploy to Custom Domain

```bash
npx firebase-tools deploy --only hosting:yourdomain.com
```

## Common Issues & Solutions

### DNS Propagation
- **Problem**: Domain not resolving
- **Solution**: Wait 24-48 hours for DNS propagation

### SSL Certificate Issues
- **Problem**: Certificate not provisioned
- **Solution**: Ensure DNS is properly configured and wait 24 hours

### Domain Verification Failed
- **Problem**: Can't verify domain ownership
- **Solution**: Check DNS records and ensure they're pointing to Firebase IPs

## Testing Your Setup

1. **DNS Check**: Use `nslookup yourdomain.com`
2. **SSL Check**: Visit `https://yourdomain.com`
3. **App Functionality**: Test all features on the custom domain

## Security Considerations

- Enable HTTPS redirect in Firebase Console
- Set up security headers
- Configure CSP (Content Security Policy)

## Monitoring

- Set up Google Analytics
- Monitor SSL certificate expiration
- Track domain performance

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Verify DNS configuration
3. Contact your domain registrar for DNS issues
4. Check Firebase documentation: https://firebase.google.com/docs/hosting/custom-domain 