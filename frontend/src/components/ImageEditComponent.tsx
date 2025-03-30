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

  // Image control functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));

  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1)); // Prevent zooming out past default level (1)
    
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
   
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'fashionai_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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
                    className="w-full h-full object-contain transition-all duration-200 rounded-lg"
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditComponent;