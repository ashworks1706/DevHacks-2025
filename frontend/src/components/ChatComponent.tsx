'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  FiUpload, FiMic, 
  FiCheck, FiLoader, FiClock,
  FiSend, FiPlus, FiSettings
} from 'react-icons/fi';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
}

const ChatComponent = () => {
  const { user } = useUser();
  const userId = user?.id;
  console.log(userId)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [systemStatus, setSystemStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [statusMessages, setStatusMessages] = useState<any>([]);

  useEffect(() => {
    console.log(userId)
    const fetchChatHistory = async () => {
      try {
        if (!userId) return;
        const response = await fetch(`/users/${userId}/chat_history.json`);
        if (response.ok) {
          const data = await response.json();
          // Map the chat history to the ChatMessage interface
          const mappedMessages = data.map((message: any) => ({
            role: message.user ? 'user' : 'ai',
            content: message.user || message.model,
          }));
          setChatMessages(mappedMessages);
        } else {
          console.error('Failed to fetch chat history:', response.status);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
    const intervalId = setInterval(fetchChatHistory, 2000); // Fetch every 2 seconds

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [userId]);

  useEffect(() => {
    const fetchStatusMessages = async () => {
      try {
        if (!userId) return;
        const response = await fetch(`/users/${userId}/responses.json`);
        if (response.ok) {
          const data = await response.json();
          setStatusMessages(data);
          
        } else {
          console.error('Failed to fetch status messages:', response.status);
          setSystemStatus('error');
        }
      } catch (error) {
        console.error('Error fetching status messages:', error);
        setSystemStatus('error');
      }
    };

    fetchStatusMessages();
    const intervalId = setInterval(fetchStatusMessages, 2000); // Fetch every 2 seconds

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [userId]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAiTyping || !userId) return;

    // Add user message to chat - optimistically update
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);

    // Clear input and reset contentEditable div
    setInputMessage('');
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userId,
          text: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // No need to handle response, as backend updates chat_history.json
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      setChatMessages(prev => prev.slice(0, -1));
      // Optionally, display an error message to the user
      setSystemStatus('error');
    }
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

  // ChatGPT-style typing indicator with bouncing dots
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-gray-100 text-black rounded-lg px-4 py-3 max-w-[80%]">
        <div className="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  console.log(statusMessages)
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
                  : 'bg-gray-50 text-black shadow-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Show typing indicator when AI is responding */}
        {isAiTyping && <TypingIndicator />}
      </div>
      
      {/* System status log */}
        {statusMessages && statusMessages.length > 0 && (
          <div className="border-t border-gray-200 py-2 px-4 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 mb-1">System Status</h3>
            <div className="space-y-1 max-h-[80px] overflow-y-auto">
            {statusMessages.filter((status:any, index:any, self:any) =>
              index === self.findIndex((t:any) => (
              JSON.stringify(t) === JSON.stringify(status)
              ))
            ).map((status :any, index:any) => (
            <div key={index} className="flex items-center text-xs">
              <div className="flex-1">
              {Array.isArray(status) ? (
              status.map((link, linkIndex) => {
                try {
                const url = new URL(link);
                return (
                <button key={linkIndex} className="bg-purple-200 hover:bg-purple-300 text-purple-800 font-bold py-1 px-2 rounded mr-2 mb-1">
                {url.hostname}
                </button>
                );
                } catch (error) {
                return (
                <button key={linkIndex} className="bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-2 rounded mr-2 mb-1">
                Invalid URL
                </button>
                );
                }
              })
              ) : (
              <>
              {status}
              <br />
              </>
              )}
              </div>
            </div>
            ))}
            </div>
          </div>
        )}
        
        {/* Chat input - Styled like Claude's UI */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative flex items-center py-3">
          {/* Voice input button - Left side */}
          <button 
            onClick={handleVoiceInput}
            className="icon-button text-[#8c66ff] hover:text-[#7c52f2] transition-colors relative"
            disabled={isAiTyping}
          >
            <span className="absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 hover:opacity-100 hover:bg-purple-50"></span>
            <FiMic className="w-5 h-5 stroke-current relative z-10" />
          </button>
          
          {/* Contenteditable div instead of input */}
          <div
            ref={inputRef}
            role="textbox"
            contentEditable={!isAiTyping}
            data-placeholder="How can I help you today?"
            className="flex-1 outline-none bg-transparent ml-3 text-gray-700 min-h-[24px] max-h-[120px] overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            suppressContentEditableWarning={true}
            onInput={(e) => setInputMessage(e.currentTarget.textContent || '')}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            style={{ 
              wordBreak: 'break-word', 
              cursor: isAiTyping ? 'not-allowed' : 'text' 
            }}
          ></div>
          
          {/* Plus/Upload button - Right side */}
          <button
            className="icon-button text-[#8c66ff] hover:text-[#7c52f2] ml-3 transition-colors relative"
            disabled={isAiTyping}
          >
            <span className="absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 hover:opacity-100 hover:bg-purple-50"></span>
            <FiPlus className="w-5 h-5 stroke-current relative z-10" />
          </button>
          
          {/* Send button - Right side */}
          <button
            onClick={handleSendMessage}
            className={`icon-button ml-3 ${isAiTyping || !inputMessage ? 'text-gray-400 cursor-not-allowed' : 'text-[#8c66ff] hover:text-[#7c52f2]'} transition-colors relative`}
            disabled={isAiTyping || !inputMessage}
          >
            <span className={`absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 ${isAiTyping || !inputMessage ? '' : 'hover:opacity-100 hover:bg-purple-50'}`}></span>
            <FiSend className="w-5 h-5 stroke-current relative z-10" />
          </button>
        </div>
      </div>

      {/* CSS for the typing animation and icons */}
      <style jsx global>{`
        .typing-animation {
          display: flex;
          align-items: center;
          column-gap: 6px;
        }
        
        .typing-animation span {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          opacity: 0.7;
          display: inline-block;
          background-color: #8c66ff;
        }
        
        .typing-animation span:nth-child(1) {
          animation: bounce 1s infinite;
        }
        
        .typing-animation span:nth-child(2) {
          animation: bounce 1s infinite .2s;
        }
        
        .typing-animation span:nth-child(3) {
          animation: bounce 1s infinite .4s;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }
        
        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          stroke-width: 2px;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border: 1px solid transparent;
        }
        
        .icon-button:hover:not(:disabled) {
          background-color: rgba(140, 102, 255, 0.1);
          border-color: #8c66ff;
          box-shadow: 0 2px 10px rgba(140, 102, 255, 0.4);
        }
        
        .icon-button:active:not(:disabled) {
          background-color: rgba(140, 102, 255, 0.2);
          box-shadow: 0 2px 8px rgba(140, 102, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;