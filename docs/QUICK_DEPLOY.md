# Quick Deploy Guide

Deploy your Hospital Bill Calculator to any platform in minutes.

## 🚀 One-Click Deploy Options

### Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

1. Click the Railway button above
2. Connect your GitHub account
3. Select this repository
4. Railway automatically detects Node.js and deploys
5. Your app will be live at: `https://your-app.railway.app`

### Render (Free Tier Available)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the Render button above  
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Your app will be live at: `https://your-app.onrender.com`

### Vercel (Serverless)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the Vercel button above
2. Import your GitHub repository
3. Vercel automatically configures everything
4. Your app will be live at: `https://your-app.vercel.app`

## 📋 Manual Deploy Steps

### 1. Prepare Your Repository
```bash
# Clone your repository
git clone https://github.com/yourusername/hospital-bill-calculator.git
cd hospital-bill-calculator

# Install dependencies
npm install

# Test locally
npm run dev
```

### 2. Choose Your Platform

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Render
1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect GitHub repository
4. Use settings from `render.yaml`

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Docker (Any Platform)
```bash
# Build image
docker build -t hospital-bill-calculator .

# Run locally
docker run -p 5000:5000 hospital-bill-calculator

# Deploy to any Docker-compatible platform
```

## ⚙️ Environment Configuration

### Required Environment Variables
- `NODE_ENV=production`
- `PORT` (automatically set by most platforms)

### Optional Environment Variables
- `DATABASE_URL` (for PostgreSQL instead of SQLite)
- `LOG_LEVEL` (for custom logging levels)

### Platform-Specific Settings

#### Railway
- Automatic port detection
- Built-in PostgreSQL available
- Custom domain support

#### Render
- Free tier includes 750 hours/month
- Services sleep after 15 minutes of inactivity
- PostgreSQL available as separate service

#### Vercel
- Serverless functions for API routes
- Static file hosting for frontend
- Built-in CDN for global performance

## 🔍 Verify Deployment

After deployment, check these endpoints:
- `/` - Main application
- `/health` - Basic health check
- `/api/health` - API health check
- `/api/medical-items` - Test API functionality

## 🛠️ Troubleshooting

### Build Failures
- Check Node.js version (requires 18+)
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Runtime Errors
- Check platform logs for error messages
- Verify environment variables are set
- Test health check endpoints

### Performance Issues
- Upgrade to paid tiers for better performance
- Enable health checks to prevent cold starts
- Monitor resource usage in platform dashboards

## 📈 Post-Deployment

### Monitor Your App
- Set up uptime monitoring
- Configure error tracking (Sentry recommended)
- Monitor performance metrics

### Custom Domain
- Most platforms support custom domains
- Configure DNS records as instructed
- SSL certificates are usually automatic

### Scaling
- Start with free tiers for testing
- Upgrade based on traffic and performance needs
- Consider multiple regions for global users

## 💡 Pro Tips

1. **Test Locally First**: Always run `npm run build && npm start` locally
2. **Use Health Checks**: Platforms can ping `/health` to keep apps warm
3. **Monitor Logs**: Check platform logs regularly for issues
4. **Backup Data**: Regularly backup your database
5. **Keep Updated**: Update dependencies and redeploy regularly

Your Hospital Bill Calculator is now ready for production use on any of these platforms!