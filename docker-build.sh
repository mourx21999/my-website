#!/bin/bash

# Docker Build and Run Script for My Website
# Usage: ./docker-build.sh [options]

set -e  # Exit on any error

# Configuration
IMAGE_NAME="my-website"
CONTAINER_NAME="my-website-container"
PORT=5001
LOCAL_PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    echo "Docker Build and Run Script for My Website"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -b, --build      Build the Docker image only"
    echo "  -r, --run        Run the container only (assumes image exists)"
    echo "  -c, --clean      Clean up old containers and images"
    echo "  -d, --dev        Run in development mode (with volume mounting)"
    echo "  -p, --port PORT  Specify local port (default: 3000)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build and run"
    echo "  $0 --build            # Build image only"
    echo "  $0 --run              # Run container only"
    echo "  $0 --clean --build    # Clean, then build"
    echo "  $0 --port 8080        # Run on localhost:8080"
}

# Clean up function
cleanup() {
    print_info "Cleaning up old containers and images..."
    
    # Stop and remove container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_info "Stopping existing container..."
        docker stop $CONTAINER_NAME
    fi
    
    # Remove container if exists
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        print_info "Removing existing container..."
        docker rm $CONTAINER_NAME
    fi
    
    # Remove old image if exists
    if docker images -q $IMAGE_NAME | grep -q .; then
        print_warning "Removing old image..."
        docker rmi $IMAGE_NAME
    fi
    
    print_success "Cleanup completed!"
}

# Build function
build_image() {
    print_info "Building Docker image: $IMAGE_NAME"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory!"
        exit 1
    fi
    
    # Build the image
    print_info "Starting Docker build..."
    docker build -t $IMAGE_NAME .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully!"
        docker images $IMAGE_NAME
    else
        print_error "Docker build failed!"
        exit 1
    fi
}

# Run function
run_container() {
    local dev_mode=$1
    
    print_info "Running Docker container: $CONTAINER_NAME"
    
    # Check if image exists
    if ! docker images -q $IMAGE_NAME | grep -q .; then
        print_error "Image $IMAGE_NAME not found! Please build it first with --build"
        exit 1
    fi
    
    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_info "Stopping existing container..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
    
    # Prepare docker run command
    local docker_cmd="docker run -d --name $CONTAINER_NAME -p $LOCAL_PORT:$PORT"
    
    # Add volume mounting for development mode
    if [ "$dev_mode" = "true" ]; then
        print_info "Running in development mode with volume mounting..."
        docker_cmd="$docker_cmd -v $(pwd):/app -v /app/node_modules -v /app/server/node_modules"
    fi
    
    # Add environment variables (you can add your own here)
    docker_cmd="$docker_cmd -e NODE_ENV=production"
    
    # Add the image name
    docker_cmd="$docker_cmd $IMAGE_NAME"
    
    # Run the container
    print_info "Starting container with command: $docker_cmd"
    eval $docker_cmd
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully!"
        print_info "Application is running at: http://localhost:$LOCAL_PORT"
        print_info "Container name: $CONTAINER_NAME"
        print_info ""
        print_info "Useful commands:"
        print_info "  View logs:    docker logs -f $CONTAINER_NAME"
        print_info "  Stop:         docker stop $CONTAINER_NAME"
        print_info "  Restart:      docker restart $CONTAINER_NAME"
        print_info "  Shell access: docker exec -it $CONTAINER_NAME sh"
    else
        print_error "Failed to start container!"
        exit 1
    fi
}

# Parse command line arguments
BUILD_ONLY=false
RUN_ONLY=false
CLEAN=false
DEV_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--build)
            BUILD_ONLY=true
            shift
            ;;
        -r|--run)
            RUN_ONLY=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -d|--dev)
            DEV_MODE=true
            shift
            ;;
        -p|--port)
            LOCAL_PORT="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
print_info "Starting Docker packaging for My Website..."
print_info "Image: $IMAGE_NAME | Container: $CONTAINER_NAME | Port: $LOCAL_PORT"

# Clean if requested
if [ "$CLEAN" = "true" ]; then
    cleanup
fi

# Execute based on options
if [ "$BUILD_ONLY" = "true" ]; then
    build_image
elif [ "$RUN_ONLY" = "true" ]; then
    run_container $DEV_MODE
else
    # Default: build and run
    build_image
    run_container $DEV_MODE
fi

print_success "Script completed successfully! 🚀" 