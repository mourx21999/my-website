import React, { useState, useEffect } from 'react';
import './AIPromptArchitect.css';

interface PromptAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAdditions: string[];
  complexity: 'Simple' | 'Moderate' | 'Complex' | 'Expert';
  categories: string[];
}

interface AIPromptArchitectProps {
  currentPrompt: string;
  onPromptImprove: (improvedPrompt: string) => void;
}

const PROMPT_ENHANCERS = {
  lighting: ['golden hour', 'dramatic lighting', 'soft ambient light', 'cinematic lighting', 'rim lighting'],
  style: ['photorealistic', 'hyperrealistic', 'digital art', 'concept art', 'studio quality'],
  composition: ['rule of thirds', 'dynamic composition', 'perfect framing', 'depth of field'],
  quality: ['8K resolution', 'ultra detailed', 'masterpiece', 'award winning', 'professional'],
  mood: ['atmospheric', 'moody', 'vibrant', 'serene', 'dramatic'],
  technical: ['sharp focus', 'high contrast', 'vivid colors', 'perfect exposure']
};

const NEGATIVE_PROMPTS = [
  'blurry', 'low quality', 'pixelated', 'distorted', 'oversaturated', 
  'watermark', 'text', 'signature', 'cropped', 'out of frame'
];

const AIPromptArchitect: React.FC<AIPromptArchitectProps> = ({
  currentPrompt,
  onPromptImprove
}) => {
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [selectedEnhancers, setSelectedEnhancers] = useState<string[]>([]);

  useEffect(() => {
    if (currentPrompt.length > 3) {
      analyzePrompt(currentPrompt);
    }
  }, [currentPrompt]);

  const analyzePrompt = async (prompt: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const words = prompt.toLowerCase().split(' ');
    const wordCount = words.length;
    
    // Analyze prompt components
    const hasStyle = words.some(word => 
      ['realistic', 'digital', 'art', 'painting', 'photo'].includes(word)
    );
    const hasLighting = words.some(word => 
      ['light', 'bright', 'dark', 'shadow', 'glow'].includes(word)
    );
    const hasComposition = words.some(word => 
      ['close', 'wide', 'angle', 'view', 'perspective'].includes(word)
    );
    const hasQuality = words.some(word => 
      ['high', 'detailed', 'quality', 'hd', '4k'].includes(word)
    );

    // Calculate score
    let score = Math.min(wordCount * 5, 50); // Base score from word count
    if (hasStyle) score += 15;
    if (hasLighting) score += 15;
    if (hasComposition) score += 10;
    if (hasQuality) score += 10;
    
    // Determine complexity
    let complexity: PromptAnalysis['complexity'] = 'Simple';
    if (wordCount > 15) complexity = 'Moderate';
    if (wordCount > 25) complexity = 'Complex';
    if (wordCount > 35) complexity = 'Expert';

    // Generate analysis
    const strengths: string[] = [];
    const improvements: string[] = [];
    const suggestedAdditions: string[] = [];

    if (hasStyle) strengths.push('Includes artistic style specification');
    if (hasLighting) strengths.push('Mentions lighting conditions');
    if (hasComposition) strengths.push('Describes composition elements');
    if (hasQuality) strengths.push('Specifies quality requirements');

    if (!hasStyle) {
      improvements.push('Add artistic style (e.g., "digital art", "photorealistic")');
      suggestedAdditions.push(...PROMPT_ENHANCERS.style.slice(0, 2));
    }
    if (!hasLighting) {
      improvements.push('Specify lighting conditions');
      suggestedAdditions.push(...PROMPT_ENHANCERS.lighting.slice(0, 2));
    }
    if (!hasQuality) {
      improvements.push('Add quality descriptors');
      suggestedAdditions.push(...PROMPT_ENHANCERS.quality.slice(0, 2));
    }

    setAnalysis({
      score: Math.min(score, 100),
      strengths,
      improvements,
      suggestedAdditions,
      complexity,
      categories: detectCategories(words)
    });
    
    setIsAnalyzing(false);
  };

  const detectCategories = (words: string[]): string[] => {
    const categories: string[] = [];
    
    if (words.some(w => ['person', 'man', 'woman', 'face', 'portrait'].includes(w))) {
      categories.push('Portrait');
    }
    if (words.some(w => ['landscape', 'mountain', 'ocean', 'forest', 'nature'].includes(w))) {
      categories.push('Landscape');
    }
    if (words.some(w => ['city', 'building', 'street', 'urban'].includes(w))) {
      categories.push('Urban');
    }
    if (words.some(w => ['animal', 'cat', 'dog', 'bird', 'wildlife'].includes(w))) {
      categories.push('Animal');
    }
    if (words.some(w => ['fantasy', 'magic', 'dragon', 'wizard'].includes(w))) {
      categories.push('Fantasy');
    }
    
    return categories;
  };

  const toggleEnhancer = (enhancer: string) => {
    setSelectedEnhancers(prev => 
      prev.includes(enhancer)
        ? prev.filter(e => e !== enhancer)
        : [...prev, enhancer]
    );
  };

  const generateImprovedPrompt = () => {
    const enhanced = currentPrompt + ', ' + selectedEnhancers.join(', ');
    setImprovedPrompt(enhanced);
    onPromptImprove(enhanced);
  };

  const applyAutoEnhance = () => {
    if (!analysis) return;
    
    const autoEnhancers: string[] = [];
    
    // Add one from each missing category
    if (analysis.improvements.some(i => i.includes('style'))) {
      autoEnhancers.push(PROMPT_ENHANCERS.style[0]);
    }
    if (analysis.improvements.some(i => i.includes('lighting'))) {
      autoEnhancers.push(PROMPT_ENHANCERS.lighting[0]);
    }
    if (analysis.improvements.some(i => i.includes('quality'))) {
      autoEnhancers.push(PROMPT_ENHANCERS.quality[0]);
    }
    
    setSelectedEnhancers(autoEnhancers);
    const enhanced = currentPrompt + ', ' + autoEnhancers.join(', ');
    setImprovedPrompt(enhanced);
    onPromptImprove(enhanced);
  };

  if (!currentPrompt || currentPrompt.length < 3) {
    return (
      <div className="ai-prompt-architect inactive">
        <div className="apa-header">
          <h3>🧠 AI Prompt Architect</h3>
          <p>Start typing a prompt to get AI-powered suggestions!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-prompt-architect">
      <div className="apa-header">
        <h3>🧠 AI Prompt Architect</h3>
        <p>Optimize your prompts for better AI generation results</p>
      </div>

      {isAnalyzing ? (
        <div className="analyzing">
          <div className="loading-spinner"></div>
          <p>Analyzing your prompt...</p>
        </div>
      ) : analysis && (
        <div className="analysis-results">
          <div className="score-section">
            <div className="score-circle">
              <div className="score-value">{analysis.score}</div>
              <div className="score-label">Score</div>
            </div>
            <div className="score-details">
              <div className="complexity">
                <span className="label">Complexity:</span>
                <span className={`complexity-badge ${analysis.complexity.toLowerCase()}`}>
                  {analysis.complexity}
                </span>
              </div>
              {analysis.categories.length > 0 && (
                <div className="categories">
                  <span className="label">Categories:</span>
                  {analysis.categories.map(cat => (
                    <span key={cat} className="category-tag">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="analysis-sections">
            {analysis.strengths.length > 0 && (
              <div className="analysis-section strengths">
                <h4>✅ Strengths</h4>
                <ul>
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvements.length > 0 && (
              <div className="analysis-section improvements">
                <h4>💡 Suggested Improvements</h4>
                <ul>
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="enhancers-section">
            <h4>🚀 Available Enhancers</h4>
            <div className="enhancer-categories">
              {Object.entries(PROMPT_ENHANCERS).map(([category, enhancers]) => (
                <div key={category} className="enhancer-category">
                  <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                  <div className="enhancer-tags">
                    {enhancers.map(enhancer => (
                      <button
                        key={enhancer}
                        className={`enhancer-tag ${selectedEnhancers.includes(enhancer) ? 'selected' : ''}`}
                        onClick={() => toggleEnhancer(enhancer)}
                      >
                        {enhancer}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="apa-controls">
            <button className="btn-auto-enhance" onClick={applyAutoEnhance}>
              Auto-Enhance
            </button>
            <button 
              className="btn-apply"
              onClick={generateImprovedPrompt}
              disabled={selectedEnhancers.length === 0}
            >
              Apply {selectedEnhancers.length} Enhancers
            </button>
          </div>

          {improvedPrompt && (
            <div className="improved-prompt">
              <h4>✨ Improved Prompt</h4>
              <div className="prompt-preview">
                {improvedPrompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPromptArchitect;