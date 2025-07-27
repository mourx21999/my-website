import React, { useState } from 'react';
import './StyleTransferChain.css';

interface StyleTransferChainProps {
  originalImage: string;
  onStyleTransfer: (image: string, styles: string[]) => void;
}

const ARTISTIC_STYLES = [
  { id: 'vangogh', name: 'Van Gogh', description: 'Swirling, expressive brushstrokes' },
  { id: 'picasso', name: 'Picasso', description: 'Cubist geometric forms' },
  { id: 'monet', name: 'Monet', description: 'Impressionist light and color' },
  { id: 'digital', name: 'Digital Art', description: 'Modern digital aesthetics' },
  { id: 'anime', name: 'Anime Style', description: 'Japanese animation style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing watercolor effects' },
  { id: 'oil', name: 'Oil Painting', description: 'Rich, textured oil painting' },
  { id: 'sketch', name: 'Pencil Sketch', description: 'Hand-drawn pencil artwork' },
  { id: 'neon', name: 'Neon Cyber', description: 'Glowing cyberpunk aesthetics' },
  { id: 'vintage', name: 'Vintage', description: 'Retro, aged appearance' }
];

const StyleTransferChain: React.FC<StyleTransferChainProps> = ({
  originalImage,
  onStyleTransfer
}) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(originalImage);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const processStyleChain = async () => {
    if (selectedStyles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate style transfer processing
      const styleNames = selectedStyles.map(id => 
        ARTISTIC_STYLES.find(s => s.id === id)?.name
      ).filter(Boolean) as string[];
      
      // In a real implementation, this would call style transfer APIs
      // For now, we'll create a modified description for regeneration
      onStyleTransfer(originalImage, styleNames);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Style transfer failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearStyles = () => {
    setSelectedStyles([]);
    setPreviewImage(originalImage);
  };

  return (
    <div className="style-transfer-chain">
      <div className="stc-header">
        <h3>🎨 AI Style Transfer Chain</h3>
        <p>Apply artistic styles in sequence to create unique transformations</p>
      </div>

      <div className="stc-content">
        <div className="style-selector">
          <h4>Select Styles (in order)</h4>
          <div className="styles-grid">
            {ARTISTIC_STYLES.map((style, index) => (
              <div
                key={style.id}
                className={`style-card ${selectedStyles.includes(style.id) ? 'selected' : ''}`}
                onClick={() => toggleStyle(style.id)}
              >
                <div className="style-preview">
                  <div className={`style-icon style-${style.id}`}></div>
                </div>
                <div className="style-info">
                  <div className="style-name">{style.name}</div>
                  <div className="style-desc">{style.description}</div>
                </div>
                {selectedStyles.includes(style.id) && (
                  <div className="style-order">
                    {selectedStyles.indexOf(style.id) + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="style-chain-display">
          <h4>Style Chain Preview</h4>
          <div className="chain-flow">
            <div className="chain-step original">
              <div className="step-label">Original</div>
              <img src={originalImage} alt="Original" className="chain-image" />
            </div>
            
            {selectedStyles.map((styleId, index) => {
              const style = ARTISTIC_STYLES.find(s => s.id === styleId);
              return (
                <React.Fragment key={styleId}>
                  <div className="chain-arrow">→</div>
                  <div className="chain-step">
                    <div className="step-label">{style?.name}</div>
                    <div className="chain-preview">
                      <div className={`preview-style style-${styleId}`}></div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="stc-controls">
          <button 
            className="btn-clear"
            onClick={clearStyles}
            disabled={selectedStyles.length === 0}
          >
            Clear All
          </button>
          <button 
            className="btn-process"
            onClick={processStyleChain}
            disabled={selectedStyles.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing Chain...' : `Apply ${selectedStyles.length} Styles`}
          </button>
        </div>

        {selectedStyles.length > 0 && (
          <div className="style-recipe">
            <h4>Style Recipe</h4>
            <div className="recipe-code">
              {selectedStyles.map(id => ARTISTIC_STYLES.find(s => s.id === id)?.name).join(' → ')}
            </div>
            <button className="btn-save-recipe">Save Recipe</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleTransferChain;