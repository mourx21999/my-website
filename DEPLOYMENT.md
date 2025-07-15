# 🚀 Deployment Guide

## Quick Start
```bash
./deploy.sh
```

## Deployment Options

### 1. **Vercel (Recommended)**
- Simple setup for full-stack apps
- Automatic builds and deployments

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard

### 2. **Railway**
- Great for apps with backends
- Easy database integration

**Steps:**
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

### 3. **Render**
- Connect your Git repository
- Auto-deploys on push
- Free tier available

### 4. **Netlify** 
- Primarily for static sites
- Can handle serverless functions

## Required Environment Variables

Set these on your hosting platform:

```
NODE_ENV=production
HUGGING_FACE_TOKEN=hf_your_token_here
PORT=5001
```

## Build Process

The deployment script will:
1. Build the React frontend (`npm run build`)
2. Install production server dependencies
3. Configure the server to serve static files

## Production URLs

After deployment, update the CORS origins in `server/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3005', 
  'http://localhost:3000',
  'https://your-production-domain.com'  // Add this
];
```

## Testing Production Build Locally

```bash
npm run build:prod
npm run start:prod
```

Visit `http://localhost:5001` to test the production build.

## Troubleshooting

- **Build fails**: Check for TypeScript errors
- **Images not generating**: Verify HUGGING_FACE_TOKEN is set
- **CORS errors**: Add your production domain to allowed origins
- **404 on refresh**: The catch-all route should handle this automatically 