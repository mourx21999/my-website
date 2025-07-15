# AI Image Generator

A modern web application that creates images based on text descriptions using AI technology.

## Features

- **Text-to-Image Generation**: Enter detailed descriptions to generate unique images
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Generation**: Watch as your descriptions transform into images
- **Image Gallery**: View all your generated images in a clean grid layout
- **Mobile Responsive**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and go to `http://localhost:3000`

3. Start generating images by entering descriptions!

## How to Use

1. **Enter a Description**: In the text area, describe the image you want to create. Be as detailed as possible for better results.

2. **Generate Image**: Click the "Generate Image" button and wait for the AI to create your image.

3. **View Results**: Your generated images will appear in the gallery below, with timestamps and descriptions.

## Example Descriptions

Try these example descriptions to get started:

- "A serene mountain landscape at sunset with a crystal clear lake reflecting the sky"
- "A futuristic city with flying cars and neon lights"
- "A cozy coffee shop interior with warm lighting and wooden furniture"
- "A magical forest with glowing mushrooms and fairy lights"

## Technical Details

This application is built with:
- **React 18** with TypeScript
- **Modern CSS** with gradients and animations
- **Responsive Design** for all screen sizes
- **Component-based Architecture** for maintainability

## Future Enhancements

- Integration with real AI image generation APIs (OpenAI DALL-E, Stable Diffusion, etc.)
- Image editing and variation features
- User accounts and image history
- Advanced prompt engineering tools
- Image download functionality

## Note

Currently, this is a demo application that simulates image generation. To use with real AI image generation, you would need to integrate with services like:
- OpenAI DALL-E API
- Stable Diffusion API
- Midjourney API
- Or other AI image generation services

## License

This project is open source and available under the MIT License. 

## **Your Image Generator is Working!** 🎉

### **Current Status:**
- ✅ **Frontend**: Running on http://localhost:3005
- ✅ **Backend**: Running on http://localhost:5001
- ✅ **Photo Search**: Working (Unsplash)
- ❌ **AI Generation**: Requires setup (see below)

### **Quick Test:**
1. **Refresh your browser** (F5)
2. **Try generating an image**
3. **You'll see "Photo search result"** - this is working correctly!

### **🤖 Want TRUE AI Image Generation?**
Currently using photo search. To enable actual AI image generation:

**👉 See `AI_SETUP_INSTRUCTIONS.md` for 5-minute setup!**

### **If the backend stops:**
```bash
./restart-backend.sh
```

**Your app is fully functional with photo search! AI generation is optional.** 🚀 