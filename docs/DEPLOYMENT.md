# Deployment Guide

This guide covers various deployment options for the Hospital Bill Calculator.

## Quick Deploy Options

### 1. Railway (Recommended for GitHub)

Railway provides excellent support for full-stack applications with databases.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Environment Variables:**
- `NODE_ENV=production`
- `DATABASE_URL` (automatically provided by Railway PostgreSQL)

### 2. Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `NODE_ENV=production`

### 3. Vercel (Frontend + Serverless API)

Deploy the frontend to Vercel and use serverless functions for the API:

```bash
npm install -g vercel
vercel
```

### 4. Docker Deployment

Use the provided Dockerfile:

```bash
# Build the image
docker build -t hospital-bill-calculator .

# Run the container
docker run -p 5000:5000 hospital-bill-calculator

# Or use docker-compose
docker-compose up -d
```

## Database Options

### SQLite (Default)
- Works out of the box
- File-based database included in repository
- Good for development and small deployments

### PostgreSQL (Production)
- Recommended for production
- Available on Railway, Render, Neon, Supabase
- Update `server/db.ts` to use PostgreSQL connection

### Setup PostgreSQL:

1. Install pg package:
```bash
npm install pg @types/pg
```

2. Update environment variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

3. The application will automatically use PostgreSQL if `DATABASE_URL` is provided.

## Environment Variables

Create a `.env` file (not committed to Git):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url_here
```

## Production Considerations

### Security
- Use HTTPS in production
- Set up proper CORS policies
- Use environment variables for sensitive data
- Regular security updates

### Performance
- Enable compression middleware
- Use CDN for static assets
- Implement caching strategies
- Monitor performance metrics

### Monitoring
- Set up logging (Winston, Pino)
- Error tracking (Sentry)
- Health checks
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Port binding errors**
   - Ensure the app uses `process.env.PORT` or defaults to 5000
   - Check if the port is properly exposed

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database server is running

3. **Build failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm start
```

## Custom Domain

Most platforms support custom domains:

1. **Railway**: Add custom domain in dashboard
2. **Render**: Configure custom domain in service settings
3. **Vercel**: Add domain in project settings

Remember to update DNS records to point to your deployment platform.