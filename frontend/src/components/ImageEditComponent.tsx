'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FiDownload, FiZoomIn, FiZoomOut, FiRotateCw, FiRefreshCw, 
  FiTrash2, FiThumbsUp, FiThumbsDown, FiPlus
} from 'react-icons/fi';
import ChatComponent from './ChatComponent';

const ImageEditComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [systemStatus, setSystemStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [statusMessages, setStatusMessages] = useState<{status: string; message: string; time: string}[]>([
    {status: 'completed', message: 'Image loaded successfully', time: '10:30 AM'},
    {status: 'completed', message: 'Analysis initialized', time: '10:30 AM'},
  ]);
  
  // Image control states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
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

  const handleNewUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);
      
      // Reset image controls
      setZoom(1);
      setRotation(0);
      
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
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Positive feedback recorded', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleThumbsDown = () => {
    console.log("User rated this result negatively");
    // You would implement your rating logic here
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Negative feedback recorded', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  // Image control functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Zoomed in', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1)); // Prevent zooming out past default level (1)
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Zoomed out', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Image rotated', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setStatusMessages(prev => [...prev, {
      status: 'completed', 
      message: 'Image reset', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'fashionai_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatusMessages(prev => [...prev, {
        status: 'completed', 
        message: 'Image downloaded', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
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
          <div className="w-full md:w-3/5 p-4 h-full overflow-hidden pb-5 ">
            {/* Main image display */}
            <div className="relative h-[calc(93vh-130px)] w-full overflow-hidden rounded-lg shadow-sm bg-black">
              {imageUrl && (
                <div className="relative h-full w-full flex items-center justify-center bg-black">
                  <img
                    src={imageUrl}
                    alt="Uploaded image"
                    className="w-full h-full object-cover transition-all duration-200 rounded-lg"
                    style={{ 
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Upload options and controls at the bottom, all in one row */}
            <div className="flex gap-4 mt-2 items-center justify-between ">
              {/* Left section - Upload controls */}
              <div className="flex items-center gap-4">
                {/* New upload button */}
                <div 
                  className="w-16 h-16 bg-[#d2c3ff] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#8c66ff] transition-colors"
                  onClick={handleNewUpload}
                >
                  <FiPlus className="w-6 h-6 text-[#f3f3f3]" />
                </div>
                
                {/* Current image thumbnail */}
                {imageUrl && (
                  <div className="w-16 h-16 bg-black rounded-lg border-2 border-[#8c66ff] overflow-hidden">
                    <img 
                      src={imageUrl}
                      alt="Current image" 
                      className="w-full h-full object-cover rounded-lg"
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
              </div>
              
              {/* Middle section - Image controls */}
              <div className="flex items-center space-x-3 rounded-lg py-2 px-4">
                <button 
                  className="p-1 hover:bg-[#f5f0ff] rounded-full flex items-center hover:text-[#8c66ff] transition-colors"
                  title="Zoom in"
                  onClick={handleZoomIn}
                >
                  <FiZoomIn className="w-5 h-5" />
                </button>
                <button 
                  className="p-1 hover:bg-[#f5f0ff] rounded-full flex items-center hover:text-[#8c66ff] transition-colors"
                  title="Zoom out"
                  onClick={handleZoomOut}
                >
                  <FiZoomOut className="w-5 h-5" />
                </button>
                <button 
                  className="p-1 hover:bg-[#f5f0ff] rounded-full flex items-center hover:text-[#8c66ff] transition-colors"
                  title="Rotate"
                  onClick={handleRotate}
                >
                  <FiRotateCw className="w-5 h-5" />
                </button>
                <button 
                  className="p-1 hover:bg-[#f5f0ff] rounded-full flex items-center hover:text-[#8c66ff] transition-colors"
                  title="Reset"
                  onClick={handleReset}
                >
                  <FiRefreshCw className="w-5 h-5" />
                </button>
                <button 
                  className="p-1 hover:bg-[#f5f0ff] rounded-full flex items-center hover:text-[#8c66ff] transition-colors"
                  title="Download"
                  onClick={handleDownload}
                >
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
              
              {/* Right section - Rating controls */}
              <div className="flex items-center space-x-2 rounded-lg px-3 py-2">
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
            <ChatComponent 
              systemStatus={systemStatus}
              statusMessages={statusMessages}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditComponent;