#!/usr/bin/env python3
"""
Quick test to check if the story server is running and accessible
"""

import requests
import json

def test_server():
    print("🧪 Testing Story Generation Server...")
    
    # Test 1: Health check
    try:
        print("\n1️⃣ Testing health endpoint...")
        response = requests.get('http://localhost:5847/health')
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to server: {e}")
        print("   Make sure the server is running with: ./start_story_server.sh")
        return False
    
    # Test 2: Story chapter generation
    try:
        print("\n2️⃣ Testing story chapter generation...")
        test_data = {
            "prompt": "Test story prompt about a brave hero",
            "image_url": "https://via.placeholder.com/400x300.png?text=Test+Image",
            "chapter_index": 0,
            "genre": "Fantasy",
            "mood": "Epic",
            "characters": [{"name": "TestHero", "role": "protagonist"}],
            "max_tokens": 200
        }
        
        response = requests.post(
            'http://localhost:5847/generate-story-chapter',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Story chapter generation works!")
            print(f"   Generated {len(data.get('story_text', ''))} characters")
            print(f"   Story preview: {data.get('story_text', '')[:100]}...")
        else:
            print(f"❌ Story generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Story generation test failed: {e}")
        return False
    
    # Test 3: Title generation  
    try:
        print("\n3️⃣ Testing title generation...")
        title_data = {
            "prompt": "A fantasy story about a brave hero's quest",
            "genre": "Fantasy", 
            "mood": "Epic"
        }
        
        response = requests.post(
            'http://localhost:5847/generate-story-title',
            json=title_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Title generation works!")
            print(f"   Generated title: '{data.get('title', '')}'")
        else:
            print(f"❌ Title generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Title generation test failed: {e}")
        return False
    
    print("\n🎉 All tests passed! The story server is working correctly.")
    print("   Your frontend should now be able to generate stories!")
    return True

if __name__ == '__main__':
    test_server()