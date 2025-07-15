import React, { useState, useEffect } from 'react';
import './PersonalProfile.css';

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

interface PersonalProfileProps {
  onProfileUpdate: (profile: UserProfile) => void;
  onClose: () => void;
}

const defaultProfile: UserProfile = {
  name: '',
  avatar: '🎨',
  favoriteStyles: [],
  preferredThemes: [],
  creativeMood: 'explorer',
  promptHistory: [],
  favoriteImages: [],
  settings: {
    autoSuggest: true,
    dailyInspiration: true,
    styleRemember: true,
  }
};

const availableAvatars = ['🎨', '🌟', '🦄', '🌈', '💫', '🔮', '🎭', '🌺', '🍃', '⚡', '🌙', '☀️'];

const artStyles = [
  'Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 
  'Anime/Manga', 'Abstract', 'Minimalist', 'Vintage', 
  'Sci-Fi', 'Fantasy', 'Portrait', 'Landscape'
];

const themes = [
  'Nature & Landscapes', 'People & Portraits', 'Animals', 'Architecture',
  'Abstract Concepts', 'Fantasy Worlds', 'Sci-Fi Future', 'Food & Cooking',
  'Fashion & Style', 'Travel & Places', 'Art & Culture', 'Technology'
];

const creativeMoods = [
  { id: 'explorer', name: 'Explorer', desc: 'Love discovering new styles and concepts', emoji: '🔍' },
  { id: 'artist', name: 'Artist', desc: 'Focus on artistic expression and techniques', emoji: '🎨' },
  { id: 'dreamer', name: 'Dreamer', desc: 'Prefer fantasy and imaginative creations', emoji: '✨' },
  { id: 'realist', name: 'Realist', desc: 'Enjoy realistic and practical imagery', emoji: '📸' }
];

const PersonalProfile: React.FC<PersonalProfileProps> = ({ onProfileUpdate, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    // Load existing profile from localStorage
    const savedProfile = localStorage.getItem('createYourMindProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setIsNewUser(false);
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('createYourMindProfile', JSON.stringify(profile));
    onProfileUpdate(profile);
  };

  const handleNameChange = (name: string) => {
    setProfile(prev => ({ ...prev, name }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setProfile(prev => ({ ...prev, avatar }));
  };

  const handleStyleToggle = (style: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteStyles: prev.favoriteStyles.includes(style)
        ? prev.favoriteStyles.filter(s => s !== style)
        : [...prev.favoriteStyles, style]
    }));
  };

  const handleThemeToggle = (theme: string) => {
    setProfile(prev => ({
      ...prev,
      preferredThemes: prev.preferredThemes.includes(theme)
        ? prev.preferredThemes.filter(t => t !== theme)
        : [...prev.preferredThemes, theme]
    }));
  };

  const handleMoodSelect = (mood: 'explorer' | 'artist' | 'dreamer' | 'realist') => {
    setProfile(prev => ({ ...prev, creativeMood: mood }));
  };

  const handleSettingToggle = (setting: keyof UserProfile['settings']) => {
    setProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: !prev.settings[setting]
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      saveProfile();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="profile-step">
            <h3>{isNewUser ? 'Welcome to Create your mind!' : `${getGreeting()}, creator!`}</h3>
            <p>Let's personalize your creative experience</p>
            
            <div className="name-section">
              <label>What should we call you?</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your name..."
                className="name-input"
              />
            </div>

            <div className="avatar-section">
              <label>Choose your creative avatar:</label>
              <div className="avatar-grid">
                {availableAvatars.map(avatar => (
                  <button
                    key={avatar}
                    className={`avatar-option ${profile.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="profile-step">
            <h3>What's your creative mood?</h3>
            <p>This helps us suggest the perfect prompts for you</p>
            
            <div className="mood-grid">
              {creativeMoods.map(mood => (
                <button
                  key={mood.id}
                  className={`mood-option ${profile.creativeMood === mood.id ? 'selected' : ''}`}
                  onClick={() => handleMoodSelect(mood.id as any)}
                >
                  <div className="mood-emoji">{mood.emoji}</div>
                  <div className="mood-name">{mood.name}</div>
                  <div className="mood-desc">{mood.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="profile-step">
            <h3>What art styles inspire you?</h3>
            <p>Select your favorites (you can always change these later)</p>
            
            <div className="style-grid">
              {artStyles.map(style => (
                <button
                  key={style}
                  className={`style-option ${profile.favoriteStyles.includes(style) ? 'selected' : ''}`}
                  onClick={() => handleStyleToggle(style)}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="themes-section">
              <h4>Favorite themes to create:</h4>
              <div className="theme-grid">
                {themes.map(theme => (
                  <button
                    key={theme}
                    className={`theme-option ${profile.preferredThemes.includes(theme) ? 'selected' : ''}`}
                    onClick={() => handleThemeToggle(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="profile-step">
            <h3>Personalization settings</h3>
            <p>Fine-tune your creative experience</p>
            
            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Smart Suggestions</h4>
                  <p>Get AI-powered prompt improvements based on your style</p>
                </div>
                <button
                  className={`toggle ${profile.settings.autoSuggest ? 'on' : 'off'}`}
                  onClick={() => handleSettingToggle('autoSuggest')}
                >
                  {profile.settings.autoSuggest ? '✅' : '⚪'}
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Daily Inspiration</h4>
                  <p>Receive personalized creative challenges and prompts</p>
                </div>
                <button
                  className={`toggle ${profile.settings.dailyInspiration ? 'on' : 'off'}`}
                  onClick={() => handleSettingToggle('dailyInspiration')}
                >
                  {profile.settings.dailyInspiration ? '✅' : '⚪'}
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Remember Styles</h4>
                  <p>Automatically apply your favorite styles to new prompts</p>
                </div>
                <button
                  className={`toggle ${profile.settings.styleRemember ? 'on' : 'off'}`}
                  onClick={() => handleSettingToggle('styleRemember')}
                >
                  {profile.settings.styleRemember ? '✅' : '⚪'}
                </button>
              </div>
            </div>

            <div className="profile-summary">
              <h4>Your Creative Profile:</h4>
              <div className="summary-card">
                <div className="summary-avatar">{profile.avatar}</div>
                <div className="summary-info">
                  <div className="summary-name">{profile.name || 'Creative Mind'}</div>
                  <div className="summary-mood">
                    {creativeMoods.find(m => m.id === profile.creativeMood)?.name} Creator
                  </div>
                  <div className="summary-styles">
                    {profile.favoriteStyles.length} favorite styles, {profile.preferredThemes.length} themes
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="personal-profile-overlay">
      <div className="personal-profile-modal">
        <div className="profile-header">
          <div className="step-indicator">
            {[0, 1, 2, 3].map(step => (
              <div
                key={step}
                className={`step-dot ${step <= currentStep ? 'active' : ''} ${step === currentStep ? 'current' : ''}`}
              />
            ))}
          </div>
          {!isNewUser && (
            <button className="close-btn" onClick={onClose}>×</button>
          )}
        </div>

        <div className="profile-content">
          {renderStep()}
        </div>

        <div className="profile-actions">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={prevStep}>
              Back
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={nextStep}
            disabled={currentStep === 0 && !profile.name.trim()}
          >
            {currentStep === 3 ? 'Start Creating!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalProfile; 