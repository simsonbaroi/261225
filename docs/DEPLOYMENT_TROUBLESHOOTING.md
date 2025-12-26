# Deployment Troubleshooting

This guide helps resolve common deployment issues for the Hospital Bill Calculator.

## GitHub Actions Issues

### Build Failures

**Type Check Errors:**
- The project has some TypeScript warnings that don't prevent functionality
- GitHub Actions is configured to continue despite type warnings
- For production deployment, these can be safely ignored

**Build Command Fails:**
```bash
# Ensure you have the correct Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Job Failures

The provided GitHub Actions workflow includes deployment jobs that will fail without proper configuration:

1. **Railway Deployment**: Requires `RAILWAY_TOKEN` and `RAILWAY_SERVICE_ID` secrets
2. **Render Deployment**: Requires `RENDER_TOKEN` and `RENDER_SERVICE_ID` secrets

**To fix:**
- Either configure the secrets in GitHub repository settings
- Or remove/disable the deployment jobs in `.github/workflows/deploy.yml`

## Platform-Specific Issues

### Railway Deployment

**Common Issues:**
- Missing environment variables
- Build timeout (default 10 minutes)
- Port binding issues

**Solutions:**
```bash
# Ensure Railway CLI is installed
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy manually first
railway up
```

**Environment Variables:**
- `NODE_ENV=production`
- `PORT` (automatically set by Railway)

### Render Deployment

**Common Issues:**
- Build command not specified
- Start command incorrect
- Environment variables missing

**Solutions:**
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm start`
3. Set Environment: `NODE_ENV=production`

### Vercel Deployment

**Issues with Full-Stack:**
- Vercel primarily supports frontend + serverless functions
- Database connections may require external service

**Solutions:**
1. Use Vercel for frontend only
2. Deploy backend separately (Railway/Render)
3. Use Vercel's database integrations

### Docker Issues

**Build Failures:**
```bash
# Check Docker version
docker --version

# Build with verbose output
docker build -t hospital-bill-calculator . --progress=plain

# Test locally first
docker run -p 5000:5000 hospital-bill-calculator
```

**Common Issues:**
- Port 5000 already in use
- Node.js version mismatch
- Missing dependencies

## Database Issues

### SQLite in Production

**Limitations:**
- SQLite files don't persist in some hosting environments
- Not suitable for high-traffic applications
- Limited concurrent access

**Solutions:**
1. **PostgreSQL Migration:**
   ```bash
   # Install PostgreSQL adapter
   npm install pg @types/pg
   
   # Set DATABASE_URL environment variable
   export DATABASE_URL="postgresql://user:pass@host:port/db"
   ```

2. **Hosted Database Options:**
   - **Neon**: Serverless PostgreSQL
   - **PlanetScale**: MySQL-compatible
   - **Supabase**: PostgreSQL with real-time features

### Connection Issues

**Timeout Errors:**
- Increase connection timeout
- Check network connectivity
- Verify credentials

**Migration Errors:**
```bash
# Reset and re-run migrations
npm run db:push
```

## Performance Issues

### Build Time Optimization

**Slow Builds:**
```javascript
// In vite.config.ts, optimize build
export default {
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
}
```

### Runtime Performance

**Memory Issues:**
- Monitor memory usage in production
- Implement proper cleanup in React components
- Use production builds only

**Database Performance:**
- Add indexes for frequently queried fields
- Implement connection pooling for PostgreSQL
- Monitor query performance

## Security Considerations

### Environment Variables

**Never commit:**
- Database passwords
- API keys
- JWT secrets

**Use platform-specific secret management:**
- Railway: Environment variables in dashboard
- Render: Environment variables in service settings
- Vercel: Environment variables in project settings

### HTTPS and SSL

**Production Requirements:**
- Always use HTTPS in production
- Configure SSL certificates
- Set secure headers

## Monitoring and Debugging

### Application Logs

**Enable detailed logging:**
```javascript
// In production, use structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Server started',
  port: process.env.PORT || 5000,
  timestamp: new Date().toISOString()
}))
```

### Health Checks

**Add health check endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

### Error Tracking

**Recommended Services:**
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **DataDog**: Infrastructure monitoring

## Getting Help

### Community Support

1. **GitHub Issues**: Report bugs and request features
2. **GitHub Discussions**: Ask questions and share ideas
3. **Documentation**: Check all docs in the `/docs` folder

### Professional Support

For production deployments requiring professional support:
1. Hire experienced DevOps consultants
2. Use managed hosting services
3. Consider enterprise support plans

### Emergency Procedures

**Application Down:**
1. Check hosting platform status
2. Review recent deployments
3. Check environment variables
4. Monitor error logs
5. Rollback if necessary

**Database Issues:**
1. Check connection strings
2. Verify database server status
3. Check backup availability
4. Contact database provider support

This troubleshooting guide covers the most common deployment issues. For specific problems not covered here, please create an issue in the GitHub repository with detailed error messages and steps to reproduce.