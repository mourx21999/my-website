import React, { useState, useEffect, useRef } from 'react';
import './CollaborativeCanvas.css';

interface CollaborativeCanvasProps {
  onCanvasCreate: (canvasData: string, collaborators: string[]) => void;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'prompt';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  collaboratorId: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  collaboratorId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'prompt-suggestion';
}

const COLLABORATOR_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', 
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
];

const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({ onCanvasCreate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<'text' | 'shape' | 'prompt'>('text');
  const [isDrawing, setIsDrawing] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  // Initialize user and generate room code
  useEffect(() => {
    const user: Collaborator = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Artist ${Math.floor(Math.random() * 1000)}`,
      avatar: ['🎨', '🖌️', '✨', '🌟', '🎭'][Math.floor(Math.random() * 5)],
      color: COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)],
      isActive: true,
      lastSeen: new Date()
    };
    
    setCurrentUser(user);
    setRoomCode(Math.random().toString(36).substr(2, 8).toUpperCase());
    
    // Add welcome message
    addSystemMessage('Welcome to Collaborative Canvas! Invite others with your room code.');
  }, []);

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      collaboratorId: 'system',
      message,
      timestamp: new Date(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) return;
    
    setIsInRoom(true);
    if (currentUser) {
      setCollaborators([currentUser]);
      addSystemMessage(`Joined room ${roomCode}. Waiting for other collaborators...`);
      
      // Simulate other users joining
      setTimeout(() => {
        simulateCollaboratorJoin();
      }, 3000);
    }
  };

  const simulateCollaboratorJoin = () => {
    const names = ['Maya', 'Alex', 'Jordan', 'Casey', 'Riley'];
    const newCollaborator: Collaborator = {
      id: Math.random().toString(36).substr(2, 9),
      name: names[Math.floor(Math.random() * names.length)],
      avatar: ['👩‍🎨', '👨‍🎨', '🧑‍🎨', '🎪', '🎨'][Math.floor(Math.random() * 5)],
      color: COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)],
      isActive: true,
      lastSeen: new Date()
    };
    
    setCollaborators(prev => [...prev, newCollaborator]);
    addSystemMessage(`${newCollaborator.name} joined the canvas!`);
    
    // Simulate their activity
    setTimeout(() => {
      simulateCollaboratorActivity(newCollaborator);
    }, 2000);
  };

  const simulateCollaboratorActivity = (collaborator: Collaborator) => {
    // Add a prompt suggestion
    const suggestions = [
      'What about a mystical forest scene?',
      'How about we add some vibrant colors?',
      'Let\'s make it more futuristic!',
      'Should we include some fantasy elements?',
      'Maybe a sunset backdrop would be nice?'
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    const message: ChatMessage = {
      id: Date.now().toString(),
      collaboratorId: collaborator.id,
      message: suggestion,
      timestamp: new Date(),
      type: 'prompt-suggestion'
    };
    
    setChatMessages(prev => [...prev, message]);
    
    // Add canvas element
    setTimeout(() => {
      const element: CanvasElement = {
        id: Date.now().toString(),
        type: 'prompt',
        content: suggestion,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        width: 200,
        height: 50,
        color: collaborator.color,
        collaboratorId: collaborator.id,
        timestamp: new Date()
      };
      
      setCanvasElements(prev => [...prev, element]);
    }, 1000);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentUser || !isInRoom) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const element: CanvasElement = {
      id: Date.now().toString(),
      type: selectedTool,
      content: selectedTool === 'text' ? 'New idea!' : selectedTool === 'prompt' ? 'Add details here' : '○',
      x,
      y,
      width: selectedTool === 'prompt' ? 150 : 100,
      height: selectedTool === 'prompt' ? 40 : 30,
      color: currentUser.color,
      collaboratorId: currentUser.id,
      timestamp: new Date()
    };
    
    setCanvasElements(prev => [...prev, element]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      collaboratorId: currentUser.id,
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const generateCollaborativePrompt = () => {
    const promptElements = canvasElements.filter(el => el.type === 'prompt' || el.type === 'text');
    const suggestions = chatMessages
      .filter(msg => msg.type === 'prompt-suggestion')
      .map(msg => msg.message);
    
    const combinedPrompt = [
      ...promptElements.map(el => el.content),
      ...suggestions
    ].join(', ');
    
    setFinalPrompt(combinedPrompt);
    onCanvasCreate(combinedPrompt, collaborators.map(c => c.name));
  };

  const clearCanvas = () => {
    setCanvasElements([]);
    addSystemMessage('Canvas cleared by ' + (currentUser?.name || 'someone'));
  };

  // Draw canvas elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    canvasElements.forEach(element => {
      ctx.fillStyle = element.color;
      ctx.font = '14px Arial';
      
      if (element.type === 'text' || element.type === 'prompt') {
        // Draw background
        ctx.fillStyle = element.color + '20';
        ctx.fillRect(element.x, element.y, element.width, element.height);
        
        // Draw border
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        
        // Draw text
        ctx.fillStyle = element.color;
        ctx.fillText(element.content, element.x + 5, element.y + 20);
        
        // Draw collaborator indicator
        const collaborator = collaborators.find(c => c.id === element.collaboratorId);
        if (collaborator) {
          ctx.font = '12px Arial';
          ctx.fillText(collaborator.avatar, element.x + element.width - 20, element.y - 5);
        }
      } else if (element.type === 'shape') {
        ctx.fillStyle = element.color;
        ctx.beginPath();
        ctx.arc(element.x, element.y, 15, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [canvasElements, collaborators]);

  return (
    <div className="collaborative-canvas">
      <div className="cc-header">
        <h3>🤝 Collaborative Canvas</h3>
        <p>Create amazing prompts together with other artists</p>
      </div>

      {!isInRoom ? (
        <div className="room-setup">
          <div className="room-join">
            <h4>🏠 Join or Create Room</h4>
            <div className="room-controls">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code or use generated one"
                className="room-input"
                maxLength={8}
              />
              <button className="btn-join-room" onClick={joinRoom}>
                Join Room
              </button>
            </div>
            <p className="room-hint">
              Share the room code with others to collaborate together!
            </p>
          </div>
        </div>
      ) : (
        <div className="canvas-workspace">
          <div className="workspace-header">
            <div className="room-info">
              <span className="room-code">Room: {roomCode}</span>
              <div className="collaborators-list">
                {collaborators.map(collaborator => (
                  <div
                    key={collaborator.id}
                    className={`collaborator-avatar ${collaborator.isActive ? 'active' : ''}`}
                    style={{ borderColor: collaborator.color }}
                    title={collaborator.name}
                  >
                    {collaborator.avatar}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="canvas-tools">
              <button
                className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
                onClick={() => setSelectedTool('text')}
              >
                📝 Text
              </button>
              <button
                className={`tool-btn ${selectedTool === 'prompt' ? 'active' : ''}`}
                onClick={() => setSelectedTool('prompt')}
              >
                💡 Prompt
              </button>
              <button
                className={`tool-btn ${selectedTool === 'shape' ? 'active' : ''}`}
                onClick={() => setSelectedTool('shape')}
              >
                🔴 Shape
              </button>
            </div>
          </div>

          <div className="canvas-container">
            <div className="canvas-area">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="collaboration-canvas"
                onClick={handleCanvasClick}
              />
              <div className="canvas-actions">
                <button className="btn-clear" onClick={clearCanvas}>
                  🗑️ Clear Canvas
                </button>
                <button 
                  className="btn-generate"
                  onClick={generateCollaborativePrompt}
                  disabled={canvasElements.length === 0}
                >
                  ✨ Generate Collaborative Prompt
                </button>
              </div>
            </div>

            <div className="chat-panel">
              <div className="chat-header">
                <h4>💬 Team Chat</h4>
              </div>
              
              <div className="chat-messages">
                {chatMessages.map(message => {
                  const collaborator = collaborators.find(c => c.id === message.collaboratorId);
                  return (
                    <div key={message.id} className={`chat-message ${message.type}`}>
                      {message.type === 'system' ? (
                        <div className="system-message">
                          <span className="system-icon">ℹ️</span>
                          <span className="message-text">{message.message}</span>
                        </div>
                      ) : (
                        <div className="user-message">
                          <div className="message-avatar" style={{ color: collaborator?.color }}>
                            {collaborator?.avatar || '👤'}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-author">{collaborator?.name || 'Unknown'}</span>
                              <span className="message-time">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`message-text ${message.type}`}>
                              {message.type === 'prompt-suggestion' && '💡 '}
                              {message.message}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share ideas, suggestions..."
                  className="message-input"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn-send" onClick={sendMessage}>
                  📤
                </button>
              </div>
            </div>
          </div>

          {finalPrompt && (
            <div className="final-prompt">
              <h4>🎨 Collaborative Prompt Created!</h4>
              <div className="prompt-result">
                {finalPrompt}
              </div>
              <p className="collaborators-credit">
                Created with: {collaborators.map(c => c.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaborativeCanvas;