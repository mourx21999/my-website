import React, { useState, useEffect } from 'react';
import './ImageStoryGenerator.css';

interface ImageStoryGeneratorProps {
  images: string[];
  onStoryGenerate: (story: StoryData) => void;
}

interface StoryData {
  title: string;
  chapters: Chapter[];
  genre: string;
  mood: string;
  characters: Character[];
  timeline: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  image: string;
  prompt: string;
  order: number;
}

interface Character {
  name: string;
  description: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'narrator';
}

const STORY_GENRES = [
  'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Adventure', 
  'Horror', 'Comedy', 'Drama', 'Thriller', 'Historical'
];

const STORY_MOODS = [
  'Epic', 'Mysterious', 'Romantic', 'Dark', 'Whimsical', 
  'Intense', 'Peaceful', 'Chaotic', 'Melancholic', 'Uplifting'
];

const STORY_TEMPLATES = {
  'Hero\'s Journey': [
    'The Ordinary World', 'The Call to Adventure', 'Meeting the Mentor',
    'Crossing the Threshold', 'Tests and Trials', 'The Ordeal', 
    'The Reward', 'The Road Back', 'The Return'
  ],
  'Three-Act Structure': [
    'Setup', 'Confrontation', 'Resolution'
  ],
  'Mystery Arc': [
    'The Crime', 'Investigation Begins', 'False Leads', 
    'The Truth Revealed', 'Justice Served'
  ],
  'Romance Arc': [
    'Meeting', 'Attraction', 'Obstacles', 'Crisis', 'Happy Ending'
  ],
  'Custom': []
};

const ImageStoryGenerator: React.FC<ImageStoryGeneratorProps> = ({ 
  images, 
  onStoryGenerate 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [storyTemplate, setStoryTemplate] = useState<string>('Hero\'s Journey');
  const [selectedGenre, setSelectedGenre] = useState<string>('Fantasy');
  const [selectedMood, setSelectedMood] = useState<string>('Epic');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<{ name: string; description: string; role: Character['role'] }>({
    name: '', description: '', role: 'protagonist'
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; status: string }>({ current: 0, total: 0, status: '' });
  const [generatedStory, setGeneratedStory] = useState<StoryData | null>(null);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImages(images.slice(0, Math.min(9, images.length)));
    }
  }, [images]);

  const toggleImageSelection = (image: string) => {
    setSelectedImages(prev => 
      prev.includes(image) 
        ? prev.filter(img => img !== image)
        : prev.length < 9 ? [...prev, image] : prev
    );
  };

  const addCharacter = () => {
    if (!newCharacter.name.trim()) return;
    
    const character: Character = {
      name: newCharacter.name,
      description: newCharacter.description || `A ${newCharacter.role} in the story`,
      role: newCharacter.role
    };
    
    setCharacters(prev => [...prev, character]);
    setNewCharacter({ name: '', description: '', role: 'protagonist' });
  };

  const removeCharacter = (index: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== index));
  };

  const generateStoryPrompts = () => {
    const template = STORY_TEMPLATES[storyTemplate as keyof typeof STORY_TEMPLATES];
    const prompts: string[] = [];
    
    selectedImages.forEach((image, index) => {
      const chapterTitle = template[index] || `Chapter ${index + 1}`;
      const characterNames = characters.map(c => c.name).join(', ');
      const characterContext = characters.length > 0 ? ` featuring ${characterNames}` : '';
      
      const prompt = `${selectedGenre} ${selectedMood.toLowerCase()} scene for "${chapterTitle}"${characterContext}, based on this image, create a detailed narrative moment`;
      prompts.push(prompt);
    });
    
    setStoryPrompts(prompts);
  };

  const generateStory = async () => {
    console.log('🚀 generateStory called with:', { 
      selectedImagesCount: selectedImages.length, 
      selectedImages: selectedImages.slice(0, 2),
      genre: selectedGenre,
      mood: selectedMood,
      characters: characters.length
    });
    
    if (selectedImages.length === 0) {
      console.error('❌ No images selected for story generation');
      alert('Please select at least one image to generate a story!');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedImages.length + 1, status: 'Starting story generation...' });
    
    try {
      const template = STORY_TEMPLATES[storyTemplate as keyof typeof STORY_TEMPLATES];
      const chapters: Chapter[] = [];
      
      // Generate each chapter using AI
      for (let index = 0; index < selectedImages.length; index++) {
        setGenerationProgress({ 
          current: index, 
          total: selectedImages.length + 1, 
          status: `Generating chapter ${index + 1}: "${template[index] || `Chapter ${index + 1}`}"...` 
        });
        const image = selectedImages[index];
        const chapterTitle = template[index] || `Chapter ${index + 1}`;
        
        // Create AI prompt for this chapter
        const characterContext = characters.length > 0 
          ? `Main characters: ${characters.map(c => `${c.name} (${c.role}): ${c.description}`).join(', ')}` 
          : '';
        
        const storyContext = index > 0 
          ? `Previous chapters: ${chapters.map(c => c.title + ': ' + c.content.substring(0, 100) + '...').join(' | ')}` 
          : '';
        
        const aiPrompt = `Write a ${selectedGenre.toLowerCase()} story chapter with a ${selectedMood.toLowerCase()} mood.
Title: "${chapterTitle}"
Story template: ${storyTemplate}
Chapter ${index + 1} of ${selectedImages.length}
${characterContext}
${storyContext}
${customTitle ? `Custom story element: ${customTitle}` : ''}

Based on the image provided, write a detailed narrative chapter (200-400 words) that:
1. Matches the ${selectedGenre} genre and ${selectedMood} mood
2. Continues the story from previous chapters
3. Incorporates the visual elements from the image
4. Develops the characters and plot
5. Uses vivid, engaging storytelling

Write only the chapter content, no extra formatting or titles.`;

        try {
          console.log(`📡 Calling API for chapter ${index + 1}:`, {
            url: 'http://localhost:5001/generate-story-chapter',
            image,
            genre: selectedGenre,
            mood: selectedMood
          });
          
          // Call your AI API - replace with your actual endpoint
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/generate-story-chapter`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: aiPrompt,
              image_url: image,
              chapter_index: index,
              genre: selectedGenre,
              mood: selectedMood,
              characters: characters,
              max_tokens: 500
            })
          });

          console.log(`📥 API Response for chapter ${index + 1}:`, {
            status: response.status,
            ok: response.ok
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error for chapter ${index + 1}:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`Chapter generation failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log(`✅ API Success for chapter ${index + 1}:`, {
            hasStoryText: !!data.story_text,
            dataKeys: Object.keys(data)
          });
          
          const content = data.story_text || generateChapterContent(chapterTitle, image, index);

          chapters.push({
            id: `chapter-${index}`,
            title: chapterTitle,
            content,
            image,
            prompt: storyPrompts[index] || aiPrompt,
            order: index + 1
          });

        } catch (chapterError) {
          console.warn(`Failed to generate AI chapter ${index + 1}, using fallback:`, chapterError);
          // Fallback to template-based generation
          chapters.push({
            id: `chapter-${index}`,
            title: chapterTitle,
            content: generateChapterContent(chapterTitle, image, index),
            image,
            prompt: storyPrompts[index] || '',
            order: index + 1
          });
        }
      }

      // Generate AI title if not provided
      setGenerationProgress({ 
        current: selectedImages.length, 
        total: selectedImages.length + 1, 
        status: 'Generating story title...' 
      });
      
      let finalTitle = customTitle;
      if (!finalTitle) {
        try {
          const titlePrompt = `Create a compelling ${selectedGenre} title for a ${selectedMood.toLowerCase()} story about: ${chapters.map(c => c.title).join(', ')}. Characters: ${characters.map(c => c.name).join(', ')}. Return only the title, no quotes or extra text.`;
          
          const titleResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/generate-story-title`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: titlePrompt,
              genre: selectedGenre,
              mood: selectedMood
            })
          });

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            finalTitle = titleData.title || generateStoryTitle();
          } else {
            finalTitle = generateStoryTitle();
          }
        } catch (titleError) {
          console.warn('Failed to generate AI title, using fallback:', titleError);
          finalTitle = generateStoryTitle();
        }
      }
      
      const story: StoryData = {
        title: finalTitle,
        chapters,
        genre: selectedGenre,
        mood: selectedMood,
        characters,
        timeline: `A ${chapters.length}-chapter ${selectedGenre.toLowerCase()} ${selectedMood.toLowerCase()} tale`
      };
      
      setGeneratedStory(story);
      onStoryGenerate(story);
      
    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Story generation failed. Please try again or check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStoryTitle = (): string => {
    const titlePrefixes = {
      Fantasy: ['The Chronicles of', 'Legends of', 'The Quest for', 'Tales of'],
      'Sci-Fi': ['Beyond the', 'The Quantum', 'Stellar', 'The Cybernetic'],
      Mystery: ['The Case of', 'The Secret of', 'Mystery of', 'The Enigma of'],
      Romance: ['Love in', 'Hearts of', 'The Romance of', 'Passion in'],
      Adventure: ['Journey to', 'The Adventures of', 'Quest for', 'Expedition to']
    };
    
    const prefix = titlePrefixes[selectedGenre as keyof typeof titlePrefixes]?.[0] || 'The Story of';
    const suffix = characters[0]?.name || 'Unknown Realms';
    
    return `${prefix} ${suffix}`;
  };

  const generateChapterContent = (title: string, imageUrl: string, index: number): string => {
    const characterNames = characters.map(c => c.name);
    const protagonist = characters.find(c => c.role === 'protagonist')?.name || 'the hero';
    
    const contentTemplates = [
      `In this ${selectedMood.toLowerCase()} moment, ${protagonist} stands at a crossroads. The ${selectedGenre.toLowerCase()} world around them pulses with untold possibilities. As ${title.toLowerCase()} unfolds, ancient secrets begin to surface, and the true nature of their quest becomes clear.`,
      
      `The ${selectedMood.toLowerCase()} atmosphere thickens as ${protagonist} delves deeper into the mystery. Every shadow seems to whisper secrets of the past, and every step forward brings new challenges. In this pivotal chapter, alliances are tested and true intentions are revealed.`,
      
      `As the story reaches its crescendo, ${protagonist} must face their greatest fear. The ${selectedGenre.toLowerCase()} elements that have been building throughout the tale now converge in a moment of truth. This is where heroes are made and legends are born.`,
      
      `In the aftermath of great trials, ${protagonist} reflects on the journey that has transformed them. The ${selectedMood.toLowerCase()} tone of this chapter speaks to the profound changes that adventure brings to the soul. New horizons beckon, promising future tales.`
    ];
    
    return contentTemplates[Math.min(index, contentTemplates.length - 1)];
  };

  const testConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/health`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
        alert('✅ Backend connection successful! Server is ready for story generation.');
      } else {
        console.error('❌ Backend returned error:', response.status);
        alert(`❌ Backend error: ${response.status}. Make sure the story server is running.`);
      }
    } catch (error) {
      console.error('❌ Cannot connect to backend:', error);
      alert('❌ Cannot connect to backend. Please start the story server with: ./start_story_server.sh');
    }
  };

  const exportStory = () => {
    if (!generatedStory) return;
    
    const storyText = `
# ${generatedStory.title}

**Genre:** ${generatedStory.genre}  
**Mood:** ${generatedStory.mood}  
**Timeline:** ${generatedStory.timeline}

## Characters
${generatedStory.characters.map(char => 
  `- **${char.name}** (${char.role}): ${char.description}`
).join('\n')}

## Story
${generatedStory.chapters.map(chapter => 
  `### ${chapter.title}\n\n${chapter.content}\n\n---\n`
).join('\n')}

*Generated with AI Story Generator*
    `.trim();
    
    const blob = new Blob([storyText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="image-story-generator">
      <div className="isg-header">
        <h3>📚 AI Story Generator</h3>
        <p>Transform your images into captivating narratives</p>
      </div>

      {!generatedStory ? (
        <div className="story-builder">
          {/* Image Selection */}
          <div className="image-selection-section">
            <h4>🖼️ Select Images for Your Story</h4>
            <p className="selection-hint">Choose up to 9 images to build your narrative (selected: {selectedImages.length})</p>
            <div className="image-grid">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`story-image ${selectedImages.includes(image) ? 'selected' : ''}`}
                  onClick={() => toggleImageSelection(image)}
                >
                  <img src={image} alt={`Story image ${index + 1}`} />
                  <div className="selection-overlay">
                    {selectedImages.includes(image) && (
                      <div className="selection-number">
                        {selectedImages.indexOf(image) + 1}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story Configuration */}
          <div className="story-config">
            <div className="config-section">
              <h4>⚙️ Story Settings</h4>
              <div className="config-grid">
                <div className="config-item">
                  <label>Story Template</label>
                  <select
                    value={storyTemplate}
                    onChange={(e) => setStoryTemplate(e.target.value)}
                    className="config-select"
                  >
                    {Object.keys(STORY_TEMPLATES).map(template => (
                      <option key={template} value={template}>{template}</option>
                    ))}
                  </select>
                </div>
                
                <div className="config-item">
                  <label>Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="config-select"
                  >
                    {STORY_GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="config-item">
                  <label>Mood</label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="config-select"
                  >
                    {STORY_MOODS.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>
                
                <div className="config-item full-width">
                  <label>Custom Title (optional)</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave empty for auto-generated title"
                    className="config-input"
                  />
                </div>
              </div>
            </div>

            {/* Character Builder */}
            <div className="character-section">
              <h4>👥 Story Characters</h4>
              <div className="character-builder">
                <div className="character-form">
                  <input
                    type="text"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Character name"
                    className="character-input"
                  />
                  <input
                    type="text"
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Character description"
                    className="character-input"
                  />
                  <select
                    value={newCharacter.role}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, role: e.target.value as Character['role'] }))}
                    className="character-select"
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                    <option value="narrator">Narrator</option>
                  </select>
                  <button className="btn-add-character" onClick={addCharacter}>
                    ➕ Add
                  </button>
                </div>
                
                {characters.length > 0 && (
                  <div className="characters-list">
                    {characters.map((character, index) => (
                      <div key={index} className="character-item">
                        <div className="character-info">
                          <span className="character-name">{character.name}</span>
                          <span className={`character-role ${character.role}`}>
                            {character.role}
                          </span>
                          <span className="character-desc">{character.description}</span>
                        </div>
                        <button 
                          className="btn-remove-character"
                          onClick={() => removeCharacter(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Story Generation */}
          <div className="generation-section">
            <div className="generation-preview">
              <h4>📝 Story Preview</h4>
              <div className="story-preview">
                <div className="preview-title">
                  {customTitle || generateStoryTitle()}
                </div>
                <div className="preview-details">
                  <span className="preview-genre">{selectedGenre}</span>
                  <span className="preview-mood">{selectedMood}</span>
                  <span className="preview-chapters">{selectedImages.length} Chapters</span>
                </div>
                {characters.length > 0 && (
                  <div className="preview-characters">
                    Featuring: {characters.map(c => c.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="generation-actions">
              <button
                className="btn-test-connection"
                onClick={testConnection}
              >
                🔍 Test Backend
              </button>
              <button
                className="btn-generate-prompts"
                onClick={generateStoryPrompts}
                disabled={selectedImages.length === 0}
              >
                🎯 Generate Story Prompts
              </button>
              <button
                className="btn-generate-story"
                onClick={generateStory}
                disabled={selectedImages.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <div className="generation-progress">
                    <span>✨ {generationProgress.status}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {generationProgress.current}/{generationProgress.total}
                    </span>
                  </div>
                ) : (
                  '📖 Generate Complete Story'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="generated-story">
          <div className="story-header">
            <h2 className="story-title">{generatedStory.title}</h2>
            <div className="story-meta">
              <span className="story-genre">{generatedStory.genre}</span>
              <span className="story-mood">{generatedStory.mood}</span>
              <span className="story-timeline">{generatedStory.timeline}</span>
            </div>
            {generatedStory.characters.length > 0 && (
              <div className="story-characters">
                <h4>Characters:</h4>
                <div className="characters-display">
                  {generatedStory.characters.map((character, index) => (
                    <div key={index} className="character-badge">
                      <span className="char-name">{character.name}</span>
                      <span className={`char-role ${character.role}`}>
                        {character.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="story-chapters">
            {generatedStory.chapters.map((chapter, index) => (
              <div key={chapter.id} className="story-chapter">
                <div className="chapter-header">
                  <h3 className="chapter-title">
                    <span className="chapter-number">{chapter.order}.</span>
                    {chapter.title}
                  </h3>
                </div>
                <div className="chapter-content">
                  <div className="chapter-image">
                    <img src={chapter.image} alt={chapter.title} />
                  </div>
                  <div className="chapter-text">
                    <p>{chapter.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="story-actions">
            <button className="btn-export" onClick={exportStory}>
              📥 Export Story
            </button>
            <button 
              className="btn-new-story"
              onClick={() => setGeneratedStory(null)}
            >
              ✨ Create New Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStoryGenerator;