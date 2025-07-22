# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + TypeScript)
```bash
npm start          # Start development server (http://localhost:3005)
npm run build      # Build for production
npm test           # Run tests
```

### Backend (Express Server)
```bash
cd server && npm start     # Start API server (http://localhost:5001)
./restart-backend.sh       # Quick restart backend
```

### Combined Development
```bash
npm run build:prod         # Build frontend + install server deps
npm run start:prod         # Start production server on :5001
```

## Architecture Overview

### Dual Backend Architecture
This project uses **two backend implementations** for different deployment scenarios:

1. **Standalone Express Server** (`server/index.js`)
   - Full-featured Node.js server with CORS, static file serving
   - Used for Railway, Render, local development
   - Serves React build files in production mode

2. **Vercel Serverless Functions** (`api/generate-image.js`)
   - Serverless function for Vercel deployment
   - Identical image generation logic, simplified CORS

### Image Generation System
The application provides **dual image generation modes**:

- **AI Generation**: Hugging Face API with multiple model fallbacks
  - Stable Diffusion XL Base, Flux Dev, Stable Diffusion v1.5
  - Requires `HUGGING_FACE_TOKEN` in `server/.env`
  - Returns base64-encoded images with `source: 'hugging-face-ai'`

- **Photo Search Fallback**: Unsplash source API
  - Automatic fallback when AI services fail or token missing
  - Returns URLs with `source: 'unsplash-photo'`

### Frontend Components Structure
```
src/components/
├── ImageGenerator.tsx     # Main image generation interface
├── TouchImageViewer.tsx   # Mobile-optimized image gallery
├── PersonalProfile.tsx    # User profile management
├── SmartPromptAssistant.tsx # AI prompt suggestions
└── PWAInstallPrompt.tsx   # Progressive web app install
```

Key TypeScript interfaces:
- `GeneratedImage`: id, url, description, timestamp, source, message
- `UserProfile`: name, avatar, preferences, settings, history

## Configuration & Environment

### Required Environment Variables (server/.env)
```bash
HUGGING_FACE_TOKEN=hf_your_token_here    # For AI generation
PORT=5001                                # Server port (optional)
NODE_ENV=production                      # For production deployment
```

### CORS Configuration
Configured for multiple origins in `server/index.js`:
- http://localhost:3005 (dev frontend)
- http://localhost:3000 (alternate dev)
- Production domains (add after deployment)

## Deployment Configurations

### Vercel (`vercel.json`)
- Create React App framework detection
- API routes mapped to `/api/*`
- SPA rewrites for client-side routing

### Railway (`railway.json`)
- Simple configuration for full-stack deployment

### Render (`render.yaml`)
- Web service configuration

### Docker Support
- `Dockerfile` for containerized deployment
- `docker-build.sh` and `docker-quick.sh` for container management

## Data Storage

### localStorage Schema
- `createYourMindProfile`: UserProfile object with preferences and history
- Generated images stored in component state (session-based)

## Development Workflow

1. **Start Development**: Run frontend (`npm start`) and backend (`cd server && npm start`) in separate terminals
2. **AI Setup**: Add Hugging Face token to `server/.env` for AI generation
3. **Testing**: Check both AI and photo search modes work correctly
4. **Production**: Use `npm run build:prod` then `npm run start:prod`

## Key Files to Modify

- **Image generation logic**: `server/index.js:38-168` and `api/generate-image.js`
- **Frontend interface**: `src/components/ImageGenerator.tsx`
- **Styling**: Co-located CSS files with components
- **TypeScript config**: `tsconfig.json` for React with strict mode
- **Deployment**: Multiple config files for different platforms