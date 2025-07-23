import React, { useState, useEffect } from 'react';
import './ImageGenerator.css';
import TouchImageViewer from './TouchImageViewer';
import PersonalProfile from './PersonalProfile';
import SmartPromptAssistant from './SmartPromptAssistant';

interface GeneratedImage {
  id: string;
  url: string;
  description: string;
  timestamp: Date;
  source: 'hugging-face-ai' | 'unsplash-photo' | 'hugging-face-video' | 'demo-video' | 'unknown';
  message: string;
  type: 'image' | 'video';
}

interface UserProfile {
  name: string;
  avatar: string;
  favoriteStyles: string[];
  preferredThemes: string[];
  creativeMood: 'explorer' | 'artist' | 'dreamer' | 'realist';
  promptHistory: string[];
  favoriteImages: string[];
  settings: {
    autoSuggest: boolean;
    dailyInspiration: boolean;
    styleRemember: boolean;
  };
}

const ImageGenerator: React.FC = () => {
  const [description, setDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string>('');
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(false);
  const [generationMode, setGenerationMode] = useState<'image' | 'video'>('image');

  // Load user profile on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('createYourMindProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    } else {
      // Show profile setup for new users after a delay
      setTimeout(() => {
        setShowProfileSetup(true);
      }, 2000);
    }
  }, []);

  const generateImage = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const endpoint = generationMode === 'video' ? '/generate-video' : '/generate-image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: description.trim(),
          mode: generationMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate ${generationMode}`);
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.url,
        description: description,
        timestamp: new Date(),
        source: data.source || 'unknown',
        message: data.message || `${generationMode} generated`,
        type: generationMode // This ensures video mode requests are treated as videos
      };

      setGeneratedImages(prev => [...prev, newImage]);
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImage();
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'hugging-face-ai':
        return '🤖';
      case 'unsplash-photo':
        return '📸';
      case 'hugging-face-video':
        return '🎬';
      case 'demo-video':
        return '🎭';
      default:
        return '❓';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'hugging-face-ai':
        return 'AI Generated';
      case 'unsplash-photo':
        return 'Photo Search';
      case 'hugging-face-video':
        return 'AI Video';
      case 'demo-video':
        return 'Demo Video';
      default:
        return 'Unknown';
    }
  };

  const getSourceClass = (source: string) => {
    switch (source) {
      case 'hugging-face-ai':
        return 'ai-generated';
      case 'unsplash-photo':
        return 'photo-search';
      case 'hugging-face-video':
        return 'video-generated';
      case 'demo-video':
        return 'demo-video';
      default:
        return 'unknown';
    }
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
  };

  const goToNextImage = () => {
    if (currentImageIndex < generatedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const deleteImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    // If current image was deleted, adjust index
    const deletedIndex = generatedImages.findIndex(img => img.id === imageId);
    if (deletedIndex === currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
    // Close viewer if no images left
    if (generatedImages.length <= 1) {
      setViewerOpen(false);
    }
  };

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.description.substring(0, 50)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  const shareImage = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], `${image.description.substring(0, 50)}.jpg`, { type: blob.type });
        
        await navigator.share({
          title: 'Generated Image',
          text: image.description,
          files: [file]
        });
      } catch (err) {
        console.error('Failed to share image:', err);
        // Fallback to clipboard
        fallbackShareImage(image);
      }
    } else {
      fallbackShareImage(image);
    }
  };

  const fallbackShareImage = (image: GeneratedImage) => {
    // Copy URL to clipboard as fallback
    navigator.clipboard.writeText(image.url).then(() => {
      alert('Image URL copied to clipboard!');
    }).catch(() => {
      // Final fallback - open in new tab
      window.open(image.url, '_blank');
    });
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('createYourMindProfile', JSON.stringify(profile));
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setDescription(suggestion);
  };

  const handleStyleSuggestion = (styles: string[]) => {
    // Apply styles to current prompt
    const styleText = styles.join(', ');
    if (description.trim()) {
      setDescription(`${description}, ${styleText}`);
    } else {
      setDescription(styleText);
    }
  };

  const getPersonalizedGreeting = () => {
    if (!userProfile?.name) return null;
    
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    return `${timeGreeting}, ${userProfile.name}! Ready to create something amazing?`;
  };

  const getButtonClass = () => {
    // Determine if AI is likely available based on recent generation results
    const recentImages = generatedImages.slice(-3);
    const hasRecentAI = recentImages.some(img => img.source === 'hugging-face-ai');
    const hasRecentPhoto = recentImages.some(img => img.source === 'unsplash-photo');
    
    if (hasRecentAI && !hasRecentPhoto) {
      return 'generate-btn ai-mode';
    } else if (hasRecentPhoto && !hasRecentAI) {
      return 'generate-btn photo-mode';
    }
    return 'generate-btn';
  };

  return (
    <div className="image-generator">
      {/* Personalized Header */}
      {userProfile && (
        <div className="personalized-header">
          <div className="user-greeting">
            <span className="user-avatar">{userProfile.avatar}</span>
            <span className="greeting-text">{getPersonalizedGreeting()}</span>
          </div>
          <button 
            className="profile-settings-btn"
            onClick={() => setShowProfileSetup(true)}
            title="Edit Profile"
          >
            ⚙️
          </button>
        </div>
      )}

      <div className="generator-form">
        {/* Smart Prompt Assistant */}
        <SmartPromptAssistant
          userProfile={userProfile}
          currentPrompt={description}
          onPromptSuggestion={handlePromptSuggestion}
          onStyleSuggestion={handleStyleSuggestion}
        />

        {/* Generation Mode Toggle */}
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${generationMode === 'image' ? 'active' : ''}`}
            onClick={() => setGenerationMode('image')}
          >
            🖼️ Images
          </button>
          <button
            type="button"
            className={`mode-btn ${generationMode === 'video' ? 'active' : ''}`}
            onClick={() => setGenerationMode('video')}
          >
            🎬 Videos
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="description">
              {userProfile ? `What ${generationMode} would you like to create today?` : `Describe the ${generationMode} you want to create:`}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                generationMode === 'video' 
                  ? userProfile
                    ? `Describe your video vision! Try: "A ${userProfile.preferredThemes[0]?.toLowerCase() || 'peaceful'} scene with ${userProfile.favoriteStyles[0]?.toLowerCase() || 'cinematic'} movement"`
                    : "Be specific! Try: 'Waves crashing on rocky cliffs, seagulls flying overhead, sunset lighting' or 'Forest path with falling autumn leaves, gentle camera movement'"
                  : userProfile 
                    ? `Tell me your vision... I'll help make it amazing! Try: "${userProfile.preferredThemes[0]?.toLowerCase() || 'landscape'} with ${userProfile.favoriteStyles[0]?.toLowerCase() || 'artistic'} style"`
                    : "Be specific! Try: 'snow-capped mountain range with pine trees, dramatic clouds, landscape photography' or 'rocky mountain peaks at golden hour, alpine meadow in foreground'"
              }
              rows={4}
              disabled={isGenerating}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={isGenerating || !description.trim()}
            className={getButtonClass()}
          >
{isGenerating ? `Generating ${generationMode}...` : `Generate ${generationMode === 'image' ? 'Image' : 'Video'}`}
          </button>
        </form>
      </div>

      <div className="generated-images">
        <h2>Generated Content</h2>
        {generatedImages.length === 0 ? (
          <div className="no-images">
            <p>No content generated yet. Start by describing what you want to create above!</p>
          </div>
        ) : (
          <div className="images-grid">
            {generatedImages.map((image, index) => (
              <div 
                key={image.id} 
                className={`image-card ${getSourceClass(image.source)}-card`}
                onClick={() => openImageViewer(index)}
              >
                <div className="image-container-card">
                  {image.type === 'video' ? (
                    <video 
                      src={image.url} 
                      poster={image.url.replace('.mp4', '_thumbnail.jpg')}
                      controls
                      muted
                      loop
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <img src={image.url} alt={image.description} />
                  )}
                  <div className="image-overlay">
                    <div className="overlay-icon">👆</div>
                    <div className="overlay-text">Tap to view</div>
                  </div>
                </div>
                <div className="image-info">
                  <p className="description">{image.description}</p>
                  <div className="source-info">
                    <span className={`source-badge ${getSourceClass(image.source)}`}>
                      {getSourceIcon(image.source)} {getSourceLabel(image.source)}
                    </span>
                    <span className="source-message">{image.message}</span>
                  </div>
                  <p className="timestamp">
                    {image.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Touch Image Viewer Modal */}
      {viewerOpen && generatedImages.length > 0 && (
        <TouchImageViewer
          images={generatedImages}
          currentIndex={currentImageIndex}
          onClose={closeImageViewer}
          onNext={goToNextImage}
          onPrevious={goToPreviousImage}
          onDelete={deleteImage}
          onDownload={downloadImage}
          onShare={shareImage}
        />
      )}

      {/* Personal Profile Setup/Edit Modal */}
      {showProfileSetup && (
        <PersonalProfile
          onProfileUpdate={handleProfileUpdate}
          onClose={() => setShowProfileSetup(false)}
        />
      )}
    </div>
  );
};

export default ImageGenerator; 