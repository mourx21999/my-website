import React, { useState, useEffect } from 'react';
import './ImageGenerator.css';
import TouchImageViewer from './TouchImageViewer';
import PersonalProfile from './PersonalProfile';
import SmartPromptAssistant from './SmartPromptAssistant';
import AIPromptArchitect from './AIPromptArchitect';
import StyleTransferChain from './StyleTransferChain';
import InteractiveImageEditor from './InteractiveImageEditor';
import CollaborativeCanvas from './CollaborativeCanvas';
import ImageStoryGenerator from './ImageStoryGenerator';
import MoodBasedGeneration from './MoodBasedGeneration';
import TextStoryGenerator from './TextStoryGenerator';
import ImageToImageGenerator from './ImageToImageGenerator';

interface GeneratedImage {
  id: string;
  url: string;
  description: string;
  timestamp: Date;
  source: 'hugging-face-ai' | 'unsplash-photo' | 'unknown';
  message: string;
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
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState<boolean>(false);
  const [selectedImageForStyleTransfer, setSelectedImageForStyleTransfer] = useState<string | null>(null);
  const [selectedImageForEditing, setSelectedImageForEditing] = useState<string | null>(null);
  const [showCollaborativeCanvas, setShowCollaborativeCanvas] = useState<boolean>(false);
  const [showImageStoryGenerator, setShowImageStoryGenerator] = useState<boolean>(false);
  const [showMoodBasedGeneration, setShowMoodBasedGeneration] = useState<boolean>(false);
  const [showTextStoryGenerator, setShowTextStoryGenerator] = useState<boolean>(false);
  const [showImageToImageGenerator, setShowImageToImageGenerator] = useState<boolean>(false);

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
      const endpoint = '/generate-image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: description.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.url,
        description: description,
        timestamp: new Date(),
        source: data.source || 'unknown',
        message: data.message || 'Image generated'
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

  const handlePromptImprove = (improvedPrompt: string) => {
    setDescription(improvedPrompt);
  };

  const handleStyleTransfer = (originalImage: string, styles: string[]) => {
    // Create a new prompt for style transfer
    const stylePrompt = `${description} in the style of ${styles.join(' and ')}`;
    setDescription(stylePrompt);
    // Trigger generation with the style-modified prompt
    generateImage();
  };

  const handleImageEdit = (editedImage: string, editDescription: string) => {
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: editedImage,
      description: `Edited: ${editDescription}`,
      timestamp: new Date(),
      source: 'unknown',
      message: 'Interactive editing completed',
    };
    setGeneratedImages(prev => [...prev, newImage]);
  };

  const handleCanvasCreate = (canvasData: string, collaborators: string[]) => {
    setDescription(canvasData);
    // Auto-generate after collaborative prompt creation
    generateImage();
  };

  const handleStoryGenerate = (story: any) => {
    // Use the story title as a prompt for generating a cover image
    const coverPrompt = `Book cover art for "${story.title}", ${story.genre.toLowerCase()} ${story.mood.toLowerCase()} style, featuring ${story.characters.map((c: any) => c.name).join(' and ')}, professional book cover design`;
    setDescription(coverPrompt);
    generateImage();
  };

  const handleTextStoryGenerate = (story: any) => {
    console.log('📚 Text story generated:', story);
    // Optionally generate a cover image for the text story
    if (story.characters.length > 0) {
      const coverPrompt = `Book cover art for "${story.title}", ${story.genre.toLowerCase()} ${story.mood.toLowerCase()} style, featuring ${story.characters.map((c: any) => c.name).join(' and ')}, professional book cover design`;
      setDescription(coverPrompt);
      generateImage();
    }
  };

  const handleImageGenerate = (imageData: any) => {
    console.log('🎨 Image-to-image generated:', imageData);
    // Add the transformed image to the gallery
    const newImage: GeneratedImage = {
      id: imageData.id || Date.now().toString(),
      url: imageData.url,
      description: imageData.description || 'Image transformation',
      timestamp: imageData.timestamp || new Date(),
      source: imageData.source || 'hugging-face-img2img',
      message: imageData.message || 'Image transformed successfully'
    };
    setGeneratedImages(prev => [newImage, ...prev]);
  };

  const handleMoodGenerate = (prompt: string, mood: any) => {
    setDescription(prompt);
    generateImage();
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

        {/* AI Prompt Architect */}
        <AIPromptArchitect
          currentPrompt={description}
          onPromptImprove={handlePromptImprove}
        />

        {/* Advanced Features Toggle */}
        <div className="advanced-features-toggle">
          <button
            className="toggle-advanced-btn"
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
          >
            🚀 {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced AI Features
          </button>
        </div>


        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="description">
              {userProfile ? 'What image would you like to create today?' : 'Describe the image you want to create:'}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                userProfile 
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
{isGenerating ? 'Generating image...' : 'Generate Image'}
          </button>
        </form>
      </div>

      {/* Advanced AI Features */}
      {showAdvancedFeatures && (
        <div className="advanced-features-panel">
          {/* Feature Selection Tabs */}
          <div className="advanced-features-tabs">
            <button
              className={`feature-tab ${showMoodBasedGeneration ? 'active' : ''}`}
              onClick={() => {
                setShowMoodBasedGeneration(true);
                setShowCollaborativeCanvas(false);
                setShowImageStoryGenerator(false);
                setShowTextStoryGenerator(false);
                setShowImageToImageGenerator(false);
              }}
            >
              🎭 Mood Generation
            </button>
            <button
              className={`feature-tab ${showCollaborativeCanvas ? 'active' : ''}`}
              onClick={() => {
                setShowCollaborativeCanvas(true);
                setShowMoodBasedGeneration(false);
                setShowImageStoryGenerator(false);
                setShowTextStoryGenerator(false);
                setShowImageToImageGenerator(false);
              }}
            >
              🤝 Collaborative Canvas
            </button>
            <button
              className={`feature-tab ${showImageStoryGenerator ? 'active' : ''}`}
              onClick={() => {
                setShowImageStoryGenerator(true);
                setShowMoodBasedGeneration(false);
                setShowCollaborativeCanvas(false);
                setShowTextStoryGenerator(false);
                setShowImageToImageGenerator(false);
              }}
            >
              📚 Image Stories
            </button>
            <button
              className={`feature-tab ${showTextStoryGenerator ? 'active' : ''}`}
              onClick={() => {
                setShowTextStoryGenerator(true);
                setShowMoodBasedGeneration(false);
                setShowCollaborativeCanvas(false);
                setShowImageStoryGenerator(false);
                setShowImageToImageGenerator(false);
              }}
            >
              📝 Text Stories
            </button>
            <button
              className={`feature-tab ${showImageToImageGenerator ? 'active' : ''}`}
              onClick={() => {
                setShowImageToImageGenerator(true);
                setShowTextStoryGenerator(false);
                setShowMoodBasedGeneration(false);
                setShowCollaborativeCanvas(false);
                setShowImageStoryGenerator(false);
              }}
            >
              🎨 Image Transform
            </button>
          </div>

          {/* Mood-Based Generation */}
          {showMoodBasedGeneration && (
            <MoodBasedGeneration onMoodGenerate={handleMoodGenerate} />
          )}

          {/* Collaborative Canvas */}
          {showCollaborativeCanvas && (
            <CollaborativeCanvas onCanvasCreate={handleCanvasCreate} />
          )}

          {/* Image Story Generator */}
          {showImageStoryGenerator && (
            <ImageStoryGenerator
              images={generatedImages.map(img => img.url)}
              onStoryGenerate={handleStoryGenerate}
            />
          )}

          {/* Text Story Generator */}
          {showTextStoryGenerator && (
            <TextStoryGenerator onStoryGenerate={handleTextStoryGenerate} />
          )}
          {/* Image-to-Image Generator */}
          {showImageToImageGenerator && (
            <ImageToImageGenerator onImageGenerate={handleImageGenerate} />
          )}

          {/* Style Transfer Chain */}
          {selectedImageForStyleTransfer && (
            <StyleTransferChain
              originalImage={selectedImageForStyleTransfer}
              onStyleTransfer={handleStyleTransfer}
            />
          )}

          {/* Interactive Image Editor */}
          {selectedImageForEditing && (
            <InteractiveImageEditor
              originalImage={selectedImageForEditing}
              onImageEdit={handleImageEdit}
            />
          )}
        </div>
      )}

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
                className={`image-card ${getSourceClass(image.source)}-card ${selectedImageForStyleTransfer === image.url ? 'selected-for-transfer' : ''}`}
                onClick={() => openImageViewer(index)}
              >
                <div className="image-container-card">
                  <img src={image.url} alt={image.description} />
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
                  {showAdvancedFeatures && (
                    <div className="advanced-actions">
                      <button
                        className="btn-style-transfer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageForStyleTransfer(image.url);
                        }}
                      >
                        🎨 Style Transfer
                      </button>
                      <button
                        className="btn-interactive-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageForEditing(image.url);
                        }}
                      >
                        ✨ Interactive Edit
                      </button>
                    </div>
                  )}
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