import React from 'react';
import './App.css';
import ImageGenerator from './components/ImageGenerator';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Create your mind</h1>
        <p>Transform your ideas into stunning images with AI</p>
      </header>
      <main>
        <ImageGenerator />
      </main>
      <PWAInstallPrompt />
    </div>
  );
}

export default App; 