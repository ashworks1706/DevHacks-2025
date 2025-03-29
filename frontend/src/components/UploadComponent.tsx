'use client';

import React, { useRef, useState, ChangeEvent, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

const UploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const didOpenRef = useRef(false);

  // Handle auto-open once, then clear the URL parameter
  useEffect(() => {
    const autoOpen = searchParams.get('autoOpen');
    
    // Only run this once per component mount
    if (autoOpen === 'true' && !didOpenRef.current && fileInputRef.current) {
      didOpenRef.current = true;
      setTimeout(() => {
        fileInputRef.current?.click();
        const url = new URL(window.location.href);
        url.searchParams.delete('autoOpen');
        window.history.replaceState({}, '', url.toString());
      }, 100);
    }
  }, [searchParams]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      console.log("Dropped file:", e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-100 text-black min-h-screen">
      <div className="w-full max-w-xl mx-auto px-6 py-12">
        {/* Upload area */}
        <div className="space-y-4">
          <div 
            className={`p-15 rounded-3xl transition-colors w-full mx-auto min-h-[400px]  ${isDragging ? 'border-2 border-green-500' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Plus icon */}
              <div className="flex justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#22c55e"
                  className="w-12 h-12"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl font-bold text-black mb-8">
                Upload a photo<br />
              </h1>
              
              {/* Upload button */}
              <button 
                className="cursor-pointer bg-green-600 text-white text-3xl font-semibold py-4 px-10 rounded-full mb-6 hover:bg-green-500 transition-colors"
                onClick={handleUploadClick}
              >
                Upload Photo
              </button>
              
              <input 
                ref={fileInputRef}
                id="file-upload" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileChange}
              />
              
              {/* Alternative text */}
              <p className="text-black text-2xl mb-1 font-semibold">
                or drop a file,
              </p>
              
              {/* URL option */}
              <p className="text-black mb-6">
                paste photo or <span className="text-green-400 underline cursor-pointer">URL</span>
              </p>
              
              {/* Display selected file */}
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-200 rounded-lg w-full">
                  <div className="flex items-center">
                    <div className="bg-green-500 p-2 rounded mr-3">
                      <FiUpload className="text-black" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample outfits section */}
          <div className="max-w-sm mx-auto mt-1">
            <p className="text-gray-600 text-lg font-semibold text-center mb-2">
              No photos? Try one of these sample outfits:
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <Image 
                  src="/images/test_pic1.png" 
                  alt="Sample outfit" 
                  width={100} 
                  height={100} 
                  className="rounded-2xl object-cover w-20 h-20"
                />
              </div>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <Image 
                  src="/images/test_pic2.png" 
                  alt="Sample outfit" 
                  width={100} 
                  height={100} 
                  className="rounded-2xl object-cover w-20 h-20"
                />
              </div>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <Image 
                  src="/images/test_pic3.png" 
                  alt="Sample outfit" 
                  width={100} 
                  height={100} 
                  className="rounded-2xl object-cover w-20 h-20"
                />
              </div>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <Image 
                  src="/images/test_pic4.png" 
                  alt="Sample outfit" 
                  width={100} 
                  height={100} 
                  className="rounded-2xl object-cover w-20 h-20"
                />
              </div>
            </div>
          
            {/* Terms of Service */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              By uploading a photo or URL you agree to our{' '}
              <Link href="/terms" className="text-green-400 underline">Terms of Service</Link>.
              To learn more about how FashionAI handles your personal data, check our{' '}
              <Link href="/privacy" className="text-green-400 underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
