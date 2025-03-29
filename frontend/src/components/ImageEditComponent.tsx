'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FiDownload, FiZoomIn, FiZoomOut, FiRotateCw, FiRefreshCw, 
  FiTrash2, FiThumbsUp, FiThumbsDown, FiPlus, FiSend, FiMic, 
  FiCheck, FiLoader, FiClock 
} from 'react-icons/fi';

const ImageEditComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string; }[]>([
    { role: 'ai', content: 'Hello! I\'m your FashionAI assistant. I can analyze your outfit and provide recommendations. What would you like to know?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [statusMessages, setStatusMessages] = useState<{status: string; message: string; time: string}[]>([
    {status: 'completed', message: 'Image loaded successfully', time: '10:30 AM'},
    {status: 'completed', message: 'Analysis initialized', time: '10:30 AM'},
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Disable scrolling on the entire document
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const image = searchParams.get('image');
    if (image) {
      setImageUrl(image);
      setIsLoading(false);
      
      // Simulate status updates
      setTimeout(() => {
        setSystemStatus('processing');
        setStatusMessages(prev => [...prev, {
          status: 'processing', 
          message: 'Analyzing image...', 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 1000);
      
      setTimeout(() => {
        setSystemStatus('completed');
        setStatusMessages(prev => [...prev, {
          status: 'completed', 
          message: 'Image analysis complete', 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 3000);
    } else {
      // Redirect back to upload if no image is specified
      router.push('/upload');
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleNewUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);
      
      // Simulate new status messages
      setSystemStatus('processing');
      setStatusMessages([
        {status: 'completed', message: 'New image loaded', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})},
        {status: 'processing', message: 'Analyzing new image...', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})},
      ]);
      
      setTimeout(() => {
        setSystemStatus('completed');
        setStatusMessages(prev => [...prev, {
          status: 'completed', 
          message: 'New image analysis complete', 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 2000);
    }
  };

  const handleDeleteImage = () => {
    // Clear the current image and redirect back to upload page
    setImageUrl(null);
    router.push('/upload');
  };

  const handleThumbsUp = () => {
    console.log("User rated this result positively");
    // You would implement your rating logic here
  };

  const handleThumbsDown = () => {
    console.log("User rated this result negatively");
    // You would implement your rating logic here
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    
    // Simulate system status
    setSystemStatus('processing');
    setStatusMessages(prev => [...prev, {
      status: 'processing', 
      message: 'Processing your request...', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    
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
      
      setSystemStatus('completed');
      setStatusMessages(prev => [...prev, {
        status: 'completed', 
        message: 'Response generated', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  const handleVoiceInput = () => {
    // This would implement voice recognition
    // For demo purposes, just add a status message
    setStatusMessages(prev => [...prev, {
      status: 'processing', 
      message: 'Listening for voice input...', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    
    setTimeout(() => {
      setInputMessage("How would you rate my outfit style?");
      setStatusMessages(prev => [...prev, {
        status: 'completed', 
        message: 'Voice input captured', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c66ff]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-black h-250 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-grow flex flex-col md:flex-row">
          {/* Left side - Image display and upload options - Wider */}
          <div className="w-full md:w-3/5 p-4 h-full overflow-hidden">
            {/* Main image display */}
            <div className="relative h-[calc(93vh-130px)] w-full overflow-hidden rounded-lg shadow-sm">
              {imageUrl && (
                <div className="relative h-full w-full">
                  <img
                    src={imageUrl}
                    alt="Uploaded image"
                    className="object-contain w-full h-full"
                  />
                </div>
              )}
              
              {/* Image control toolbar */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-200 rounded-full" title="Zoom in">
                  <FiZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full" title="Zoom out">
                  <FiZoomOut className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full" title="Rotate">
                  <FiRotateCw className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full" title="Reset">
                  <FiRefreshCw className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full" title="Download">
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Upload options at the bottom, aligned to the left */}
            <div className="flex gap-4 mt-2 justify-start">
              {/* New upload button */}
              <div 
                className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={handleNewUpload}
              >
                <FiPlus className="w-6 h-6 text-[#8c66ff]" />
              </div>
              
              {/* Current image thumbnail */}
              {imageUrl && (
                <div className="w-16 h-16 bg-white rounded-lg border-2 border-[#8c66ff] overflow-hidden">
                  <img 
                    src={imageUrl}
                    alt="Current image" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileChange}
              />
              
              {/* Rate this result controls - moved from footer to here */}
              <div className="ml-auto flex items-center space-x-2 rounded-lg px-3 py-2 ">
                <span className="text-sm font-medium text-gray-700">Rate result</span>
                <button 
                  onClick={handleThumbsUp}
                  className="p-1 hover:bg-[#f5f0ff] rounded-full text-gray-700 hover:text-[#8c66ff] transition-colors"
                  title="Thumbs up"
                >
                  <FiThumbsUp className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button 
                  onClick={handleThumbsDown}
                  className="p-1 hover:bg-[#f5f0ff] rounded-full text-gray-700 hover:text-[#8c66ff] transition-colors"
                  title="Thumbs down"
                >
                  <FiThumbsDown className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button 
                  onClick={handleDeleteImage}
                  className="p-1 hover:bg-[#f5f0ff] rounded-full text-gray-700 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side - Chat interface */}
          <div className="w-full md:w-2/5 p-4 h-210 overflow-hidden">
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
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditComponent;
