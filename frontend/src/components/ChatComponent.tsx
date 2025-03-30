'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FiUpload, FiMic, 
  FiCheck, FiLoader, FiClock,
  FiSend, FiPlus, FiSettings,
  FiX
} from 'react-icons/fi';

// Add TypeScript declarations for the Web Speech API
// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
}

// Define the constructor
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface ChatComponentProps {
  systemStatus: 'idle' | 'processing' | 'completed' | 'error';
  statusMessages: {status: string; message: string; time: string}[];
  userId?: string; // Optional user ID for saving recordings
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  audioUrl?: string; // URL to the audio file if message was recorded
  filePath?: string; // Server path to the audio file
  sessionId?: string; // Session ID for the recording
}

interface VoiceState {
  isRecording: boolean;
  isPaused: boolean;
  transcript: string;
  audioBlob?: Blob;
  audioUrl?: string;
  filePath?: string;
  sessionId?: string;
  recordingTime: number;
}

interface UserRecording {
  id: number;
  timestamp: string;
  fileName: string;
  transcript: string;
  audioUrl?: string; // URL to the audio file
  filePath?: string; // Server path to the audio file
  sessionId?: string; // Session ID for the recording
}

interface UploadResponse {
  success: boolean;
  filePath: string;
  userId: string;
  sessionId: string;
  repliesFile: string;
  responsesFile: string;
}

// Define SpeechRecognition event types
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  emma?: Document;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

const ChatComponent = ({ systemStatus, statusMessages, userId = 'anonymous' }: ChatComponentProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: 'Hello! I\'m your Lux assistant. I can analyze your outfit and provide recommendations. What would you like to know?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [userRecordings, setUserRecordings] = useState<UserRecording[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isPaused: false,
    transcript: '',
    recordingTime: 0
  });
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recordings when component mounts or userId changes
  useEffect(() => {
    const recordings = loadUserRecordings();
    setUserRecordings(recordings);
    console.log(`Loaded ${recordings.length} recordings for user:`, userId);
  }, [userId]);

  // Handle scrolling when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  // Initialize Web Speech API if available
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // Update the voice state with the new transcript
        setVoiceState(prev => ({ ...prev, transcript }));
        
        // Update the input field in real-time with the new transcript
        if (inputRef.current) {
          inputRef.current.textContent = transcript;
          setInputMessage(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        stopRecording();
      };
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Load user recordings from storage
  const loadUserRecordings = (): UserRecording[] => {
    try {
      const recordings = JSON.parse(localStorage.getItem(`voiceRecordings-${userId}`) || '[]');
      return recordings;
    } catch (error) {
      console.error('Error loading user recordings:', error);
      return [];
    }
  };

  // Start recording function
  const startRecording = async () => {
    try {
      // Clear the existing input text when starting a new recording
      setInputMessage('');
      if (inputRef.current) {
        inputRef.current.textContent = '';
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up MediaRecorder for audio saving
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // If transcript is available, set it as input message
        if (voiceState.transcript) {
          setInputMessage(voiceState.transcript);
          if (inputRef.current) {
            inputRef.current.textContent = voiceState.transcript;
            
            // Focus the input field to make it ready for sending
            inputRef.current.focus();
          }
        }
        
        // Close the media stream
        stream.getTracks().forEach(track => track.stop());
        
        // Save the recording to the server and update state
        const savedRecording = await uploadRecording(audioBlob, voiceState.transcript);
        
        if (savedRecording) {
          setVoiceState(prev => ({
            ...prev,
            isRecording: false,
            audioBlob,
            audioUrl,
            filePath: savedRecording.filePath,
            sessionId: savedRecording.sessionId
          }));
        } else {
          // Fallback if server upload fails - still keep local URL
          setVoiceState(prev => ({
            ...prev,
            isRecording: false,
            audioBlob,
            audioUrl
          }));
        }
      };
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Start recording
      mediaRecorderRef.current.start();
      
      // Start timer for recording time display
      timerRef.current = setInterval(() => {
        setVoiceState(prev => ({
          ...prev,
          recordingTime: prev.recordingTime + 1
        }));
      }, 1000);
      
      setVoiceState({
        isRecording: true,
        isPaused: false,
        transcript: '',
        recordingTime: 0
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Show error in status messages
      handleStatusUpdate('error', 'Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // If there's transcript text, make sure it gets into the input field
    if (voiceState.transcript && inputRef.current) {
      setInputMessage(voiceState.transcript);
      inputRef.current.textContent = voiceState.transcript;
    }
  };

  // Upload recording to server
  const uploadRecording = async (audioBlob: Blob, transcript: string): Promise<{filePath: string, sessionId: string} | null> => {
    try {
      setIsUploading(true);
      handleStatusUpdate('processing', 'Uploading voice recording...');
      
      // Create a file from the blob
      const fileName = `recording-${Date.now()}.mp3`;
      const audioFile = new File([audioBlob], fileName, { type: 'audio/mp3' });
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', audioFile);
      
      // Add transcript as metadata
      formData.append('transcript', transcript || '');
      
      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }
      
      const responseData: UploadResponse = await response.json();
      
      // Create recording object
      const newRecording: UserRecording = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fileName: fileName,
        transcript: transcript || '',
        audioUrl: URL.createObjectURL(audioBlob),
        filePath: responseData.filePath,
        sessionId: responseData.sessionId
      };
      
      // Add to user recordings in state
      const updatedRecordings = [...userRecordings, newRecording];
      setUserRecordings(updatedRecordings);
      
      // Store in localStorage by user ID
      localStorage.setItem(`voiceRecordings-${userId}`, JSON.stringify(updatedRecordings));
      
      handleStatusUpdate('completed', `Voice recording saved for user: ${userId}`);
      setIsUploading(false);
      
      return {
        filePath: responseData.filePath,
        sessionId: responseData.sessionId
      };
    } catch (error) {
      console.error('Error uploading recording:', error);
      handleStatusUpdate('error', 'Failed to upload recording to server');
      setIsUploading(false);
      
      // Save locally as fallback
      const newRecording: UserRecording = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fileName: `recording-${Date.now()}.mp3`,
        transcript: transcript || '',
        audioUrl: URL.createObjectURL(audioBlob)
      };
      
      // Add to user recordings in state
      const updatedRecordings = [...userRecordings, newRecording];
      setUserRecordings(updatedRecordings);
      
      // Store in localStorage by user ID
      localStorage.setItem(`voiceRecordings-${userId}`, JSON.stringify(updatedRecordings));
      
      return null;
    }
  };

  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add status update
  const handleStatusUpdate = (status: string, message: string) => {
    // This function would be called to update status messages in a real app
    console.log(`Status: ${status}, Message: ${message}`);
  };

  const handleSendMessage = async () => {
    // Don't send if there's no content or if AI is already responding
    if ((!inputMessage.trim() && !voiceState.audioUrl) || isAiTyping || isUploading) return;
    
    // If we're still recording, stop the recording first
    if (voiceState.isRecording) {
      stopRecording();
      // Wait a brief moment for the recording to process
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Prepare message content
    const messageContent = inputMessage.trim() || voiceState.transcript || 'Voice message';
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      content: messageContent,
      audioUrl: voiceState.audioUrl,
      filePath: voiceState.filePath,
      sessionId: voiceState.sessionId
    }]);
    
    // Clear input and reset contentEditable div
    setInputMessage('');
    if (inputRef.current) {
      inputRef.current.textContent = '';
    }
    
    // Reset voice state
    setVoiceState({
      isRecording: false,
      isPaused: false,
      transcript: '',
      recordingTime: 0
    });
    
    // Show AI is typing
    setIsAiTyping(true);
    
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
      setIsAiTyping(false);
      setChatMessages(prev => [...prev, { role: 'ai', content: randomResponse }]);
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (voiceState.isRecording) {
      stopRecording();
    } else {
      // Clear existing text before starting a new recording
      setInputMessage('');
      if (inputRef.current) {
        inputRef.current.textContent = '';
      }
      startRecording();
    }
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Status bar */}
      <div className="border-b border-gray-200 py-3 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Lux Assistant</h2>
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
              
              {/* Show audio player if message has audio */}
              {message.audioUrl && (
                <div className="mt-2">
                  <audio src={message.audioUrl} controls className="w-full h-8" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show typing indicator when AI is responding */}
        {isAiTyping && <TypingIndicator />}
      </div>
      
      {/* System status log */}
      {statusMessages.length > 0 && (
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
      )}
      
      {/* User Recordings Count - Shows how many recordings this user has */}
      {userRecordings.length > 0 && (
        <div className="border-t border-gray-200 py-1 px-4 bg-gray-50">
          <div className="text-xs text-gray-500 flex items-center">
            <FiMic className="mr-1 text-[#8c66ff]" size={12} /> 
            <span>{userRecordings.length} voice recording{userRecordings.length !== 1 ? 's' : ''} saved for {userId}</span>
          </div>
        </div>
      )}
      
      {/* Voice recording indicator */}
      {voiceState.isRecording && (
        <div className="border-t border-gray-200 py-2 px-4 bg-[#fdecec] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Recording... {formatTime(voiceState.recordingTime)}
            </span>
          </div>
          <div className="space-x-2 flex">
            <button 
              onClick={stopRecording}
              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <FiCheck size={14} />
            </button>
            <button 
              onClick={() => {
                stopRecording();
                setVoiceState({
                  isRecording: false,
                  isPaused: false,
                  transcript: '',
                  recordingTime: 0
                });
              }}
              className="bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}
      
      {/* Upload status indicator */}
      {isUploading && (
        <div className="border-t border-gray-200 py-2 px-4 bg-[#f0f7ff] flex items-center">
          <div className="animate-spin mr-2">
            <FiLoader className="text-[#8c66ff]" />
          </div>
          <span className="text-sm text-gray-700">Saving recording to your folder...</span>
        </div>
      )}
      
      {/* Voice transcript preview */}
      {voiceState.isRecording && voiceState.transcript && (
        <div className="border-t border-gray-200 py-2 px-4 bg-white">
          <div className="text-sm text-gray-700 italic">
            "{voiceState.transcript}"
          </div>
        </div>
      )}
      
      {/* Chat input - Styled like Claude's UI */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative flex items-center py-3">
          {/* Voice input button - Left side */}
          <button 
            onClick={handleVoiceInput}
            className={`icon-button ${voiceState.isRecording ? 'bg-red-50 text-red-500' : 'text-[#8c66ff] hover:text-[#7c52f2]'} transition-colors relative`}
            disabled={isAiTyping || isUploading}
          >
            <span className={`absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 ${voiceState.isRecording ? 'hover:bg-red-100' : 'hover:bg-purple-50'} hover:opacity-100`}></span>
            <FiMic className={`w-5 h-5 stroke-current relative z-10 ${voiceState.isRecording ? 'animate-pulse' : ''}`} />
          </button>
          
          {/* Contenteditable div instead of input */}
          <div
            ref={inputRef}
            role="textbox"
            contentEditable={!isAiTyping && !voiceState.isRecording && !isUploading}
            data-placeholder={
              isUploading ? "Saving recording..." :
              voiceState.isRecording ? "Listening..." : 
              "How can I help you today?"
            }
            className="flex-1 outline-none bg-transparent ml-3 text-gray-700 min-h-[24px] max-h-[120px] overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            suppressContentEditableWarning={true}
            onInput={(e) => setInputMessage(e.currentTarget.textContent || '')}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            style={{ 
              wordBreak: 'break-word', 
              cursor: (isAiTyping || voiceState.isRecording || isUploading) ? 'not-allowed' : 'text' 
            }}
          ></div>
          
          {/* Plus/Upload button - Right side */}
          <button
            className="icon-button text-[#8c66ff] hover:text-[#7c52f2] ml-3 transition-colors relative"
            disabled={isAiTyping || voiceState.isRecording || isUploading}
          >
            <span className="absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 hover:opacity-100 hover:bg-purple-50"></span>
            <FiPlus className="w-5 h-5 stroke-current relative z-10" />
          </button>
          
          {/* Send button - Right side */}
          <button
            onClick={handleSendMessage}
            className={`icon-button ml-3 ${
              (isAiTyping || (!inputMessage && !voiceState.transcript) || isUploading) 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-[#8c66ff] hover:text-[#7c52f2]'
            } transition-colors relative`}
            disabled={isAiTyping || (!inputMessage && !voiceState.transcript) || isUploading}
          >
            <span className={`absolute inset-0 rounded-full bg-transparent transition-opacity opacity-0 ${
              (isAiTyping || (!inputMessage && !voiceState.transcript) || isUploading) 
                ? '' 
                : 'hover:opacity-100 hover:bg-purple-50'
            }`}></span>
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