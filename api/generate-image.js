import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log(`[${new Date().toISOString()}] Generating image for prompt: "${prompt}"`);

  // Check if we have a Hugging Face token
  const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN;
  
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
} 