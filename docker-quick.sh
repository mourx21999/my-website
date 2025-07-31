#!/bin/bash

# Quick Docker commands for My Website
# Simple wrapper for common Docker operations

case "$1" in
    "build")
        echo "🏗️  Building Docker image..."
        docker build -t my-website .
        ;;
    "run")
        echo "🚀 Running container on http://localhost:3000..."
        docker run -d --name my-website-container -p 3000:5847 my-website
        ;;
    "stop")
        echo "⏹️  Stopping container..."
        docker stop my-website-container && docker rm my-website-container
        ;;
    "logs")
        echo "📋 Container logs:"
        docker logs -f my-website-container
        ;;
    "shell")
        echo "🐚 Opening shell in container..."
        docker exec -it my-website-container sh
        ;;
    "restart")
        echo "🔄 Restarting container..."
        docker restart my-website-container
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        docker stop my-website-container 2>/dev/null || true
        docker rm my-website-container 2>/dev/null || true
        docker rmi my-website 2>/dev/null || true
        ;;
    *)
        echo "🐳 Quick Docker commands for My Website"
        echo ""
        echo "Usage: $0 {build|run|stop|logs|shell|restart|clean}"
        echo ""
        echo "Commands:"
        echo "  build   - Build the Docker image"
        echo "  run     - Run the container"
        echo "  stop    - Stop and remove container"
        echo "  logs    - View container logs"
        echo "  shell   - Open shell in container"
        echo "  restart - Restart the container"
        echo "  clean   - Remove everything"
        echo ""
        echo "Quick start: $0 build && $0 run"
        ;;
esac 