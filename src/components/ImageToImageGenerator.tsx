import React, { useState, useRef } from 'react';
import './ImageToImageGenerator.css';

interface ImageToImageGeneratorProps {
  onImageGenerate: (imageData: any) => void;
}

interface GenerationSettings {
  strength: number;
  guidance: number;
  steps: number;
}

const ImageToImageGenerator: React.FC<ImageToImageGeneratorProps> = ({ onImageGenerate }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    strength: 0.75,
    guidance: 7.5,
    steps: 30
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setGeneratedImage(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (JPG, PNG, GIF, etc.)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Directly handle the file instead of creating fake event
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImage(result);
          setGeneratedImage(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateImage = async () => {
    if (!uploadedImage || !prompt.trim()) {
      alert('Please upload an image and enter a prompt!');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🎨 Starting image-to-image generation...');
      
      // Convert base64 to blob for sending
      const response = await fetch('/generate-image-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: uploadedImage,
          strength: settings.strength,
          guidance_scale: settings.guidance,
          num_inference_steps: settings.steps,
          mode: 'img2img'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      if (data.url) {
        setGeneratedImage(data.url);
        onImageGenerate({
          id: Date.now().toString(),
          url: data.url,
          description: `Image-to-image: ${prompt}`,
          timestamp: new Date(),
          source: data.source || 'img2img',
          message: data.message || 'Image transformed successfully',
          originalImage: uploadedImage,
          prompt: prompt,
          settings: settings
        });
        console.log('✅ Image-to-image generation successful!');
      } else {
        throw new Error('No image URL received');
      }

    } catch (error) {
      console.error('❌ Image-to-image generation failed:', error);
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetPrompts = [
    'oil painting style, artistic masterpiece',
    'photorealistic, 8K resolution, professional photography',
    'anime style, vibrant colors, detailed illustration',
    'cyberpunk aesthetic, neon lights, futuristic',
    'watercolor painting, soft brushstrokes, artistic',
    'black and white photograph, dramatic lighting',
    'van gogh style, impressionist, swirling brushstrokes',
    'cartoon style, bright colors, playful illustration'
  ];

  const handlePresetPrompt = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  return (
    <div className="image-to-image-generator">
      <div className="i2i-header">
        <h3>🎨 Image-to-Image Generator</h3>
        <p>Upload an image and transform it with AI using text prompts</p>
      </div>

      <div className="i2i-content">
        {/* Image Upload Section */}
        <div className="upload-section">
          <h4>📷 Upload Base Image</h4>
          
          {!uploadedImage ? (
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">JPG, PNG, GIF up to 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="uploaded-image-container">
              <div className="image-preview">
                <img src={uploadedImage} alt="Uploaded" />
                <button className="remove-image-btn" onClick={removeImage}>
                  ✕
                </button>
              </div>
              <p className="image-info">✅ Image uploaded successfully</p>
            </div>
          )}
        </div>

        {/* Prompt Section */}
        <div className="prompt-section">
          <h4>✨ Transformation Prompt</h4>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want to transform the image... e.g., 'oil painting style, vibrant colors, artistic masterpiece'"
            className="prompt-input"
            rows={3}
          />
          
          {/* Preset Prompts */}
          <div className="preset-prompts">
            <p className="preset-label">🎯 Quick Presets:</p>
            <div className="preset-buttons">
              {presetPrompts.map((preset, index) => (
                <button
                  key={index}
                  className="preset-btn"
                  onClick={() => handlePresetPrompt(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <h4>⚙️ Generation Settings</h4>
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                Strength: {settings.strength}
                <span className="setting-hint">How much to change the original image</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.strength}
                onChange={(e) => setSettings(prev => ({ ...prev, strength: parseFloat(e.target.value) }))}
                className="setting-slider"
              />
              <div className="slider-labels">
                <span>Subtle</span>
                <span>Dramatic</span>
              </div>
            </div>

            <div className="setting-item">
              <label>
                Guidance: {settings.guidance}
                <span className="setting-hint">How closely to follow the prompt</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={settings.guidance}
                onChange={(e) => setSettings(prev => ({ ...prev, guidance: parseFloat(e.target.value) }))}
                className="setting-slider"
              />
              <div className="slider-labels">
                <span>Creative</span>
                <span>Precise</span>
              </div>
            </div>

            <div className="setting-item">
              <label>
                Steps: {settings.steps}
                <span className="setting-hint">Generation quality vs speed</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={settings.steps}
                onChange={(e) => setSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                className="setting-slider"
              />
              <div className="slider-labels">
                <span>Fast</span>
                <span>High Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="generate-section">
          <button
            className="generate-btn"
            onClick={generateImage}
            disabled={!uploadedImage || !prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <div className="generating-status">
                <div className="spinner"></div>
                Transforming image...
              </div>
            ) : (
              '🎨 Transform Image'
            )}
          </button>
        </div>

        {/* Result Section */}
        {generatedImage && (
          <div className="result-section">
            <h4>🎉 Generated Result</h4>
            <div className="result-comparison">
              <div className="comparison-item">
                <h5>Original</h5>
                <img src={uploadedImage || ''} alt="Original" />
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <h5>Transformed</h5>
                <img src={generatedImage} alt="Generated" />
              </div>
            </div>
            <div className="result-info">
              <p><strong>Prompt:</strong> {prompt}</p>
              <p><strong>Settings:</strong> Strength: {settings.strength}, Guidance: {settings.guidance}, Steps: {settings.steps}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToImageGenerator;