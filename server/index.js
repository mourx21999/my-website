import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:3005', 
  'http://localhost:3000',
  'http://100.115.92.200:5001',
  // Production domains will be added after deployment
  /https:\/\/.*\.onrender\.com$/
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log(`[${new Date().toISOString()}] Generating image for prompt: "${prompt}"`);

  // Check if we have a Hugging Face token
  const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN;
  
  console.log('🔍 Debug - Token check:');
  console.log('  HUGGING_FACE_TOKEN:', process.env.HUGGING_FACE_TOKEN ? `${process.env.HUGGING_FACE_TOKEN.substring(0, 10)}...` : 'undefined');
  console.log('  HF_TOKEN:', process.env.HF_TOKEN ? `${process.env.HF_TOKEN.substring(0, 10)}...` : 'undefined');
  console.log('  Final token:', hfToken ? `${hfToken.substring(0, 10)}...` : 'undefined');
  
  if (hfToken) {
    console.log('🔑 Found Hugging Face token, attempting AI generation...');
    
    // Try multiple AI image generation services with authentication
    const aiServices = [
      {
        name: 'Stable Diffusion XL Base',
        url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        body: { inputs: prompt, options: { wait_for_model: true } }
      },
      {
        name: 'Flux Dev',
        url: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        body: { inputs: prompt, options: { wait_for_model: true } }
      },
      {
        name: 'Stable Diffusion v1.5',
        url: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        body: { inputs: prompt, options: { wait_for_model: true } }
      }
    ];

    for (const service of aiServices) {
      try {
        console.log(`Attempting ${service.name}...`);
        
        const response = await fetch(service.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hfToken}`
          },
          body: JSON.stringify(service.body)
        });

        console.log(`${service.name} response status: ${response.status}`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`Content-Type: ${contentType}`);
          
          if (contentType && contentType.includes('image/')) {
            // It's an image response
            const imageBuffer = await response.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const imageUrl = `data:image/png;base64,${base64Image}`;
            
            console.log(`✅ Successfully generated AI image via ${service.name}`);
            return res.json({ 
              url: imageUrl, 
              source: 'hugging-face-ai',
              message: `AI-generated image (${service.name})`
            });
          } else {
            // Check if it's a JSON error response
            const text = await response.text();
            console.log(`${service.name} response: ${text}`);
            
            try {
              const jsonResponse = JSON.parse(text);
              if (jsonResponse.error) {
                console.log(`❌ ${service.name} error: ${jsonResponse.error}`);
                continue; // Try next service
              }
            } catch (parseError) {
              console.log(`❌ ${service.name} unexpected response format`);
              continue; // Try next service
            }
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ ${service.name} HTTP error ${response.status}: ${errorText}`);
          continue; // Try next service
        }
      } catch (error) {
        console.log(`❌ ${service.name} request failed: ${error.message}`);
        continue; // Try next service
      }
    }
    
    console.log('❌ All authenticated AI services failed');
  } else {
    console.log('🔑 No Hugging Face token found - AI generation requires authentication');
    console.log('💡 To enable AI image generation:');
    console.log('   1. Create a free account at https://huggingface.co');
    console.log('   2. Go to Settings > Access Tokens');
    console.log('   3. Create a token with "Read" permissions');
    console.log('   4. Add HUGGING_FACE_TOKEN=your_token_here to server/.env');
    console.log('   5. Restart the server');
  }

  // Fallback to Unsplash photo search
  try {
    console.log('🔄 Using Unsplash photo search...');
    const searchQuery = encodeURIComponent(prompt.trim());
    const imageUrl = `https://source.unsplash.com/512x512/?${searchQuery}`;
    
    const message = hfToken 
      ? 'Photo search result (AI services temporarily unavailable)'
      : 'Photo search result (AI generation requires Hugging Face token)';
    
    console.log('📸 Returning photo search result');
    return res.json({ 
      url: imageUrl, 
      source: 'unsplash-photo',
      message: message
    });
  } catch (unsplashError) {
    console.log(`❌ Unsplash fallback failed: ${unsplashError.message}`);
    return res.status(500).json({ 
      error: 'All image generation methods failed',
      details: unsplashError.message
    });
  }
});


// Story generation endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Story generation server is running',
    endpoints: ['/generate-story-chapter', '/generate-story-title', '/health']
  });
});

app.post('/generate-story-chapter', async (req, res) => {
  try {
    const { prompt, image_url, chapter_index, genre, mood, characters, max_tokens } = req.body;
    
    console.log(`🤖 Generating ${genre} chapter ${chapter_index + 1}...`);
    
    // Simple story generation (fallback implementation)
    const storyTemplates = {
      Fantasy: {
        settings: ['enchanted forest', 'mystical kingdom', 'floating castle', 'crystal caves'],
        conflicts: ['ancient curse', 'dark prophecy', 'evil sorcerer', 'mythical beast'],
        resolutions: ['heroic sacrifice', 'magical transformation', 'divine intervention', 'inner strength']
      },
      'Sci-Fi': {
        settings: ['distant planet', 'space station', 'cyberpunk city', 'alien world'],
        conflicts: ['alien invasion', 'AI uprising', 'time paradox', 'corporate conspiracy'],
        resolutions: ['technological breakthrough', 'peaceful contact', 'quantum solution', 'evolution']
      },
      Mystery: {
        settings: ['crime scene', 'old mansion', 'foggy street', 'locked room'],
        conflicts: ['murder mystery', 'missing person', 'theft', 'conspiracy'],
        resolutions: ['clever deduction', 'hidden evidence', 'confession', 'unexpected twist']
      }
    };
    
    const genreData = storyTemplates[genre] || storyTemplates['Fantasy'];
    const protagonist = characters?.[0]?.name || 'the protagonist';
    
    const chapterStories = [
      `In the ${genreData.settings[0]}, ${protagonist} discovered something that would change everything. The ${mood.toLowerCase()} atmosphere was thick with anticipation as shadows danced across ancient stones. What started as a simple journey had become something far more significant.`,
      
      `As ${protagonist} delved deeper into the mystery, the ${mood.toLowerCase()} tension grew unbearable. Every step forward brought new challenges, and the ${genreData.settings[1]} seemed to pulse with hidden energy.`,
      
      `The confrontation was inevitable. ${protagonist} stood face to face with the ${genreData.conflicts[0]}, and the ${mood.toLowerCase()} atmosphere crackled with power. Everything they had learned led to this moment.`,
      
      `In the aftermath of great trials, ${protagonist} reflected on how much had changed. Through ${genreData.resolutions[0]}, a new dawn had broken.`
    ];
    
    const story_text = chapterStories[Math.min(chapter_index, 3)] || 
      `Chapter ${chapter_index + 1} continued the ${mood.toLowerCase()} tale of ${protagonist}.`;
    
    console.log(`✅ Generated ${story_text.length} characters for chapter ${chapter_index + 1}`);
    
    res.json({
      story_text,
      chapter_index,
      success: true,
      message: `Generated ${genre} chapter ${chapter_index + 1} with ${mood} mood`
    });
    
  } catch (error) {
    console.error('Story chapter generation error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

app.post('/generate-story-title', async (req, res) => {
  try {
    const { prompt, genre, mood } = req.body;
    
    console.log(`🎯 Generating ${genre} title with ${mood} mood...`);
    
    const titleTemplates = {
      Fantasy: [`The ${mood} Chronicles`, `Legends of ${mood}`, `The ${mood} Quest`],
      'Sci-Fi': [`Beyond the ${mood} Stars`, `The ${mood} Protocol`, `${mood} Horizons`],
      Mystery: [`The ${mood} Case`, `${mood} Shadows`, `The ${mood} Investigation`]
    };
    
    const templates = titleTemplates[genre] || titleTemplates['Fantasy'];
    const title = templates[Math.floor(Math.random() * templates.length)];
    
    console.log(`✅ Generated title: "${title}"`);
    
    res.json({
      title,
      success: true,
      message: `Generated ${genre} title with ${mood} mood`
    });
    
  } catch (error) {
    console.error('Story title generation error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Catch-all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
  console.log('🔍 Current Status:');
  
  const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN;
  if (hfToken) {
    console.log('✅ Hugging Face token configured - AI generation enabled');
    console.log('   - Will attempt multiple AI services with authentication');
  } else {
    console.log('❌ No Hugging Face token found - AI generation disabled');
    console.log('   - Only photo search available');
    console.log('   - See server logs for setup instructions');
  }
  
  console.log('📸 Unsplash photo search always available as fallback');
  console.log('🔧 Check server logs for detailed debugging info');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🏗️  Production mode: Serving static React build');
  }
}); 