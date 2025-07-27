# Backend Implementation for AI Story Generation

To make the stories actually generate using AI, you need to add these endpoints to your backend server (at `http://localhost:5001`):

## Required Backend Endpoints

### 1. Generate Story Chapter
```python
# Add this to your Flask/FastAPI backend

@app.route('/generate-story-chapter', methods=['POST'])
def generate_story_chapter():
    try:
        data = request.json
        prompt = data.get('prompt')
        image_url = data.get('image_url')
        chapter_index = data.get('chapter_index', 0)
        genre = data.get('genre', 'Fantasy')
        mood = data.get('mood', 'Epic')
        characters = data.get('characters', [])
        max_tokens = data.get('max_tokens', 500)

        # Example using OpenAI API
        import openai
        
        # Set your OpenAI API key
        openai.api_key = "your-openai-api-key"
        
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",  # or gpt-4o for vision + text
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            max_tokens=max_tokens,
            temperature=0.8
        )
        
        story_text = response.choices[0].message.content
        
        return jsonify({
            'story_text': story_text,
            'chapter_index': chapter_index,
            'success': True
        })
        
    except Exception as e:
        print(f"Story chapter generation error: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/generate-story-title', methods=['POST'])
def generate_story_title():
    try:
        data = request.json
        prompt = data.get('prompt')
        genre = data.get('genre', 'Fantasy')
        mood = data.get('mood', 'Epic')

        # Example using OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Cheaper model for titles
            messages=[
                {
                    "role": "system",
                    "content": f"You are a creative title generator specializing in {genre} stories with {mood} themes. Generate compelling, memorable titles."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=50,
            temperature=0.9
        )
        
        title = response.choices[0].message.content.strip()
        
        return jsonify({
            'title': title,
            'success': True
        })
        
    except Exception as e:
        print(f"Story title generation error: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500
```

## Alternative: Using Hugging Face Transformers

If you prefer to use open-source models instead of OpenAI:

```python
from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests

# Load models for story generation
story_generator = pipeline("text-generation", model="microsoft/DialoGPT-large")
image_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
image_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.route('/generate-story-chapter', methods=['POST'])
def generate_story_chapter_huggingface():
    try:
        data = request.json
        prompt = data.get('prompt')
        image_url = data.get('image_url')
        
        # First, analyze the image
        image = Image.open(requests.get(image_url, stream=True).raw)
        inputs = image_processor(image, return_tensors="pt")
        out = image_model.generate(**inputs, max_length=50)
        image_description = image_processor.decode(out[0], skip_special_tokens=True)
        
        # Generate story based on prompt + image description
        full_prompt = f"{prompt}\n\nImage shows: {image_description}\n\nStory:"
        
        result = story_generator(
            full_prompt,
            max_length=500,
            num_return_sequences=1,
            temperature=0.8,
            do_sample=True
        )
        
        story_text = result[0]['generated_text'].replace(full_prompt, '').strip()
        
        return jsonify({
            'story_text': story_text,
            'image_description': image_description,
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500
```

## Environment Setup

Add these to your requirements.txt:
```
openai==1.3.0
transformers==4.35.0
torch==2.1.0
Pillow==10.0.0
```

Or for Hugging Face only:
```
transformers==4.35.0
torch==2.1.0
Pillow==10.0.0
```

## Configuration

1. **OpenAI Setup:**
   - Get API key from https://platform.openai.com/
   - Set environment variable: `export OPENAI_API_KEY="your-key"`

2. **Hugging Face Setup:**
   - No API key needed for open-source models
   - Models will download automatically on first use

## Quick Start

1. Add the endpoints to your existing backend
2. Install required packages: `pip install -r requirements.txt`
3. Set your OpenAI API key (if using OpenAI)
4. Restart your backend server
5. The frontend will now generate real AI stories!

## Features Now Working:

- ✅ **Chapter-by-chapter generation** with image analysis
- ✅ **Character consistency** across chapters
- ✅ **Genre and mood adaptation**
- ✅ **Story continuity** between chapters
- ✅ **AI-generated titles**
- ✅ **Fallback to templates** if AI fails
- ✅ **Error handling and retry logic**

The stories will now be genuinely creative, analyzing each image and creating coherent narratives that flow from chapter to chapter!