import React, { useState, useRef, useCallback } from 'react';
import './InteractiveImageEditor.css';

interface InteractiveImageEditorProps {
  originalImage: string;
  onImageEdit: (editedImage: string, editDescription: string) => void;
}

interface EditPoint {
  x: number;
  y: number;
  type: 'regenerate' | 'remove' | 'enhance';
  prompt: string;
}

const InteractiveImageEditor: React.FC<InteractiveImageEditorProps> = ({
  originalImage,
  onImageEdit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editPoints, setEditPoints] = useState<EditPoint[]>([]);
  const [selectedTool, setSelectedTool] = useState<'regenerate' | 'remove' | 'enhance'>('regenerate');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newEditPoint: EditPoint = {
      x,
      y,
      type: selectedTool,
      prompt: currentPrompt || getDefaultPromptForTool(selectedTool)
    };

    setEditPoints(prev => [...prev, newEditPoint]);
  }, [selectedTool, currentPrompt]);

  const getDefaultPromptForTool = (tool: string): string => {
    switch (tool) {
      case 'regenerate': return 'improve this area';
      case 'remove': return 'remove this object';
      case 'enhance': return 'enhance details here';
      default: return '';
    }
  };

  const processEdits = async () => {
    if (editPoints.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create edit description
      const editDescription = editPoints.map((point, index) => 
        `Edit ${index + 1}: ${point.type} at position (${Math.round(point.x)}%, ${Math.round(point.y)}%) - ${point.prompt}`
      ).join('; ');
      
      // In a real implementation, this would call an inpainting API
      onImageEdit(originalImage, editDescription);
      
    } catch (error) {
      console.error('Image editing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearEdits = () => {
    setEditPoints([]);
  };

  const removeEditPoint = (index: number) => {
    setEditPoints(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="interactive-image-editor">
      <div className="iie-header">
        <h3>✨ Interactive Image Editor</h3>
        <p>Click on areas you want to modify, then process your edits</p>
      </div>

      <div className="editor-content">
        <div className="image-canvas-container">
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="edit-canvas"
            onClick={handleCanvasClick}
            style={{ backgroundImage: `url(${originalImage})` }}
          />
          
          {/* Edit points overlay */}
          <div className="edit-points-overlay">
            {editPoints.map((point, index) => (
              <div
                key={index}
                className={`edit-point edit-${point.type}`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeEditPoint(index);
                }}
                title={`${point.type}: ${point.prompt}`}
              >
                <div className="edit-number">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-controls">
          <div className="tool-selector">
            <h4>🛠️ Edit Tools</h4>
            <div className="tool-buttons">
              <button
                className={`tool-btn ${selectedTool === 'regenerate' ? 'active' : ''}`}
                onClick={() => setSelectedTool('regenerate')}
              >
                🔄 Regenerate
              </button>
              <button
                className={`tool-btn ${selectedTool === 'remove' ? 'active' : ''}`}
                onClick={() => setSelectedTool('remove')}
              >
                🗑️ Remove
              </button>
              <button
                className={`tool-btn ${selectedTool === 'enhance' ? 'active' : ''}`}
                onClick={() => setSelectedTool('enhance')}
              >
                ✨ Enhance
              </button>
            </div>
          </div>

          <div className="edit-prompt">
            <h4>📝 Edit Instruction</h4>
            <input
              type="text"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder={`What would you like to ${selectedTool}?`}
              className="prompt-input"
            />
          </div>

          <div className="edit-summary">
            <h4>📍 Edit Points ({editPoints.length})</h4>
            {editPoints.length > 0 ? (
              <div className="edit-list">
                {editPoints.map((point, index) => (
                  <div key={index} className="edit-item">
                    <span className={`edit-type-badge ${point.type}`}>
                      {point.type}
                    </span>
                    <span className="edit-description">{point.prompt}</span>
                    <button
                      className="remove-edit-btn"
                      onClick={() => removeEditPoint(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-edits">Click on the image to add edit points</p>
            )}
          </div>

          <div className="editor-actions">
            <button
              className="btn-clear-edits"
              onClick={clearEdits}
              disabled={editPoints.length === 0}
            >
              Clear All
            </button>
            <button
              className="btn-process-edits"
              onClick={processEdits}
              disabled={editPoints.length === 0 || isProcessing}
            >
              {isProcessing ? 'Processing Edits...' : `Process ${editPoints.length} Edits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveImageEditor;