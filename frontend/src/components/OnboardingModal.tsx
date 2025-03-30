'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define fashion style options
const fashionStyles = [
  { id: 'casual', label: 'Casual', description: 'Comfortable everyday wear' },
  { id: 'formal', label: 'Formal', description: 'Professional and elegant' },
  { id: 'streetwear', label: 'Streetwear', description: 'Urban and trendy' },
  { id: 'bohemian', label: 'Bohemian', description: 'Free-spirited and artistic' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean and simple' },
  { id: 'vintage', label: 'Vintage', description: 'Inspired by past decades' },
  { id: 'athletic', label: 'Athletic', description: 'Sporty and functional' },
  { id: 'preppy', label: 'Preppy', description: 'Classic and polished' }
];

// Define seasons for preference selection
const seasons = [
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'fall', label: 'Fall' },
  { id: 'winter', label: 'Winter' }
];

// Define color preferences
const colorPreferences = [
  { id: 'neutral', label: 'Neutral (Blacks, Whites, Beiges)' },
  { id: 'earthy', label: 'Earthy (Browns, Greens, Terracotta)' },
  { id: 'bold', label: 'Bold (Bright colors, Contrasting)' },
  { id: 'pastel', label: 'Pastel (Soft, Light colors)' },
  { id: 'monochrome', label: 'Monochrome (Various shades of one color)' }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  // State to track current step
  const [step, setStep] = useState(1);
  
  // State for user selections
  const [gender, setGender] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [favoriteSeasons, setFavoriteSeasons] = useState<string[]>([]);
  const [colorPreference, setColorPreference] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save preferences
      const preferences = {
        gender,
        preferredStyles,
        favoriteSeasons,
        colorPreference
      };
      
      // Here you would typically save these preferences to your backend or local storage
      console.log('User preferences:', preferences);
      localStorage.setItem('user-fashion-preferences', JSON.stringify(preferences));
      
      onClose();
    }
  };

  const handleStyleSelection = (styleId: string) => {
    if (preferredStyles.includes(styleId)) {
      setPreferredStyles(preferredStyles.filter(id => id !== styleId));
    } else {
      if (preferredStyles.length < 3) {
        setPreferredStyles([...preferredStyles, styleId]);
      }
    }
  };

  const handleSeasonSelection = (seasonId: string) => {
    if (favoriteSeasons.includes(seasonId)) {
      setFavoriteSeasons(favoriteSeasons.filter(id => id !== seasonId));
    } else {
      setFavoriteSeasons([...favoriteSeasons, seasonId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="h-20 bg-gradient-to-r from-[#8c66ff] to-[#7b5cf0] flex items-center justify-center">
            <h1 className="text-white text-2xl font-bold">Tell us about your style</h1>
          </div>
        </div>
        
        <div className="px-8 py-6">
          {/* Step 1: Gender */}
          {step === 1 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-6">What best describes you?</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                  className={`p-4 rounded-xl border-2 flex text-black flex-col items-center justify-center h-32 transition-all ${gender === 'male' ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setGender('male')}
                >
                  <span className="text-4xl mb-2">👔</span>
                  <span className="font-medium">Male</span>
                </button>
                <button
                  className={`p-4 rounded-xl border-2 flex text-black flex-col items-center justify-center h-32 transition-all ${gender === 'female' ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setGender('female')}
                >
                  <span className="text-4xl mb-2">👗</span>
                  <span className="font-medium">Female</span>
                </button>
                <button
                  className={`p-4 rounded-xl border-2 flex text-black flex-col items-center justify-center h-32 transition-all ${gender === 'nonbinary' ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => setGender('nonbinary')}
                >
                  <span className="text-4xl mb-2">👕</span>
                  <span className="font-medium">Non-binary</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fashion Styles */}
          {step === 2 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Select up to 3 fashion styles you prefer</h2>
              <p className="text-black mb-6">This helps us personalize your outfit recommendations</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {fashionStyles.map(style => (
                  <button
                    key={style.id}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-black ${preferredStyles.includes(style.id) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleStyleSelection(style.id)}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm text-black">{style.description}</div>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-black">
                Selected: {preferredStyles.length}/3
              </p>
            </div>
          )}

          {/* Step 3: Seasonal Preferences */}
          {step === 3 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Which seasons do you want to focus on?</h2>
              <p className="text-black mb-6">Select all that apply</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {seasons.map(season => (
                  <button
                    key={season.id}
                    className={`p-4 rounded-xl border-2 text-black flex items-center transition-all ${favoriteSeasons.includes(season.id) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleSeasonSelection(season.id)}
                  >
                    <span className="text-2xl mr-3">
                      {season.id === 'spring' && '🌸'}
                      {season.id === 'summer' && '☀️'}
                      {season.id === 'fall' && '🍂'}
                      {season.id === 'winter' && '❄️'}
                    </span>
                    <span className="font-medium">{season.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Color Preferences */}
          {step === 4 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">What color palette matches your style?</h2>
              <p className="text-black mb-6">Choose the one you gravitate towards most</p>
              
              <div className="space-y-3 mb-8">
                {colorPreferences.map(color => (
                  <button
                    key={color.id}
                    className={`p-4 w-full rounded-xl border-2 text-left text-black transition-all ${colorPreference === color.id ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setColorPreference(color.id)}
                  >
                    <div className="font-medium">{color.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div 
                  key={stepNumber}
                  className={`w-2 h-2 rounded-full ${
                    stepNumber === step ? 'bg-[#8c66ff]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm text-black">
              Step {step} of 4
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="border border-gray-300 text-black font-medium py-2 px-6 rounded-full hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            <button
              onClick={handleNext}
              disabled={(step === 1 && !gender) || 
                      (step === 2 && preferredStyles.length === 0) || 
                      (step === 4 && !colorPreference)}
              className={`bg-[#8c66ff] text-white font-semibold py-2 px-8 rounded-full transition-colors ${
                ((step === 1 && !gender) || 
                (step === 2 && preferredStyles.length === 0) || 
                (step === 4 && !colorPreference)) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#7b5cf0]'
              }`}
            >
              {step < 4 ? 'Continue' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}