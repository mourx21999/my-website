import React, { useState } from 'react';
import './TextStoryGenerator.css';

interface TextStoryGeneratorProps {
  onStoryGenerate: (story: GeneratedStory) => void;
}

interface GeneratedStory {
  title: string;
  description: string;
  genre: string;
  mood: string;
  characters: Character[];
  chapters: Chapter[];
  script: string;
  timeline: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
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

const STORY_LENGTHS = [
  { label: 'Short Story', value: 'short', chapters: 3, wordsPerChapter: 200 },
  { label: 'Novella', value: 'medium', chapters: 5, wordsPerChapter: 300 },
  { label: 'Full Story', value: 'long', chapters: 8, wordsPerChapter: 400 }
];

const TextStoryGenerator: React.FC<TextStoryGeneratorProps> = ({ onStoryGenerate }) => {
  const [description, setDescription] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Fantasy');
  const [selectedMood, setSelectedMood] = useState<string>('Epic');
  const [selectedLength, setSelectedLength] = useState<string>('medium');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<{ name: string; description: string; role: Character['role'] }>({
    name: '', description: '', role: 'protagonist'
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; status: string }>({ 
    current: 0, total: 0, status: '' 
  });
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);

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

  const generateStory = async () => {
    if (!description.trim()) {
      alert('Please provide a story description!');
      return;
    }

    console.log('🚀 Generating text-based story from description:', description);
    
    setIsGenerating(true);
    const storyLength = STORY_LENGTHS.find(l => l.value === selectedLength) || STORY_LENGTHS[1];
    setGenerationProgress({ 
      current: 0, 
      total: storyLength.chapters + 2, 
      status: 'Starting story generation...' 
    });

    try {
      const chapters: Chapter[] = [];
      
      // Generate each chapter
      for (let i = 0; i < storyLength.chapters; i++) {
        setGenerationProgress({
          current: i,
          total: storyLength.chapters + 2,
          status: `Generating chapter ${i + 1}: "${getChapterTitle(i, storyLength.chapters)}"...`
        });

        const chapterTitle = getChapterTitle(i, storyLength.chapters);
        const characterContext = characters.length > 0 
          ? `Main characters: ${characters.map(c => `${c.name} (${c.role}): ${c.description}`).join(', ')}` 
          : '';
        
        const previousContext = i > 0 
          ? `Previous chapters: ${chapters.map(c => c.title + ': ' + c.content.substring(0, 100) + '...').join(' | ')}` 
          : '';

        const aiPrompt = `Write a ${selectedGenre.toLowerCase()} story chapter with a ${selectedMood.toLowerCase()} mood.

Story Description: ${description}
Chapter: ${i + 1} of ${storyLength.chapters} - "${chapterTitle}"
Target Length: ${storyLength.wordsPerChapter} words
${characterContext}
${previousContext}
${customTitle ? `Story Title: ${customTitle}` : ''}

Write a compelling chapter that:
1. Matches the ${selectedGenre} genre and ${selectedMood} mood
2. Continues naturally from previous chapters
3. Develops characters and advances the plot
4. Uses vivid, engaging storytelling
5. Is approximately ${storyLength.wordsPerChapter} words

Write only the chapter content, no extra formatting.`;

        try {
          console.log(`📡 Generating chapter ${i + 1}...`);
          
          const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/generate-story-chapter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: aiPrompt,
              chapter_index: i,
              genre: selectedGenre,
              mood: selectedMood,
              characters: characters,
              max_tokens: storyLength.wordsPerChapter * 2
            })
          });

          if (!response.ok) {
            throw new Error(`Chapter generation failed: ${response.status}`);
          }

          const data = await response.json();
          const content = data.story_text || generateFallbackChapter(chapterTitle, i, storyLength.chapters);

          chapters.push({
            id: `chapter-${i}`,
            title: chapterTitle,
            content,
            order: i + 1
          });

        } catch (error) {
          console.warn(`Failed to generate AI chapter ${i + 1}, using fallback:`, error);
          chapters.push({
            id: `chapter-${i}`,
            title: chapterTitle,
            content: generateFallbackChapter(chapterTitle, i, storyLength.chapters),
            order: i + 1
          });
        }
      }

      // Generate title
      setGenerationProgress({
        current: storyLength.chapters,
        total: storyLength.chapters + 2,
        status: 'Generating story title...'
      });

      let finalTitle = customTitle;
      if (!finalTitle) {
        try {
          const titlePrompt = `Create a compelling ${selectedGenre} title for a ${selectedMood.toLowerCase()} story about: ${description}. Characters: ${characters.map(c => c.name).join(', ')}. Return only the title.`;
          
          const titleResponse = await fetch(`${process.env.REACT_APP_API_URL || ''}/generate-story-title`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: titlePrompt,
              genre: selectedGenre,
              mood: selectedMood
            })
          });

          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            finalTitle = titleData.title || generateFallbackTitle();
          } else {
            finalTitle = generateFallbackTitle();
          }
        } catch (error) {
          finalTitle = generateFallbackTitle();
        }
      }

      // Generate script format
      setGenerationProgress({
        current: storyLength.chapters + 1,
        total: storyLength.chapters + 2,
        status: 'Formatting as script...'
      });

      const script = generateScript(finalTitle, chapters, characters);

      const story: GeneratedStory = {
        title: finalTitle,
        description,
        genre: selectedGenre,
        mood: selectedMood,
        characters,
        chapters,
        script,
        timeline: `A ${storyLength.chapters}-chapter ${selectedGenre.toLowerCase()} ${selectedMood.toLowerCase()} story`
      };

      setGeneratedStory(story);
      onStoryGenerate(story);

    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Story generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getChapterTitle = (index: number, totalChapters: number): string => {
    const titles = {
      0: 'The Beginning',
      1: 'Rising Action',
      2: 'Turning Point',
      3: 'Complications',
      4: 'Crisis',
      5: 'Climax',
      6: 'Falling Action',
      7: 'Resolution'
    };
    
    if (totalChapters === 3) {
      return ['Opening', 'Development', 'Conclusion'][index] || `Chapter ${index + 1}`;
    } else if (totalChapters === 5) {
      return ['Opening', 'Rising Action', 'Climax', 'Falling Action', 'Resolution'][index] || `Chapter ${index + 1}`;
    }
    
    return titles[index as keyof typeof titles] || `Chapter ${index + 1}`;
  };

  const generateFallbackChapter = (title: string, index: number, totalChapters: number): string => {
    const protagonist = characters.find(c => c.role === 'protagonist')?.name || 'the protagonist';
    
    const templates = [
      `In this ${selectedMood.toLowerCase()} opening, ${protagonist} begins their journey. ${description} The ${selectedGenre.toLowerCase()} world unfolds with mysterious possibilities ahead.`,
      `The story deepens as ${protagonist} faces new challenges. The ${selectedMood.toLowerCase()} atmosphere builds tension while secrets from the past emerge to complicate everything.`,
      `At the story's turning point, ${protagonist} must make a crucial decision. The ${selectedGenre.toLowerCase()} elements reach their peak as everything hangs in the balance.`,
      `In the resolution, ${protagonist} discovers the truth about their journey. The ${selectedMood.toLowerCase()} conclusion brings clarity and transformation to all involved.`
    ];
    
    const templateIndex = Math.min(index, templates.length - 1);
    return templates[templateIndex];
  };

  const generateFallbackTitle = (): string => {
    const titlePrefixes = {
      Fantasy: ['The Chronicles of', 'Legends of', 'The Quest for'],
      'Sci-Fi': ['Beyond the', 'The Quantum', 'Stellar'],
      Mystery: ['The Case of', 'The Secret of', 'Mystery of'],
      Romance: ['Love in', 'Hearts of', 'The Romance of'],
      Adventure: ['Journey to', 'The Adventures of', 'Quest for']
    };
    
    const prefix = titlePrefixes[selectedGenre as keyof typeof titlePrefixes]?.[0] || 'The Story of';
    const suffix = characters[0]?.name || 'Unknown Realms';
    return `${prefix} ${suffix}`;
  };

  const generateScript = (title: string, chapters: Chapter[], characters: Character[]): string => {
    return `# ${title}

**Genre:** ${selectedGenre}  
**Mood:** ${selectedMood}  
**Description:** ${description}

## Characters
${characters.map(char => 
  `- **${char.name}** (${char.role}): ${char.description}`
).join('\n')}

## Story Script

${chapters.map(chapter => 
  `### ${chapter.title}

${chapter.content}

---
`).join('\n')}

*Generated with AI Story Generator*`;
  };

  const exportStory = () => {
    if (!generatedStory) return;
    
    const blob = new Blob([generatedStory.script], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetGenerator = () => {
    setGeneratedStory(null);
    setDescription('');
    setCustomTitle('');
    setCharacters([]);
  };

  return (
    <div className="text-story-generator">
      <div className="tsg-header">
        <h3>📝 Text Story Generator</h3>
        <p>Create complete stories and scripts from just a description</p>
      </div>

      {!generatedStory ? (
        <div className="story-form">
          <div className="form-section">
            <h4>Story Description</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your story idea... e.g., 'A young wizard discovers they can travel between dimensions and must save multiple worlds from an ancient evil.'"
              className="description-input"
              rows={4}
            />
          </div>

          <div className="form-section">
            <h4>Story Settings</h4>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="setting-select"
                >
                  {STORY_GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div className="setting-item">
                <label>Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="setting-select"
                >
                  {STORY_MOODS.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
              
              <div className="setting-item">
                <label>Length</label>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="setting-select"
                >
                  {STORY_LENGTHS.map(length => (
                    <option key={length.value} value={length.value}>
                      {length.label} ({length.chapters} chapters)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="setting-item full-width">
                <label>Custom Title (optional)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Leave empty for auto-generated title"
                  className="setting-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Characters (optional)</h4>
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

          <div className="generation-section">
            <button
              className="btn-generate-story"
              onClick={generateStory}
              disabled={!description.trim() || isGenerating}
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
      ) : (
        <div className="generated-story">
          <div className="story-header">
            <h2 className="story-title">{generatedStory.title}</h2>
            <div className="story-meta">
              <span className="story-genre">{generatedStory.genre}</span>
              <span className="story-mood">{generatedStory.mood}</span>
              <span className="story-timeline">{generatedStory.timeline}</span>
            </div>
            <p className="story-description">{generatedStory.description}</p>
            
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

          <div className="story-content">
            <div className="content-tabs">
              <button className="tab-btn active">📖 Story</button>
              <button className="tab-btn">📝 Script</button>
            </div>
            
            <div className="story-chapters">
              {generatedStory.chapters.map((chapter) => (
                <div key={chapter.id} className="story-chapter">
                  <h3 className="chapter-title">
                    <span className="chapter-number">{chapter.order}.</span>
                    {chapter.title}
                  </h3>
                  <div className="chapter-content">
                    <p>{chapter.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="story-actions">
            <button className="btn-export" onClick={exportStory}>
              📥 Export Script
            </button>
            <button 
              className="btn-new-story"
              onClick={resetGenerator}
            >
              ✨ Generate New Story
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextStoryGenerator;