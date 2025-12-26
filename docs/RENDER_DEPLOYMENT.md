# Render Deployment Guide

Deploy your Hospital Bill Calculator to Render with this step-by-step guide.

## Quick Deploy

1. **Fork the Repository** on GitHub
2. **Connect to Render**: Go to [render.com](https://render.com) and sign up
3. **Import Repository**: Click "New Web Service" and connect your GitHub repo
4. **Configure Settings**: Use the settings below

## Configuration Settings

### Basic Settings
- **Name**: `hospital-bill-calculator`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

### Build & Deploy Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes (deploys on every push)

### Environment Variables
- `NODE_ENV` = `production`
- `PORT` = (auto-assigned by Render)

## Using render.yaml (Recommended)

The project includes a `render.yaml` file for easier deployment:

```yaml
services:
  - type: web
    name: hospital-bill-calculator
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        generateValue: true
    healthCheckPath: /api/health
    autoDeploy: true
```

### Deploy with Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically use the `render.yaml` configuration

## Free Tier Limitations

Render's free tier includes:
- 750 hours/month of runtime
- Services sleep after 15 minutes of inactivity
- 30-second cold start when waking up
- 512MB RAM, 0.1 CPU

## Upgrade for Production

For production use, upgrade to:
- **Starter Plan** ($7/month): Always on, faster performance
- **Standard Plan** ($25/month): More resources, better performance

## Database Options

### SQLite (Default)
- Works on Render's free tier
- Data persists between deployments
- Suitable for small to medium applications

### PostgreSQL (Recommended for Production)
1. Add PostgreSQL service in Render
2. Update environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## Custom Domain

1. Go to your service settings
2. Add custom domain under "Custom Domains"
3. Configure DNS records with your domain provider
4. SSL certificates are provided automatically

## Monitoring and Logs

### View Logs
- Go to your service in Render dashboard
- Click "Logs" tab for real-time logs
- Use filters to search specific log types

### Performance Monitoring
- Monitor response times in dashboard
- Set up health checks for uptime monitoring
- Configure alerts for service failures

## Troubleshooting

### Build Failures
1. Check build logs for specific errors
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### Service Won't Start
1. Check if start command is correct: `npm start`
2. Verify port configuration (Render sets PORT automatically)
3. Check for runtime errors in logs

### Application Errors
1. Enable detailed error logging
2. Check environment variables are set correctly
3. Monitor health check endpoint: `/api/health`

## Security Best Practices

1. **Environment Variables**: Never commit secrets to repository
2. **HTTPS**: Always enabled by default on Render
3. **Headers**: Set security headers in Express app
4. **Updates**: Keep dependencies updated regularly

## Cost Optimization

### Free Tier Tips
- Service sleeps after 15 minutes of inactivity
- Use health checks to keep service warm if needed
- Monitor usage to avoid overage charges

### Paid Tier Benefits
- Always-on services (no cold starts)
- Better performance and reliability
- Priority support

## Backup and Recovery

### Database Backups
- SQLite: Files persist in `/data` directory
- PostgreSQL: Automatic backups included
- Download backups regularly for safety

### Code Backups
- GitHub repository serves as code backup
- Enable automatic deployments for easy recovery
- Keep environment variables documented separately

## Scaling

### Horizontal Scaling
- Render handles load balancing automatically
- Upgrade to higher plans for better performance
- Consider multiple regions for global apps

### Performance Optimization
- Enable gzip compression
- Optimize bundle sizes
- Use CDN for static assets
- Implement proper caching headers

This guide covers everything needed to successfully deploy your Hospital Bill Calculator to Render. The free tier is perfect for testing and small deployments, while paid tiers offer production-ready performance.