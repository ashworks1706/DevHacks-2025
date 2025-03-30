'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: any) => void;
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
  { id: 'preppy', label: 'Preppy', description: 'Classic and polished' },
  { id: 'modern', label: 'Modern', description: 'Contemporary and sleek' }
];

// Define color options
const colorOptions = [
  'black', 'white', 'gray', 'navy', 'blue', 'red', 'green', 'yellow', 
  'purple', 'pink', 'brown', 'beige'
];

// Define pattern options
const patternOptions = [
  { id: 'stripes', label: 'Stripes' },
  { id: 'plaid', label: 'Plaid/Check' },
  { id: 'floral', label: 'Floral' },
  { id: 'solids', label: 'Solid Colors' },
  { id: 'polkadot', label: 'Polka Dots' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'animal', label: 'Animal Print' }
];

// Define material options
const materialOptions = [
  { id: 'cotton', label: 'Cotton' },
  { id: 'denim', label: 'Denim' },
  { id: 'leather', label: 'Leather' },
  { id: 'silk', label: 'Silk' },
  { id: 'wool', label: 'Wool' },
  { id: 'linen', label: 'Linen' },
  { id: 'synthetic', label: 'Synthetic (Polyester, Nylon)' },
  { id: 'knits', label: 'Knits' }
];

// Define wardrobe challenges
const challengeOptions = [
  { id: 'variety', label: 'Finding the right mix of pieces' },
  { id: 'coordination', label: 'Coordinating outfits' },
  { id: 'fit', label: 'Finding clothes that fit well' },
  { id: 'occasions', label: 'Dressing for different occasions' },
  { id: 'budget', label: 'Staying within budget' },
  { id: 'seasonal', label: 'Transitioning between seasons' }
];

// Budget ranges
const budgetOptions = [
  { id: 'budget', label: 'Budget conscious' },
  { id: 'moderate', label: 'Moderate spending' },
  { id: 'premium', label: 'Premium/luxury' },
  { id: 'mixed', label: 'Mix of price points' }
];

// Work environments
const workOptions = [
  { id: 'corporate', label: 'Corporate' },
  { id: 'casual', label: 'Casual' },
  { id: 'creative', label: 'Creative' },
  { id: 'remote', label: 'Remote/WFH' }
];

// Social lifestyle
const socialOptions = [
  { id: 'active', label: 'Active' },
  { id: 'relaxed', label: 'Relaxed' }
];

// Climate options
const climateOptions = [
  { id: 'warm', label: 'Warm' },
  { id: 'temperate', label: 'Temperate' },
  { id: 'cold', label: 'Cold' },
  { id: 'variable', label: 'Variable/Seasonal' }
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { user } = useUser();
  // State to track current step
  const [step, setStep] = useState(1);
  const totalSteps = 6; // Total number of steps in the onboarding process
  
  // Basic info
  const [name, setName] = useState(user?.firstName || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  
  // Style preferences
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [fashionInfluences, setFashionInfluences] = useState('');
  
  // Color preferences
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  
  // Patterns and materials
  const [preferredPatterns, setPreferredPatterns] = useState<string[]>([]);
  const [preferredMaterials, setPreferredMaterials] = useState<string[]>([]);
  
  // Lifestyle and budget
  const [wardrobeChallenges, setWardrobeChallenges] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState('');
  const [workEnvironment, setWorkEnvironment] = useState('');
  const [socialLifestyle, setSocialLifestyle] = useState('');
  const [climate, setClimate] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save preferences
      const preferences = {
        user_id: user?.id || 'guest',
        name: name || user?.firstName || 'User',
        age: parseInt(age) || null,
        gender,
        location,
        onboarding_responses: {
          favorite_colors: favoriteColors,
          dominant_colors: dominantColors,
          preferred_materials: preferredMaterials,
          preferred_patterns: preferredPatterns,
          style_preferences: stylePreferences,
          fashion_influences: fashionInfluences.split(',').map(item => item.trim()).filter(item => item),
          wardrobe_challenges: wardrobeChallenges,
          budget: budgetRange,
          lifestyle: {
            work: workEnvironment,
            social: socialLifestyle,
            climate: climate
          }
        },
        style_profile: {
          casual: stylePreferences.includes('casual') ? 80 : 20,
          formal: stylePreferences.includes('formal') ? 60 : 10,
          active: stylePreferences.includes('athletic') ? 70 : 10,
          pattern_variability: preferredPatterns.length > 2 ? "high" : "low",
          material_variety: preferredMaterials.length > 3 ? "high" : "medium"
        }
      };
      
      // Call the onComplete function with the preferences
      onComplete(preferences);
      onClose();
    }
  };

  const handleStyleSelection = (styleId: string) => {
    if (stylePreferences.includes(styleId)) {
      setStylePreferences(stylePreferences.filter(id => id !== styleId));
    } else {
      if (stylePreferences.length < 3) {
        setStylePreferences([...stylePreferences, styleId]);
      }
    }
  };

  const handlePatternSelection = (patternId: string) => {
    if (preferredPatterns.includes(patternId)) {
      setPreferredPatterns(preferredPatterns.filter(id => id !== patternId));
    } else {
      setPreferredPatterns([...preferredPatterns, patternId]);
    }
  };

  const handleMaterialSelection = (materialId: string) => {
    if (preferredMaterials.includes(materialId)) {
      setPreferredMaterials(preferredMaterials.filter(id => id !== materialId));
    } else {
      setPreferredMaterials([...preferredMaterials, materialId]);
    }
  };

  const handleColorSelection = (colorId: string) => {
    if (favoriteColors.includes(colorId)) {
      setFavoriteColors(favoriteColors.filter(id => id !== colorId));
    } else {
      setFavoriteColors([...favoriteColors, colorId]);
    }
  };

  const handleDominantColorSelection = (colorId: string) => {
    if (dominantColors.includes(colorId)) {
      setDominantColors(dominantColors.filter(id => id !== colorId));
    } else {
      setDominantColors([...dominantColors, colorId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="h-20 bg-gradient-to-r from-[#8c66ff] to-[#7b5cf0] flex items-center justify-center">
            <h1 className="text-white text-2xl pt-5 font-bold">Tell us about your style</h1>
          </div>
        </div>
        
        <div className="px-8 py-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-6">Let's start with some basic information</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-black focus:ring-[#8c66ff]"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age (optional)</label>
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c66ff]"
                    placeholder="Your age"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#8c66ff]"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">What gender describes you?</label>
                <div className="grid grid-cols-3 gap-4">
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
            </div>
          )}

          {/* Step 2: Style Preferences */}
          {step === 2 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Style Preferences</h2>
              <p className="text-black mb-6">Select up to 3 fashion styles you prefer</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {fashionStyles.map(style => (
                  <button
                    key={style.id}
                    className={`p-3 rounded-xl border-2 text-left transition-all text-black ${stylePreferences.includes(style.id) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleStyleSelection(style.id)}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm text-black">{style.description}</div>
                  </button>
                ))}
              </div>
              
              <div>
                <label htmlFor="fashionInfluences" className="block text-sm font-medium text-gray-700 mb-1">Who are your style icons or influencers?</label>
                <input
                  type="text"
                  id="fashionInfluences"
                  value={fashionInfluences}
                  onChange={(e) => setFashionInfluences(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#8c66ff]"
                  placeholder="Separate names with commas"
                />
              </div>
              
              <p className="text-sm text-black mt-2">
                Selected styles: {stylePreferences.length}/3
              </p>
            </div>
          )}
          
          {/* Step 3: Color Preferences */}
          {step === 3 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Color Preferences</h2>
              <p className="text-black mb-6">Tell us about your color preferences</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What are your favorite colors to wear?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`p-2 rounded-xl border-2 transition-all text-black ${favoriteColors.includes(color) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handleColorSelection(color)}
                      >
                        <div className="font-medium capitalize">{color}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Which colors dominate your current wardrobe?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`p-2 rounded-xl border-2 transition-all text-black ${dominantColors.includes(color) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handleDominantColorSelection(color)}
                      >
                        <div className="font-medium capitalize">{color}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Patterns & Materials */}
          {step === 4 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Patterns & Materials</h2>
              <p className="text-black mb-6">Tell us about your pattern and material preferences</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What patterns do you typically wear?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {patternOptions.map(pattern => (
                      <button
                        key={pattern.id}
                        className={`p-2 rounded-xl border-2 transition-all text-black ${preferredPatterns.includes(pattern.id) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handlePatternSelection(pattern.id)}
                      >
                        <div className="font-medium">{pattern.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Which fabrics or materials do you feel most comfortable in?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {materialOptions.map(material => (
                      <button
                        key={material.id}
                        className={`p-2 rounded-xl border-2 transition-all text-black ${preferredMaterials.includes(material.id) ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handleMaterialSelection(material.id)}
                      >
                        <div className="font-medium">{material.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Wardrobe Challenges & Budget */}
          {step === 5 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Wardrobe Challenges & Budget</h2>
              <p className="text-black mb-6">Tell us about your wardrobe challenges and budget</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="wardrobeChallenges" className="block text-sm font-medium text-gray-700 mb-1">What are your biggest wardrobe challenges?</label>
                  <textarea
                    id="wardrobeChallenges"
                    value={wardrobeChallenges}
                    onChange={(e) => setWardrobeChallenges(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-black focus:ring-2 focus:ring-[#8c66ff] h-24"
                    placeholder="E.g., finding variety, coordinating outfits, fit issues..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What is your typical budget for fashion purchases?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgetOptions.map(budget => (
                      <button
                        key={budget.id}
                        className={`p-3 rounded-xl border-2 transition-all text-black ${budgetRange === budget.id ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setBudgetRange(budget.id)}
                      >
                        <div className="font-medium">{budget.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 6: Lifestyle */}
          {step === 6 && (
            <div className="transition-all duration-300">
              <h2 className="text-xl font-semibold mb-2">Lifestyle Information</h2>
              <p className="text-black mb-6">Tell us about your lifestyle</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's your work environment like?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {workOptions.map(option => (
                      <button
                        key={option.id}
                        className={`p-3 rounded-xl border-2 transition-all text-black ${workEnvironment === option.id ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setWorkEnvironment(option.id)}
                      >
                        <div className="font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How would you describe your social lifestyle?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {socialOptions.map(option => (
                      <button
                        key={option.id}
                        className={`p-3 rounded-xl border-2 transition-all text-black ${socialLifestyle === option.id ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setSocialLifestyle(option.id)}
                      >
                        <div className="font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What climate do you primarily dress for?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {climateOptions.map(option => (
                      <button
                        key={option.id}
                        className={`p-3 rounded-xl border-2 transition-all text-black ${climate === option.id ? 'border-[#8c66ff] bg-[#f5f0ff]' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setClimate(option.id)}
                      >
                        <div className="font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, stepNumber) => (
                <div 
                  key={stepNumber}
                  className={`w-2 h-2 rounded-full ${
                    stepNumber + 1 === step ? 'bg-[#8c66ff]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm text-black">
              Step {step} of {totalSteps}
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
              disabled={(step === 1 && !gender)}
              className={`bg-[#8c66ff] text-white font-semibold py-2 px-8 rounded-full transition-colors ${
                (step === 1 && !gender) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#7b5cf0]'
              }`}
            >
              {step < totalSteps ? 'Continue' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}