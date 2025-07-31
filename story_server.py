#!/usr/bin/env python3
"""
Simple Flask server for AI Story Generation
This provides endpoints for the ImageStoryGenerator component to generate real AI stories.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
)

# Simple story templates for fallback generation
STORY_TEMPLATES = {
    'Fantasy': {
        'character_types': ['brave knight', 'wise wizard', 'cunning rogue', 'noble princess', 'ancient dragon'],
        'settings': ['enchanted forest', 'mystical kingdom', 'floating castle', 'crystal caves', 'magical academy'],
        'conflicts': ['ancient curse', 'dark prophecy', 'evil sorcerer', 'mythical beast', 'forbidden magic'],
        'resolutions': ['heroic sacrifice', 'magical transformation', 'divine intervention', 'true love\'s power', 'inner strength']
    },
    'Sci-Fi': {
        'character_types': ['space explorer', 'AI researcher', 'rebel pilot', 'alien diplomat', 'cybernetic engineer'],
        'settings': ['distant planet', 'space station', 'cyberpunk city', 'alien world', 'time portal'],
        'conflicts': ['alien invasion', 'AI uprising', 'time paradox', 'corporate conspiracy', 'dimensional rift'],
        'resolutions': ['technological breakthrough', 'peaceful contact', 'quantum solution', 'sacrifice for humanity', 'evolution']
    },
    'Mystery': {
        'character_types': ['detective', 'suspect', 'witness', 'victim', 'investigator'],
        'settings': ['crime scene', 'old mansion', 'foggy street', 'locked room', 'courthouse'],
        'conflicts': ['murder mystery', 'missing person', 'theft', 'conspiracy', 'cover-up'],
        'resolutions': ['clever deduction', 'hidden evidence', 'confession', 'unexpected twist', 'justice served']
    }
}

def generate_ai_story_chapter(prompt, image_url, chapter_index, genre, mood, characters, max_tokens=500):
    """
    Generate a story chapter using OpenAI GPT-4 Vision
    """
    try:
        # Try OpenAI GPT-4 Vision first
        messages = [
            {
                "role": "system",
                "content": f"""You are a master storyteller specializing in {genre} stories with {mood.lower()} atmosphere. 
                Create engaging, vivid narratives that:
                - Match the {genre} genre perfectly
                - Maintain a {mood.lower()} tone throughout
                - Build on previous story elements
                - Incorporate visual details from the provided image
                - Keep character consistency
                - Write 200-400 words of compelling narrative
                - Use rich, descriptive language appropriate for the genre"""
            },
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
                            "url": image_url,
                            "detail": "high"
                        }
                    }
                ]
            }
        ]
        
        print(f"🤖 Generating {genre} chapter {chapter_index + 1} with OpenAI GPT-4 Vision...")
        
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.8,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        story_text = response.choices[0].message.content
        print(f"✅ Generated {len(story_text)} characters for chapter {chapter_index + 1}")
        return story_text
        
    except Exception as e:
        print(f"⚠️ OpenAI failed ({e}), falling back to template generation...")
        return generate_fallback_chapter(chapter_index, genre, mood, characters)

def generate_fallback_chapter(chapter_index, genre, mood, characters):
    """Fallback story generation when OpenAI fails"""
    # Get story elements for the genre
    genre_data = STORY_TEMPLATES.get(genre, STORY_TEMPLATES['Fantasy'])
    
    # Create character context
    char_names = [char.get('name', f'Character{i}') for i, char in enumerate(characters)]
    protagonist = char_names[0] if char_names else 'the protagonist'
    
    # Generate chapter based on index and mood
    chapter_stories = {
        0: f"In the {random.choice(genre_data['settings'])}, {protagonist} discovered something that would change everything. The {mood.lower()} atmosphere was thick with anticipation as shadows danced across ancient stones. What started as a simple journey had become something far more significant. The image before them revealed secrets that had been hidden for centuries, and {protagonist} knew there was no turning back.",
        
        1: f"As {protagonist} delved deeper into the mystery, the {mood.lower()} tension grew unbearable. Every step forward brought new challenges, and the {random.choice(genre_data['settings'])} seemed to pulse with hidden energy. Allies became uncertain, and enemies revealed themselves in unexpected ways. The {random.choice(genre_data['conflicts'])} that had been brewing was finally beginning to surface.",
        
        2: f"The confrontation was inevitable. {protagonist} stood face to face with the {random.choice(genre_data['conflicts'])}, and the {mood.lower()} atmosphere crackled with power. Everything they had learned, every ally they had made, every sacrifice along the way had led to this moment. The fate of the {random.choice(genre_data['settings'])} hung in the balance.",
        
        3: f"In the aftermath of the great trial, {protagonist} reflected on how much had changed. The {mood.lower()} journey had transformed not just the world around them, but their very soul. Through {random.choice(genre_data['resolutions'])}, a new dawn had broken. The {random.choice(genre_data['settings'])} was safe, but the adventure had only just begun."
    }
    
    # Get appropriate chapter or create a generic one
    story_index = min(chapter_index, 3)
    return chapter_stories.get(story_index, 
        f"Chapter {chapter_index + 1} continued the {mood.lower()} tale of {protagonist}. "
        f"In the {random.choice(genre_data['settings'])}, new challenges arose that tested every lesson learned so far. "
        f"The {random.choice(genre_data['conflicts'])} grew stronger, but so did the resolve to overcome it. "
        f"This was {protagonist}'s moment to shine, and the world watched with bated breath."
    )

def generate_ai_title(prompt, genre, mood):
    """Generate a compelling title using OpenAI GPT-4"""
    try:
        # Try OpenAI GPT-4 for title generation
        title_prompt = f"""Create a compelling, memorable title for a {genre} story with a {mood.lower()} atmosphere.

Story context: {prompt}

Requirements:
- Perfect for the {genre} genre
- Captures the {mood.lower()} mood
- Memorable and engaging
- 2-6 words long
- No quotation marks in response
- Return ONLY the title, nothing else

Genre-specific style:
- Fantasy: Mystical, epic, with references to quests, magic, or ancient powers
- Sci-Fi: Futuristic, technological, cosmic, or dystopian themes
- Mystery: Intriguing, secretive, with hints of danger or puzzles
- Romance: Emotional, passionate, with themes of love and connection
- Horror: Dark, ominous, spine-chilling atmosphere
- Adventure: Bold, exciting, journey-focused themes"""

        print(f"🎯 Generating {genre} title with {mood} mood using OpenAI...")

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert title creator for {genre} literature. Create compelling, genre-appropriate titles that capture the {mood.lower()} essence perfectly."
                },
                {
                    "role": "user", 
                    "content": title_prompt
                }
            ],
            max_tokens=50,
            temperature=0.9,
            presence_penalty=0.2,
            frequency_penalty=0.3
        )
        
        title = response.choices[0].message.content.strip().strip('"\'')
        print(f"✅ Generated title: '{title}'")
        return title
        
    except Exception as e:
        print(f"⚠️ OpenAI title generation failed ({e}), using fallback...")
        return generate_fallback_title(genre, mood)

def generate_fallback_title(genre, mood):
    """Fallback title generation when OpenAI fails"""
    title_templates = {
        'Fantasy': [
            f"The {mood} Chronicles of {random.choice(['Eldoria', 'Mystania', 'Arcanum', 'Valeria'])}",
            f"Legends of the {mood} {random.choice(['Sword', 'Crown', 'Crystal', 'Flame'])}",
            f"The {mood} Quest for {random.choice(['Truth', 'Power', 'Peace', 'Redemption'])}"
        ],
        'Sci-Fi': [
            f"Beyond the {mood} {random.choice(['Void', 'Stars', 'Galaxy', 'Nebula'])}",
            f"The {mood} {random.choice(['Protocol', 'Experiment', 'Discovery', 'Signal'])}",
            f"{mood} Horizons: {random.choice(['New Earth', 'Final Frontier', 'Lost Colony'])}"
        ],
        'Mystery': [
            f"The {mood} {random.choice(['Case', 'Secret', 'Mystery', 'Evidence'])}",
            f"{mood} Shadows of {random.choice(['Truth', 'Deception', 'Justice', 'Guilt'])}",
            f"The {mood} {random.choice(['Detective', 'Investigation', 'Confession', 'Witness'])}"
        ]
    }
    
    templates = title_templates.get(genre, title_templates['Fantasy'])
    return random.choice(templates)

@app.route('/generate-story-chapter', methods=['POST'])
def generate_story_chapter():
    """Generate a single story chapter"""
    try:
        data = request.json
        print(f"Generating chapter {data.get('chapter_index', 0)} for {data.get('genre', 'Fantasy')} story...")
        
        prompt = data.get('prompt', '')
        image_url = data.get('image_url', '')
        chapter_index = data.get('chapter_index', 0)
        genre = data.get('genre', 'Fantasy')
        mood = data.get('mood', 'Epic')
        characters = data.get('characters', [])
        max_tokens = data.get('max_tokens', 500)
        
        # Generate the story chapter
        story_text = generate_ai_story_chapter(
            prompt, image_url, chapter_index, genre, mood, characters, max_tokens
        )
        
        return jsonify({
            'story_text': story_text,
            'chapter_index': chapter_index,
            'success': True,
            'message': f'Generated {genre} chapter {chapter_index + 1} with {mood} mood'
        })
        
    except Exception as e:
        print(f"Error generating story chapter: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/generate-story-title', methods=['POST'])
def generate_story_title():
    """Generate a title for the story"""
    try:
        data = request.json
        print(f"Generating {data.get('genre', 'Fantasy')} title with {data.get('mood', 'Epic')} mood...")
        
        prompt = data.get('prompt', '')
        genre = data.get('genre', 'Fantasy')
        mood = data.get('mood', 'Epic')
        
        # Generate the title
        title = generate_ai_title(prompt, genre, mood)
        
        return jsonify({
            'title': title,
            'success': True,
            'message': f'Generated {genre} title with {mood} mood'
        })
        
    except Exception as e:
        print(f"Error generating story title: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Story generation server is running',
        'endpoints': ['/generate-story-chapter', '/generate-story-title']
    })

if __name__ == '__main__':
    print("🚀 Starting AI Story Generation Server...")
    print("📚 Endpoints available:")
    print("   - POST /generate-story-chapter")
    print("   - POST /generate-story-title") 
    print("   - GET /health")
    print("\n✨ Ready to generate amazing stories!")
    
    # Run the server
    app.run(
        host='0.0.0.0',
        port=5847,
        debug=True,
        threaded=True
    )