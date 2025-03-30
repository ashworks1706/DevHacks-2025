'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUpload, FiMic, 
  FiCheck, FiLoader, FiClock 
} from 'react-icons/fi';

interface ChatComponentProps {
  systemStatus: 'idle' | 'processing' | 'completed' | 'error';
  statusMessages: {status: string; message: string; time: string}[];
}

const ChatComponent = ({ systemStatus, statusMessages }: ChatComponentProps) => {
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; }[]>([
    { role: 'ai', content: 'Hello! I\'m your FashionAI assistant. I can analyze your outfit and provide recommendations. What would you like to know?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "Your outfit has a smart casual style. I particularly like how the colors work together!",
        "Based on current trends, I'd suggest pairing this with a minimalist accessory like a silver bracelet or watch.",
        "This outfit would work well for a variety of occasions including work meetings, lunch with friends, or casual evening events.",
        "The fit of your clothing appears good. The proportions are balanced nicely between top and bottom.",
        "For similar styles, you might like to try incorporating more layered pieces like light jackets or cardigans."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'ai', content: randomResponse }]);
    }, 1500);
  };

  const handleVoiceInput = () => {
    // This would implement voice recognition
    // For demo purposes, just set a predefined message
    setTimeout(() => {
      setInputMessage("How would you rate my outfit style?");
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <FiCheck className="text-green-500" />;
      case 'processing':
        return <div className="animate-spin"><FiLoader className="text-[#8c66ff]" /></div>;
      case 'error':
        return <div className="text-red-500">×</div>;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Status bar */}
      <div className="border-b border-gray-200 py-3 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">FashionAI Assistant</h2>
          <div className="flex items-center space-x-2">
            <span className={`inline-block h-2 w-2 rounded-full ${
              systemStatus === 'idle' ? 'bg-gray-400' :
              systemStatus === 'processing' ? 'bg-yellow-400' :
              systemStatus === 'completed' ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            <span className="text-sm text-gray-600">
              {systemStatus === 'idle' ? 'Idle' :
               systemStatus === 'processing' ? 'Processing' :
               systemStatus === 'completed' ? 'Ready' : 'Error'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {chatMessages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user' 
                  ? 'bg-[#8c66ff] text-white' 
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      {/* System status log */}
      <div className="border-t border-gray-200 py-2 px-4 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-500 mb-1">System Status</h3>
        <div className="space-y-1 max-h-[80px] overflow-y-auto">
          {statusMessages.slice(-3).map((status, index) => (
            <div key={index} className="flex items-center text-xs">
              <div className="mr-2">
                {getStatusIcon(status.status)}
              </div>
              <div className="flex-1">{status.message}</div>
              <div className="text-xs text-gray-500">{status.time}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleVoiceInput}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FiMic className="w-4 h-4 text-[#8c66ff]" />
          </button>
          <input
            type="text"
            placeholder="Ask about your outfit..."
            className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#8c66ff] focus:border-transparent"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-[#8c66ff] rounded-full text-white hover:bg-[#7c52f2] transition-colors"
          >
            <FiUpload className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;