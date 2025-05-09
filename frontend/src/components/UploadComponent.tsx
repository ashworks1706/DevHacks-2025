'use client';

import React, { useRef, useState, ChangeEvent, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

const UploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
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

  const saveFileToUserFolder = async (file: File) => {
    try {
      setUploadStatus('Uploading...');
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Get the saved file path from the response
      const data = await response.json();
      setUploadStatus('Upload successful!');
      
      return {
        filePath: data.filePath,
        sessionId: data.sessionId
      }; // Return both the path and session ID
    } catch (error) {
      console.error('Error saving file:', error);
      setUploadStatus('Upload failed. Please try again.');
      throw error;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setSelectedFileUrl(fileUrl);
      console.log("Selected file:", file);
      
      try {
        // Save the file to the user folder
        const { filePath, sessionId } = await saveFileToUserFolder(file);
        
        // Navigate to the edit page after a short delay with session ID
        setTimeout(() => {
          router.push(`/upload/edit?image=${encodeURIComponent(filePath)}&sessionId=${encodeURIComponent(sessionId)}`);
        }, 500);
      } catch (error) {
        // Error is already handled in saveFileToUserFolder
        console.error('Error in file upload flow:', error);
      }
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setSelectedFileUrl(fileUrl);
      console.log("Dropped file:", file);
      
      try {
        // Save the file to the user folder
        const { filePath, sessionId } = await saveFileToUserFolder(file);
        
        // Navigate to the edit page after a short delay with session ID
        setTimeout(() => {
          router.push(`/upload/edit?image=${encodeURIComponent(filePath)}&sessionId=${encodeURIComponent(sessionId)}`);
        }, 500);
      } catch (error) {
        // Error is already handled in saveFileToUserFolder
        console.error('Error in file drop upload flow:', error);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Improved sample image handler with proper file creation and upload
  const handleSampleImageClick = async (imagePath: string) => {
    try {
      setUploadStatus('Processing sample image...');
      console.log("Selected sample image:", imagePath);
      
      // Fetch the sample image as a blob
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error('Failed to fetch sample image');
      }
      
      const blob = await response.blob();
      
      // Extract image name from path
      const imageName = imagePath.split('/').pop() || 'sample.png';
      
      // Create a File object from the blob
      const file = new File([blob], imageName, { type: 'image/png' });
      
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setSelectedFileUrl(fileUrl);
      
      // Save the file to the user folder
      const { filePath, sessionId } = await saveFileToUserFolder(file);
      
      // Navigate to the edit page after a short delay with session ID
      setTimeout(() => {
        router.push(`/upload/edit?image=${encodeURIComponent(filePath)}&sessionId=${encodeURIComponent(sessionId)}`);
      }, 500);
    } catch (error) {
      console.error("Error handling sample image:", error);
      setUploadStatus('Failed to process sample image. Please try again.');
    }
  };

  return (
    <div className="bg-gray-100 text-black min-h-screen">
      <div className="w-full max-w-3xl mx-auto px-6 py-12">
        {/* Upload area */}
        <div className="space-y-4">
          <div 
            className={`p-15 rounded-3xl transition-colors w-full mx-auto min-h-[400px] ${isDragging ? 'border-2 border-[#8c66ff] bg-purple-50' : ''}`}
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
                  fill="#8c66ff"
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
              <h1 className="text-4xl font-extrabold text-black mb-8">
                  Upload a photo, discover your perfect outfit
              </h1>

              {/* Upload status message */}
              {uploadStatus && (
                <div className={`mb-4 px-4 py-2 rounded ${uploadStatus.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {uploadStatus}
                </div>
              )}
              
              {/* Upload button */}
              <button 
                className="cursor-pointer bg-[#8c66ff] text-white text-3xl font-semibold py-4 px-10 rounded-full mb-6 hover:bg-[#7c52f2] transition-colors"
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
                paste photo or <span className="text-[#8c66ff] underline cursor-pointer">URL</span>
              </p>
              
              {/* Display selected file */}
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-200 rounded-lg w-full">
                  <div className="flex items-center">
                    <div className="bg-[#8c66ff] p-2 rounded mr-3">
                      <FiUpload className="text-white" />
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
              No photos? Try one of these:
            </p>
            <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className="cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => handleSampleImageClick(`/images/test_pic${num}.png`)}
                >
                  <Image 
                    src={`/images/test_pic${num}.png`}
                    alt={`Sample outfit ${num}`}
                    width={100} 
                    height={100} 
                    className="rounded-2xl object-cover w-20 h-20 border-2 border-[#8c66ff] shadow-md hover:shadow-[0_0_10px_rgba(140,102,255,0.5)] transition-shadow duration-300"
                  />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-xs">Use this</span>
                  </div>
                </div>
              ))}
            </div>
          
            {/* Terms of Service */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              By uploading a photo or URL you agree to our{' '}
              <Link href="/terms" className="text-[#8c66ff] underline">Terms of Service</Link>.
              To learn more about how Lux handles your personal data, check our{' '}
              <Link href="/privacy" className="text-[#8c66ff] underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;