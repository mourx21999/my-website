import React, { useState, useEffect } from 'react';
import './SmartPromptAssistant.css';

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

interface SmartPromptAssistantProps {
  userProfile: UserProfile | null;
  currentPrompt: string;
  onPromptSuggestion: (suggestion: string) => void;
  onStyleSuggestion: (styles: string[]) => void;
}

interface PromptSuggestion {
  text: string;
  reason: string;
  confidence: number;
  category: 'style' | 'detail' | 'mood' | 'technical';
}

const SmartPromptAssistant: React.FC<SmartPromptAssistantProps> = ({
  userProfile,
  currentPrompt,
  onPromptSuggestion,
  onStyleSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [dailyInspiration, setDailyInspiration] = useState<string>('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Prompt templates based on user preferences
  const promptTemplates = {
    explorer: [
      'mysterious {theme} with hidden details and unexpected elements',
      'futuristic interpretation of {theme} with experimental techniques',
      'surreal {theme} that challenges conventional perception'
    ],
    artist: [
      'masterpiece {theme} in the style of {style}, with perfect composition',
      'artistic study of {theme} showcasing advanced {style} techniques',
      'gallery-worthy {theme} with sophisticated {style} execution'
    ],
    dreamer: [
      'magical {theme} floating in a dreamlike atmosphere',
      'whimsical {theme} with fairy-tale elements and soft lighting',
      'enchanted {theme} surrounded by mystical energy and wonder'
    ],
    realist: [
      'photorealistic {theme} with accurate lighting and details',
      'documentary-style {theme} capturing authentic moment',
      'high-resolution {theme} with natural textures and shadows'
    ]
  };

  const styleEnhancers = {
    'Photorealistic': ['ultra-realistic', 'high-resolution', 'professional photography', 'perfect lighting'],
    'Digital Art': ['digital painting', 'concept art', 'modern illustration', 'vibrant colors'],
    'Oil Painting': ['classical oil painting', 'brushwork visible', 'rich textures', 'traditional technique'],
    'Watercolor': ['watercolor technique', 'flowing paint', 'soft edges', 'translucent layers'],
    'Anime/Manga': ['anime style', 'manga art', 'cel-shading', 'vibrant character design'],
    'Abstract': ['abstract composition', 'geometric forms', 'color harmony', 'non-representational'],
    'Minimalist': ['clean design', 'simple composition', 'negative space', 'essential elements only'],
    'Vintage': ['retro aesthetic', 'aged appearance', 'nostalgic mood', 'period-appropriate'],
    'Sci-Fi': ['futuristic elements', 'advanced technology', 'space-age design', 'cyberpunk aesthetic'],
    'Fantasy': ['magical elements', 'mythical creatures', 'enchanted atmosphere', 'otherworldly'],
    'Portrait': ['human subject', 'facial expression', 'personality capture', 'emotional depth'],
    'Landscape': ['natural scenery', 'wide composition', 'atmospheric perspective', 'environmental mood']
  };

  const moodKeywords = {
    explorer: ['mysterious', 'unknown', 'discovery', 'adventure', 'hidden', 'secret'],
    artist: ['masterpiece', 'technique', 'composition', 'artistic', 'skillful', 'refined'],
    dreamer: ['magical', 'dreamy', 'ethereal', 'whimsical', 'fantastical', 'surreal'],
    realist: ['realistic', 'authentic', 'natural', 'accurate', 'documentary', 'lifelike']
  };

  useEffect(() => {
    if (userProfile?.settings.dailyInspiration) {
      generateDailyInspiration();
    }
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentPrompt && userProfile?.settings.autoSuggest) {
      analyzePrompt();
    }
  }, [currentPrompt, userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateDailyInspiration = () => {
    if (!userProfile) return;

    const themes = userProfile.preferredThemes;
    const styles = userProfile.favoriteStyles;
    const mood = userProfile.creativeMood;

    if (themes.length === 0 || styles.length === 0) return;

    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const templates = promptTemplates[mood];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    const inspiration = randomTemplate
      .replace('{theme}', randomTheme.toLowerCase())
      .replace('{style}', randomStyle.toLowerCase());

    setDailyInspiration(inspiration);
  };

  const analyzePrompt = async () => {
    if (!userProfile || !currentPrompt.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSuggestions: PromptSuggestion[] = [];
    const prompt = currentPrompt.toLowerCase();

    // Style suggestions based on user preferences
    const missingStyles = userProfile.favoriteStyles.filter(style => 
      !prompt.includes(style.toLowerCase()) && 
      !styleEnhancers[style as keyof typeof styleEnhancers]?.some(enhancer => 
        prompt.includes(enhancer.toLowerCase())
      )
    );

    if (missingStyles.length > 0 && userProfile.settings.styleRemember) {
      const suggestedStyle = missingStyles[0];
      const enhancers = styleEnhancers[suggestedStyle as keyof typeof styleEnhancers] || [];
      const enhancer = enhancers[Math.floor(Math.random() * enhancers.length)];
      
      newSuggestions.push({
        text: `${currentPrompt}, ${enhancer}`,
        reason: `Added your favorite ${suggestedStyle} style`,
        confidence: 0.9,
        category: 'style'
      });
    }

    // Mood enhancement based on creative mood
    const moodWords = moodKeywords[userProfile.creativeMood];
    const hasMoodKeyword = moodWords.some(word => prompt.includes(word));
    
    if (!hasMoodKeyword) {
      const randomMoodWord = moodWords[Math.floor(Math.random() * moodWords.length)];
      newSuggestions.push({
        text: `${randomMoodWord} ${currentPrompt}`,
        reason: `Enhanced for your ${userProfile.creativeMood} style`,
        confidence: 0.8,
        category: 'mood'
      });
    }

    // Detail suggestions based on prompt length
    if (currentPrompt.trim().split(' ').length < 5) {
      const detailSuggestions = [
        'with perfect lighting and composition',
        'highly detailed and intricate',
        'with rich textures and depth',
        'atmospheric and moody',
        'with dramatic shadows and highlights'
      ];
      
      const randomDetail = detailSuggestions[Math.floor(Math.random() * detailSuggestions.length)];
      newSuggestions.push({
        text: `${currentPrompt}, ${randomDetail}`,
        reason: 'Added detail for better results',
        confidence: 0.7,
        category: 'detail'
      });
    }

    // Technical improvements
    if (!prompt.includes('4k') && !prompt.includes('high resolution') && !prompt.includes('hd')) {
      newSuggestions.push({
        text: `${currentPrompt}, 4K resolution, high quality`,
        reason: 'Enhanced for maximum quality',
        confidence: 0.6,
        category: 'technical'
      });
    }

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
  };

  const applySuggestion = (suggestion: PromptSuggestion) => {
    onPromptSuggestion(suggestion.text);
    
    // Update user history
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        promptHistory: [...userProfile.promptHistory, suggestion.text].slice(-20) // Keep last 20
      };
      localStorage.setItem('createYourMindProfile', JSON.stringify(updatedProfile));
    }
  };

  const getGreeting = () => {
    if (!userProfile?.name) return 'Hey creator!';
    
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Good morning', 'Rise and create', 'Morning inspiration'],
      afternoon: ['Good afternoon', 'Keep creating', 'Afternoon artistry'],
      evening: ['Good evening', 'Evening magic', 'Sunset creativity']
    };
    
    let timeGreetings;
    if (hour < 12) timeGreetings = greetings.morning;
    else if (hour < 18) timeGreetings = greetings.afternoon;
    else timeGreetings = greetings.evening;
    
    const randomGreeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    return `${randomGreeting}, ${userProfile.name}!`;
  };

  if (!userProfile || !userProfile.settings.autoSuggest) {
    return null;
  }

  return (
    <div className="smart-prompt-assistant">
      <button 
        className="assistant-toggle"
        onClick={() => setShowAssistant(!showAssistant)}
      >
        {userProfile.avatar}
        <span className="assistant-name">AI Assistant</span>
        {suggestions.length > 0 && <span className="suggestion-count">{suggestions.length}</span>}
      </button>

      {showAssistant && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <div className="greeting">{getGreeting()}</div>
            <button className="close-assistant" onClick={() => setShowAssistant(false)}>×</button>
          </div>

          {dailyInspiration && (
            <div className="daily-inspiration">
              <h4>🌟 Today's Inspiration</h4>
              <div className="inspiration-text">{dailyInspiration}</div>
              <button 
                className="use-inspiration"
                onClick={() => onPromptSuggestion(dailyInspiration)}
              >
                Use This Idea
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="analyzing">
              <div className="analyzing-animation">🧠</div>
              <span>Analyzing your prompt...</span>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <h4>💡 Smart Suggestions</h4>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-content">
                      <div className="suggestion-text">{suggestion.text}</div>
                      <div className="suggestion-reason">
                        <span className={`category-tag ${suggestion.category}`}>
                          {suggestion.category}
                        </span>
                        {suggestion.reason}
                      </div>
                    </div>
                    <div className="suggestion-actions">
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        />
                      </div>
                      <button 
                        className="apply-suggestion"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userProfile.promptHistory.length > 0 && (
            <div className="history-section">
              <h4>📚 Recent Prompts</h4>
              <div className="history-list">
                {userProfile.promptHistory.slice(-3).reverse().map((prompt, index) => (
                  <button
                    key={index}
                    className="history-item"
                    onClick={() => onPromptSuggestion(prompt)}
                  >
                    {prompt.length > 60 ? `${prompt.substring(0, 60)}...` : prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartPromptAssistant; 