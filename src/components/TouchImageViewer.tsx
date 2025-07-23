import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TouchImageViewer.css';

interface GeneratedImage {
  id: string;
  url: string;
  description: string;
  timestamp: Date;
  source: 'hugging-face-ai' | 'unsplash-photo' | 'hugging-face-video' | 'unknown';
  message: string;
  type: 'image' | 'video';
}

interface TouchImageViewerProps {
  images: GeneratedImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete?: (imageId: string) => void;
  onDownload?: (image: GeneratedImage) => void;
  onShare?: (image: GeneratedImage) => void;
}

interface TouchState {
  x: number;
  y: number;
  scale: number;
  translateX: number;
  translateY: number;
  initialDistance: number;
  initialScale: number;
  initialTranslateX: number;
  initialTranslateY: number;
  lastTapTime: number;
  tapCount: number;
  isZoomed: boolean;
}

const TouchImageViewer: React.FC<TouchImageViewerProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onDelete,
  onDownload,
  onShare
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    x: 0,
    y: 0,
    scale: 1,
    translateX: 0,
    translateY: 0,
    initialDistance: 0,
    initialScale: 1,
    initialTranslateX: 0,
    initialTranslateY: 0,
    lastTapTime: 0,
    tapCount: 0,
    isZoomed: false
  });
  
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);

  const currentImage = images[currentIndex];

  // Reset transform when image changes
  useEffect(() => {
    setTouchState(prev => ({
      ...prev,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isZoomed: false
    }));
    setShowContextMenu(false);
  }, [currentIndex]);

  const resetZoom = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isZoomed: false
    }));
  }, []);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1) {
      const touch = touches[0];
      setSwipeStartX(touch.clientX);
      setSwipeStartY(touch.clientY);
      
      // Handle long press
      const timer = setTimeout(() => {
        handleLongPress(touch.clientX, touch.clientY);
      }, 500);
      setLongPressTimer(timer);

      // Handle double tap
      const now = Date.now();
      const timeDiff = now - touchState.lastTapTime;
      
      if (timeDiff < 300 && timeDiff > 0) {
        // Double tap detected
        handleDoubleTap(touch.clientX, touch.clientY);
        setTouchState(prev => ({ ...prev, tapCount: 0, lastTapTime: 0 }));
      } else {
        setTouchState(prev => ({ 
          ...prev, 
          lastTapTime: now, 
          tapCount: 1,
          x: touch.clientX,
          y: touch.clientY
        }));
      }
    } else if (touches.length === 2) {
      // Clear long press timer on pinch
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      
      setTouchState(prev => ({
        ...prev,
        initialDistance: distance,
        initialScale: prev.scale,
        initialTranslateX: prev.translateX,
        initialTranslateY: prev.translateY,
        x: center.x,
        y: center.y
      }));
      setIsDragging(false);
    }

    setShowContextMenu(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;

    // Clear long press timer on move
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (touches.length === 1 && touchState.isZoomed) {
      // Single finger drag when zoomed
      const touch = touches[0];
      const deltaX = touch.clientX - touchState.x;
      const deltaY = touch.clientY - touchState.y;

      setTouchState(prev => ({
        ...prev,
        translateX: prev.initialTranslateX + deltaX,
        translateY: prev.initialTranslateY + deltaY
      }));
      setIsDragging(true);
    } else if (touches.length === 2) {
      // Pinch to zoom
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      
      const scaleChange = distance / touchState.initialDistance;
      const newScale = Math.max(0.5, Math.min(5, touchState.initialScale * scaleChange));
      
      // Calculate translation to keep zoom centered
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        const offsetX = (center.x - containerRect.left - containerCenterX) * (newScale - 1);
        const offsetY = (center.y - containerRect.top - containerCenterY) * (newScale - 1);
        
        setTouchState(prev => ({
          ...prev,
          scale: newScale,
          translateX: touchState.initialTranslateX - offsetX,
          translateY: touchState.initialTranslateY - offsetY,
          isZoomed: newScale > 1
        }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touches = e.changedTouches;
    
    if (touches.length === 1 && !isDragging && !touchState.isZoomed) {
      // Handle swipe navigation
      const touch = touches[0];
      const deltaX = touch.clientX - swipeStartX;
      const deltaY = touch.clientY - swipeStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Swipe threshold
      if (absDeltaX > 50 && absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
    }

    // Update initial values for next gesture
    setTouchState(prev => ({
      ...prev,
      initialScale: prev.scale,
      initialTranslateX: prev.translateX,
      initialTranslateY: prev.translateY
    }));
    
    setIsDragging(false);
  };

  const handleDoubleTap = (x: number, y: number) => {
    if (touchState.isZoomed) {
      resetZoom();
    } else {
      // Zoom in to 2x centered on tap point
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        const offsetX = (x - containerRect.left - containerCenterX) * 1;
        const offsetY = (y - containerRect.top - containerCenterY) * 1;
        
        setTouchState(prev => ({
          ...prev,
          scale: 2,
          translateX: -offsetX,
          translateY: -offsetY,
          isZoomed: true,
          initialScale: 2,
          initialTranslateX: -offsetX,
          initialTranslateY: -offsetY
        }));
      }
    }
  };

  const handleLongPress = (x: number, y: number) => {
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNext();
    }
  }, [currentIndex, images.length, onNext]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onPrevious();
    }
  }, [currentIndex, onPrevious]);

  // Handle escape key - placed after function definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (touchState.isZoomed) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [touchState.isZoomed, resetZoom, onClose, handlePrevious, handleNext]);

  const handleContextAction = (action: string) => {
    setShowContextMenu(false);
    
    switch (action) {
      case 'download':
        onDownload?.(currentImage);
        break;
      case 'share':
        onShare?.(currentImage);
        break;
      case 'delete':
        onDelete?.(currentImage.id);
        break;
      case 'fullscreen':
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        break;
    }
  };

  return (
    <div className="touch-image-viewer" onClick={() => setShowContextMenu(false)}>
      <div className="viewer-header">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="image-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="image-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
{currentImage.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentImage.url}
            className="viewer-image"
            style={{
              transform: `scale(${touchState.scale}) translate(${touchState.translateX}px, ${touchState.translateY}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            controls
            muted
            loop
            autoPlay
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <img
            ref={imageRef}
            src={currentImage.url}
            alt={currentImage.description}
            className="viewer-image"
            style={{
              transform: `scale(${touchState.scale}) translate(${touchState.translateX}px, ${touchState.translateY}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            draggable={false}
          />
        )}

        {/* Navigation arrows */}
        {!touchState.isZoomed && (
          <>
            {currentIndex > 0 && (
              <button className="nav-btn nav-prev" onClick={handlePrevious}>
                ←
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button className="nav-btn nav-next" onClick={handleNext}>
                →
              </button>
            )}
          </>
        )}
      </div>

      {/* Image info */}
      <div className="viewer-info">
        <h3>{currentImage.description}</h3>
        <div className="image-meta">
          <span className={`source-badge ${currentImage.source}`}>
            {currentImage.source === 'hugging-face-ai' ? '🤖' : '📸'} 
            {currentImage.source === 'hugging-face-ai' ? 'AI Generated' : 'Photo Search'}
          </span>
          <span className="timestamp">{currentImage.timestamp.toLocaleString()}</span>
        </div>
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div 
          className="context-menu"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handleContextAction('download')}>
            📥 Download
          </button>
          <button onClick={() => handleContextAction('share')}>
            📤 Share
          </button>
          <button onClick={() => handleContextAction('fullscreen')}>
            🔍 Fullscreen
          </button>
          {onDelete && (
            <button onClick={() => handleContextAction('delete')} className="delete-action">
              🗑️ Delete
            </button>
          )}
        </div>
      )}

      {/* Gesture hints */}
      <div className="gesture-hints">
        <div className="hint">Double-tap to zoom</div>
        <div className="hint">Pinch to zoom</div>
        <div className="hint">Swipe to navigate</div>
        <div className="hint">Long-press for options</div>
      </div>
    </div>
  );
};

export default TouchImageViewer; 