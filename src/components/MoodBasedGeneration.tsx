import React, { useState, useEffect } from 'react';
import './MoodBasedGeneration.css';

interface MoodBasedGenerationProps {
  onMoodGenerate: (prompt: string, mood: MoodProfile) => void;
}

interface MoodProfile {
  name: string;
  emoji: string;
  description: string;
  colorPalette: string[];
  keywords: string[];
  styles: string[];
  lighting: string[];
  atmosphere: string[];
  subjects: string[];
}

interface EmotionalState {
  energy: number; // 0-100 (calm to energetic)
  valence: number; // 0-100 (negative to positive)
  complexity: number; // 0-100 (simple to complex)
  abstractness: number; // 0-100 (realistic to abstract)
}

const MOOD_PROFILES: MoodProfile[] = [
  {
    name: 'Serene',
    emoji: '🧘',
    description: 'Peaceful, calm, and meditative atmospheres',
    colorPalette: ['#E8F5E8', '#B8E6B8', '#87CEEB', '#F0F8FF'],
    keywords: ['peaceful', 'tranquil', 'serene', 'calm', 'meditative'],
    styles: ['minimalist', 'zen', 'soft impressionism', 'watercolor'],
    lighting: ['soft morning light', 'gentle ambient glow', 'filtered sunbeams'],
    atmosphere: ['misty', 'ethereal', 'harmonious', 'balanced'],
    subjects: ['nature scenes', 'meditation spaces', 'quiet landscapes']
  },
  {
    name: 'Energetic',
    emoji: '⚡',
    description: 'Dynamic, vibrant, and high-energy visuals',
    colorPalette: ['#FF6B35', '#F7931E', '#FFE135', '#FF1744'],
    keywords: ['dynamic', 'vibrant', 'energetic', 'explosive', 'intense'],
    styles: ['pop art', 'abstract expressionism', 'street art', 'neon aesthetic'],
    lighting: ['neon lights', 'dramatic spotlights', 'electric glow'],
    atmosphere: ['electric', 'pulsating', 'kinetic', 'explosive'],
    subjects: ['urban scenes', 'action shots', 'festival atmospheres']
  },
  {
    name: 'Mysterious',
    emoji: '🌙',
    description: 'Enigmatic, dark, and intriguing atmospheres',
    colorPalette: ['#2C3E50', '#34495E', '#8E44AD', '#2F1B69'],
    keywords: ['mysterious', 'enigmatic', 'shadowy', 'cryptic', 'hidden'],
    styles: ['noir', 'gothic', 'surrealism', 'dark fantasy'],
    lighting: ['moonlight', 'candlelight', 'shadow play', 'dim atmospheric'],
    atmosphere: ['foggy', 'mystical', 'haunting', 'otherworldly'],
    subjects: ['ancient ruins', 'forest paths', 'shadowy figures']
  },
  {
    name: 'Romantic',
    emoji: '💖',
    description: 'Loving, warm, and emotionally rich scenes',
    colorPalette: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#DC143C'],
    keywords: ['romantic', 'passionate', 'loving', 'tender', 'intimate'],
    styles: ['romantic realism', 'impressionism', 'soft focus', 'dreamy'],
    lighting: ['golden hour', 'candlelit', 'warm sunset glow'],
    atmosphere: ['dreamy', 'intimate', 'enchanting', 'heartwarming'],
    subjects: ['couples', 'flower gardens', 'cozy interiors']
  },
  {
    name: 'Melancholic',
    emoji: '🌧️',
    description: 'Contemplative, nostalgic, and bittersweet moods',
    colorPalette: ['#708090', '#4682B4', '#6495ED', '#B0C4DE'],
    keywords: ['melancholic', 'nostalgic', 'contemplative', 'wistful', 'bittersweet'],
    styles: ['realism', 'impressionism', 'muted tones', 'vintage'],
    lighting: ['overcast', 'soft grey light', 'rainy day ambiance'],
    atmosphere: ['reflective', 'somber', 'nostalgic', 'pensive'],
    subjects: ['old photographs', 'empty spaces', 'autumn scenes']
  },
  {
    name: 'Euphoric',
    emoji: '🌈',
    description: 'Joyful, uplifting, and celebratory atmospheres',
    colorPalette: ['#FF1493', '#00CED1', '#7FFF00', '#FFD700'],
    keywords: ['euphoric', 'joyful', 'celebratory', 'blissful', 'ecstatic'],
    styles: ['pop surrealism', 'psychedelic', 'maximalist', 'fantasy'],
    lighting: ['rainbow light', 'prismatic', 'golden rays', 'sparkles'],
    atmosphere: ['magical', 'uplifting', 'transcendent', 'radiant'],
    subjects: ['celebrations', 'fantastical beings', 'cosmic scenes']
  },
  {
    name: 'Anxious',
    emoji: '😰',
    description: 'Tense, unsettling, and psychologically intense',
    colorPalette: ['#8B0000', '#654321', '#2F4F4F', '#696969'],
    keywords: ['anxious', 'tense', 'unsettling', 'chaotic', 'distorted'],
    styles: ['expressionism', 'abstract', 'distorted reality', 'psychological'],
    lighting: ['harsh fluorescent', 'flickering', 'stark shadows'],
    atmosphere: ['claustrophobic', 'disorienting', 'fractured', 'intense'],
    subjects: ['abstract forms', 'distorted perspectives', 'psychological landscapes']
  },
  {
    name: 'Dreamy',
    emoji: '✨',
    description: 'Surreal, fantastical, and imagination-driven',
    colorPalette: ['#DDA0DD', '#E6E6FA', '#FFE4E1', '#F0E68C'],
    keywords: ['dreamy', 'surreal', 'fantastical', 'whimsical', 'imaginative'],
    styles: ['surrealism', 'fantasy art', 'soft focus', 'ethereal'],
    lighting: ['soft diffused', 'magical glow', 'dreamy haze'],
    atmosphere: ['floating', 'weightless', 'surreal', 'fantastical'],
    subjects: ['floating objects', 'impossible architectures', 'dream sequences']
  }
];

const MoodBasedGeneration: React.FC<MoodBasedGenerationProps> = ({ onMoodGenerate }) => {
  const [selectedMood, setSelectedMood] = useState<MoodProfile | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    energy: 50,
    valence: 50,
    complexity: 50,
    abstractness: 50
  });
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [moodIntensity, setMoodIntensity] = useState<number>(70);

  // Auto-select mood based on emotional state
  useEffect(() => {
    const autoSelectedMood = findMoodFromEmotionalState(emotionalState);
    if (autoSelectedMood && !selectedMood) {
      setSelectedMood(autoSelectedMood);
    }
  }, [emotionalState, selectedMood]);

  const findMoodFromEmotionalState = (state: EmotionalState): MoodProfile => {
    if (state.energy < 30 && state.valence > 60) return MOOD_PROFILES[0]; // Serene
    if (state.energy > 70 && state.valence > 60) return MOOD_PROFILES[1]; // Energetic
    if (state.energy < 50 && state.valence < 40) return MOOD_PROFILES[2]; // Mysterious
    if (state.energy < 60 && state.valence > 70) return MOOD_PROFILES[3]; // Romantic
    if (state.energy < 40 && state.valence < 50) return MOOD_PROFILES[4]; // Melancholic
    if (state.energy > 80 && state.valence > 80) return MOOD_PROFILES[5]; // Euphoric
    if (state.energy > 60 && state.valence < 30) return MOOD_PROFILES[6]; // Anxious
    return MOOD_PROFILES[7]; // Dreamy
  };

  const handleEmotionalSliderChange = (dimension: keyof EmotionalState, value: number) => {
    setEmotionalState(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const generateMoodPrompt = async () => {
    if (!selectedMood) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const intensityMultiplier = moodIntensity / 100;
      const selectedKeywords = selectedMood.keywords.slice(0, Math.ceil(3 * intensityMultiplier));
      const selectedStyles = selectedMood.styles.slice(0, Math.ceil(2 * intensityMultiplier));
      const selectedLighting = selectedMood.lighting.slice(0, Math.ceil(2 * intensityMultiplier));
      const selectedAtmosphere = selectedMood.atmosphere.slice(0, Math.ceil(2 * intensityMultiplier));
      
      let prompt = customPrompt || selectedMood.subjects[Math.floor(Math.random() * selectedMood.subjects.length)];
      
      // Add mood-specific enhancements
      const enhancements = [
        selectedKeywords.join(', '),
        selectedStyles.join(' and '),
        selectedLighting.join(' with '),
        selectedAtmosphere.join(' and ') + ' atmosphere'
      ].filter(Boolean);
      
      // Apply emotional state modifiers
      if (emotionalState.complexity > 70) {
        enhancements.push('intricate details', 'complex composition');
      }
      if (emotionalState.abstractness > 60) {
        enhancements.push('abstract elements', 'stylized interpretation');
      }
      
      const finalPrompt = `${prompt}, ${enhancements.join(', ')}, ${selectedMood.name.toLowerCase()} mood, professional quality`;
      
      setGeneratedPrompt(finalPrompt);
      onMoodGenerate(finalPrompt, selectedMood);
      
    } catch (error) {
      console.error('Mood generation failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodFromSliders = (): MoodProfile => {
    return findMoodFromEmotionalState(emotionalState);
  };

  const getEmotionalDescription = (): string => {
    const { energy, valence, complexity, abstractness } = emotionalState;
    
    let description = "You're feeling ";
    
    if (energy > 70) {
      description += valence > 60 ? "energetic and positive" : "intense and edgy";
    } else if (energy < 30) {
      description += valence > 60 ? "calm and peaceful" : "contemplative and introspective";
    } else {
      description += valence > 60 ? "balanced and content" : "thoughtful and complex";
    }
    
    description += complexity > 70 ? ", seeking rich detail" : ", preferring simplicity";
    description += abstractness > 60 ? " with abstract expression" : " with realistic representation";
    
    return description + ".";
  };

  return (
    <div className="mood-based-generation">
      <div className="mbg-header">
        <h3>🎭 Mood-Based AI Generation</h3>
        <p>Create images that match your emotional state and desired atmosphere</p>
      </div>

      <div className="mood-interface">
        {/* Emotional State Sliders */}
        <div className="emotional-state-section">
          <h4>🧠 Your Emotional State</h4>
          <p className="emotional-description">{getEmotionalDescription()}</p>
          
          <div className="emotion-sliders">
            <div className="emotion-slider">
              <label>
                <span className="slider-icon">⚡</span>
                Energy Level
                <span className="slider-value">{emotionalState.energy}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionalState.energy}
                onChange={(e) => handleEmotionalSliderChange('energy', parseInt(e.target.value))}
                className="emotion-range energy"
              />
              <div className="slider-labels">
                <span>Calm</span>
                <span>Energetic</span>
              </div>
            </div>

            <div className="emotion-slider">
              <label>
                <span className="slider-icon">😊</span>
                Emotional Tone
                <span className="slider-value">{emotionalState.valence}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionalState.valence}
                onChange={(e) => handleEmotionalSliderChange('valence', parseInt(e.target.value))}
                className="emotion-range valence"
              />
              <div className="slider-labels">
                <span>Negative</span>
                <span>Positive</span>
              </div>
            </div>

            <div className="emotion-slider">
              <label>
                <span className="slider-icon">🎨</span>
                Complexity
                <span className="slider-value">{emotionalState.complexity}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionalState.complexity}
                onChange={(e) => handleEmotionalSliderChange('complexity', parseInt(e.target.value))}
                className="emotion-range complexity"
              />
              <div className="slider-labels">
                <span>Simple</span>
                <span>Complex</span>
              </div>
            </div>

            <div className="emotion-slider">
              <label>
                <span className="slider-icon">🌀</span>
                Style
                <span className="slider-value">{emotionalState.abstractness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionalState.abstractness}
                onChange={(e) => handleEmotionalSliderChange('abstractness', parseInt(e.target.value))}
                className="emotion-range abstractness"
              />
              <div className="slider-labels">
                <span>Realistic</span>
                <span>Abstract</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Selection */}
        <div className="mood-selection-section">
          <h4>🎭 Suggested Mood Profile</h4>
          <div className="auto-suggested-mood">
            <div className="suggested-mood-card">
              <div className="mood-emoji">{getMoodFromSliders().emoji}</div>
              <div className="mood-info">
                <h5>{getMoodFromSliders().name}</h5>
                <p>{getMoodFromSliders().description}</p>
              </div>
              <button
                className={`btn-select-mood ${selectedMood?.name === getMoodFromSliders().name ? 'selected' : ''}`}
                onClick={() => setSelectedMood(getMoodFromSliders())}
              >
                {selectedMood?.name === getMoodFromSliders().name ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>

          <div className="mood-grid">
            <h5>Or choose a different mood:</h5>
            <div className="mood-cards">
              {MOOD_PROFILES.map(mood => (
                <div
                  key={mood.name}
                  className={`mood-card ${selectedMood?.name === mood.name ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood)}
                >
                  <div className="mood-card-emoji">{mood.emoji}</div>
                  <div className="mood-card-name">{mood.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Mood Details */}
        {selectedMood && (
          <div className="selected-mood-details">
            <h4>🎨 Mood Profile: {selectedMood.name}</h4>
            
            <div className="mood-details-grid">
              <div className="mood-detail-section">
                <h5>🎨 Color Palette</h5>
                <div className="color-palette">
                  {selectedMood.colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="mood-detail-section">
                <h5>🏷️ Keywords</h5>
                <div className="keyword-tags">
                  {selectedMood.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mood-detail-section">
                <h5>🎭 Artistic Styles</h5>
                <div className="style-tags">
                  {selectedMood.styles.map((style, index) => (
                    <span key={index} className="style-tag">
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mood-detail-section">
                <h5>💡 Lighting</h5>
                <div className="lighting-tags">
                  {selectedMood.lighting.map((lighting, index) => (
                    <span key={index} className="lighting-tag">
                      {lighting}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mood-intensity-section">
              <h5>🎚️ Mood Intensity</h5>
              <div className="intensity-slider">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={moodIntensity}
                  onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
                  className="intensity-range"
                />
                <div className="intensity-labels">
                  <span>Subtle ({moodIntensity}%)</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Prompt Input */}
        <div className="custom-prompt-section">
          <h4>✏️ Custom Subject (Optional)</h4>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe what you want to see, or leave empty for mood-based suggestions..."
            className="custom-prompt-input"
            rows={3}
          />
        </div>

        {/* Generation Controls */}
        <div className="generation-controls">
          <button
            className="btn-generate-mood"
            onClick={generateMoodPrompt}
            disabled={!selectedMood || isAnalyzing}
          >
            {isAnalyzing ? '🧠 Analyzing Your Mood...' : '✨ Generate Mood-Based Prompt'}
          </button>
        </div>

        {/* Generated Prompt Display */}
        {generatedPrompt && (
          <div className="generated-prompt-display">
            <h4>🎯 Generated Mood Prompt</h4>
            <div className="prompt-preview">
              {generatedPrompt}
            </div>
            <div className="prompt-actions">
              <button
                className="btn-use-prompt"
                onClick={() => onMoodGenerate(generatedPrompt, selectedMood!)}
              >
                🚀 Generate Image with This Prompt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodBasedGeneration;