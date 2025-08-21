# FixMo Deployment Guide

## Overview

This document provides comprehensive documentation for deploying the FixMo application to production. The application is currently deployed on **Vercel** with automatic deployments enabled through GitHub integration.

## Current Deployment Setup

### Platform
- **Production Platform**: Vercel
- **Live URL**: https://fix-mo-reference-mr7k55vqz-jong-eroys-projects.vercel.app
- **Project Name**: fix-mo-reference
- **Vercel Dashboard**: https://vercel.com/jong-eroys-projects/fix-mo-reference

### Repository
- **GitHub Repository**: https://github.com/Hyperionjigs/FixMo.git
- **Branch**: master
- **Automatic Deployments**: ✅ Enabled

## Deployment Architecture

### Why Vercel Instead of Firebase Hosting?

The FixMo application uses **Next.js with API routes**, which requires:

1. **Server-side rendering** for dynamic pages
2. **API route handling** for backend functionality
3. **Node.js runtime** for serverless functions

**Firebase Hosting Limitation**: Only serves static files, cannot handle server-side code
**Vercel Solution**: Specifically designed for Next.js with full SSR and API route support

### Technology Stack
- **Frontend**: Next.js 15.3.3 with React 18
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Clerk
- **AI Integration**: Genkit AI
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Deployment Workflow

### Automatic Deployments (Recommended)

When you make changes locally, follow this workflow:

1. **Make Changes**
   ```bash
   # Edit files locally (e.g., src/components/verification-modal.tsx)
   ```

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push to GitHub**
   ```bash
   git push origin master
   ```

4. **Automatic Deployment**
   - Vercel detects the push to GitHub
   - Triggers automatic build and deployment
   - Deploys to production without manual intervention

### Manual Deployment (Alternative)

If you need to deploy immediately without pushing to GitHub:

```bash
# Deploy to production
vercel --prod

# Deploy to preview (staging)
vercel
```

## Configuration Files

### Next.js Configuration (`next.config.ts`)
```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

## Environment Variables

### Required Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI/Genkit Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key
GENKIT_ENV=production

# Other Configuration
NEXT_PUBLIC_APP_URL=https://fix-mo-reference-mr7k55vqz-jong-eroys-projects.vercel.app
```

### Local Development
Create a `.env.local` file for local development:
```bash
cp env.example .env.local
# Edit .env.local with your local values
```

## Build Process

### Local Build
```bash
npm run build
```

### Build Output
- **Static Pages**: Pre-rendered HTML files
- **API Routes**: Serverless functions
- **Assets**: Optimized images, CSS, and JavaScript

### Build Warnings (Expected)
The build process may show warnings related to:
- OpenTelemetry instrumentation
- Handlebars webpack compatibility
- Genkit AI dependencies

These warnings don't affect functionality and can be safely ignored.

## Monitoring and Debugging

### Vercel Dashboard
- **Deployments**: https://vercel.com/jong-eroys-projects/fix-mo-reference
- **Functions**: Monitor API route performance
- **Analytics**: Track user engagement and performance

### Logs and Debugging
```bash
# View deployment logs
vercel logs

# Inspect specific deployment
vercel inspect [deployment-id]

# List recent deployments
vercel ls
```

### Common Issues and Solutions

#### 1. Build Failures
**Issue**: Build fails during deployment
**Solution**: 
- Check for TypeScript errors: `npm run typecheck`
- Verify all dependencies are installed: `npm install`
- Check environment variables are set correctly

#### 2. API Route Errors
**Issue**: API routes return 500 errors
**Solution**:
- Verify environment variables in Vercel dashboard
- Check Firebase configuration
- Review serverless function logs in Vercel dashboard

#### 3. Authentication Issues
**Issue**: Clerk authentication not working
**Solution**:
- Verify Clerk keys in environment variables
- Check domain configuration in Clerk dashboard
- Ensure proper redirect URLs are configured

## Performance Optimization

### Build Optimization
- **Static Generation**: Pages are pre-rendered at build time
- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Next.js Image component for optimized images

### Runtime Optimization
- **Edge Functions**: API routes run on Vercel's edge network
- **Caching**: Automatic caching for static assets
- **CDN**: Global content delivery network

## Security Considerations

### Environment Variables
- Never commit sensitive keys to Git
- Use Vercel's environment variable system
- Rotate keys regularly

### API Security
- Implement proper authentication for API routes
- Use CORS headers where necessary
- Validate input data

### Firebase Security
- Configure Firestore security rules
- Set up proper authentication rules
- Monitor Firebase usage

## Backup and Recovery

### Code Backup
- **Primary**: GitHub repository
- **Secondary**: Local development environment

### Database Backup
- **Firestore**: Automatic backups enabled
- **Manual**: Export data through Firebase console

### Deployment Recovery
```bash
# Rollback to previous deployment
vercel rollback [deployment-id]

# Promote specific deployment
vercel promote [deployment-url]
```

## Custom Domain Setup

### Adding Custom Domain
1. Go to Vercel dashboard > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation

### SSL Certificate
- Automatic SSL certificates provided by Vercel
- Certificates are automatically renewed

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Staging Environment
```bash
# Deploy to preview
vercel

# Share preview URL with team
```

### Production Deployment
```bash
# Automatic via GitHub push
git push origin master

# Manual deployment
vercel --prod
```

## Maintenance

### Regular Tasks
- Monitor Vercel dashboard for performance
- Review and update dependencies
- Check Firebase usage and costs
- Update environment variables as needed

### Updates and Upgrades
```bash
# Update dependencies
npm update

# Upgrade Next.js
npm install next@latest

# Test locally before deploying
npm run build
npm run test
```

## Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.com/docs)

### Community
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Community](https://github.com/vercel/next.js/discussions)

### Contact
- **Vercel Support**: Available through dashboard
- **Firebase Support**: Available through console
- **Clerk Support**: Available through dashboard

---

**Last Updated**: August 3, 2025
**Version**: 1.0
**Maintained By**: Development Team 