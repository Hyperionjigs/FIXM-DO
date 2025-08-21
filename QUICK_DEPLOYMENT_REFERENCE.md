# Quick Deployment Reference

## 🚀 Current Setup
- **Live URL**: https://fix-mo-reference-mr7k55vqz-jong-eroys-projects.vercel.app
- **GitHub**: https://github.com/Hyperionjigs/FixMo.git
- **Vercel Dashboard**: https://vercel.com/jong-eroys-projects/fix-mo-reference

## 📝 Daily Workflow

### Make Changes & Deploy
```bash
# 1. Make your changes locally
# 2. Commit changes
git add .
git commit -m "Your commit message"

# 3. Push to GitHub (triggers automatic deployment)
git push origin master

# ✅ Changes automatically deploy to production!
```

### Manual Deployment (if needed)
```bash
# Deploy to production immediately
vercel --prod

# Deploy to preview/staging
vercel
```

## 🔧 Common Commands

### Development
```bash
npm run dev          # Start local development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code quality
```

### Deployment
```bash
vercel --prod        # Deploy to production
vercel               # Deploy to preview
vercel ls            # List deployments
vercel logs          # View logs
vercel rollback      # Rollback to previous deployment
```

### Git Operations
```bash
git status           # Check current status
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin master # Push to GitHub
git pull origin master # Pull latest changes
```

## ⚙️ Environment Variables

### Required in Vercel Dashboard
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GOOGLE_AI_API_KEY`

### Local Development
```bash
cp env.example .env.local
# Edit .env.local with your values
```

## 🐛 Troubleshooting

### Build Fails
```bash
npm install          # Reinstall dependencies
npm run typecheck    # Check TypeScript errors
npm run lint         # Check linting errors
```

### API Routes Not Working
- Check environment variables in Vercel dashboard
- Verify Firebase configuration
- Check Vercel function logs

### Authentication Issues
- Verify Clerk keys in environment variables
- Check domain configuration in Clerk dashboard

## 📊 Monitoring

### Check Deployment Status
- **Vercel Dashboard**: https://vercel.com/jong-eroys-projects/fix-mo-reference
- **GitHub**: https://github.com/Hyperionjigs/FixMo

### View Logs
```bash
vercel logs          # View recent logs
vercel inspect [id]  # Inspect specific deployment
```

## 🔄 Rollback

### Quick Rollback
```bash
vercel rollback      # Rollback to previous deployment
vercel promote [url] # Promote specific deployment
```

## 📞 Support

### Documentation
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Quick Links
- **Live App**: https://fix-mo-reference-mr7k55vqz-jong-eroys-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/jong-eroys-projects/fix-mo-reference
- **GitHub Repo**: https://github.com/Hyperionjigs/FixMo

---

**Remember**: Push to GitHub = Automatic deployment to production! 🚀 