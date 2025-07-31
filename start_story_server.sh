#!/bin/bash

echo "🚀 Setting up AI Story Generation Server..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Install requirements if they don't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📚 Installing requirements..."
pip install -r story_requirements.txt

echo "🔑 Checking OpenAI API Key..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  WARNING: OPENAI_API_KEY not set!"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    echo "   Set it with: export OPENAI_API_KEY='your-key-here'"
    echo "   Or create a .env file with: OPENAI_API_KEY=your-key-here"
    echo ""
    echo "📝 For now, using fallback story generation..."
else
    echo "✅ OpenAI API Key found! Using GPT-4 Vision for story generation."
fi

echo "✨ Starting Advanced AI Story Generation Server on http://localhost:5847"
echo "   Your frontend can now generate real AI stories!"
echo "   Press Ctrl+C to stop the server"
echo ""

python3 story_server.py