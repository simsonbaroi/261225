# Render Deployment - Manual Setup

Since the render.yaml file isn't yet in your GitHub repository, here are two ways to deploy:

## Option 1: Manual Configuration (Recommended for Now)

Instead of using the Blueprint, configure manually in Render:

### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `simsonbaroi/hospbill`
4. Select branch: `main`

### 2. Configure Settings
Use these exact settings in the Render dashboard:

**Basic Settings:**
- **Name**: `hospital-bill-calculator`
- **Environment**: `Node`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: Yes

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = (leave empty, Render sets automatically)

### 3. Deploy
1. Click "Create Web Service"
2. Render will start building your app
3. Monitor the build logs for any issues

## Option 2: Add render.yaml to GitHub

If you want to use the Blueprint method, you need to add the render.yaml file to your GitHub repository:

### render.yaml Content
Create this file in your GitHub repository root:

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

### Steps:
1. Go to your GitHub repository
2. Click "Add file" → "Create new file"
3. Name it `render.yaml`
4. Copy the content above
5. Commit the file
6. Return to Render and retry the Blueprint deployment

## Expected Build Process

Your app should build successfully with these stages:
1. **Install dependencies**: `npm install`
2. **Build application**: `npm run build` 
3. **Start server**: `npm start`
4. **Health check**: Available at `/api/health`

## Troubleshooting

### Build Fails
- Check Node.js version (should detect 20.x automatically)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### App Won't Start
- Ensure start command is exactly: `npm start`
- Check that PORT environment variable is handled correctly
- Monitor logs for startup errors

### Health Check Fails
- Your app includes `/health` and `/api/health` endpoints
- These should respond with JSON status information
- Render will monitor these for uptime

## After Deployment

Once deployed successfully:
1. **Test the app**: Visit your Render URL
2. **Check health**: Visit `https://your-app.onrender.com/health`
3. **Monitor performance**: Use Render dashboard
4. **Set up custom domain**: Optional, in service settings

Your Hospital Bill Calculator will be fully functional on Render's free tier, with automatic SSL and global CDN.