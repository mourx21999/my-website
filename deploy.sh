#!/bin/bash

echo "🚀 Preparing for deployment..."

# Build the React app
echo "📦 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed!"
    exit 1
fi

cd ..

echo "✅ Build complete! Your app is ready for deployment."
echo ""
echo "📁 Built files are in the 'build' directory"
echo "🔧 Make sure to set these environment variables on your hosting platform:"
echo "   - NODE_ENV=production"
echo "   - HUGGING_FACE_TOKEN=your_token_here (for AI image generation)"
echo "   - PORT=5001 (or let the platform set it automatically)"
echo ""
echo "🌐 Deployment options:"
echo "   1. Vercel: vercel --prod"
echo "   2. Railway: railway up"
echo "   3. Render: Connect your Git repo"
echo "   4. Netlify: Connect your Git repo" 