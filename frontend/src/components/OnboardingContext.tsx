'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import fs from 'fs';
import path from 'path';

// Updated interface to match all the required onboarding questions
interface StyleInfo {
  overallStyle: string[];
  styleIcons: string[];
  styleConsistency: string;
}

interface ColorInfo {
  favoriteColors: string[];
  dominantColors: string[];
  avoidedColors: string[];
}

interface PatternsAndMaterials {
  preferredPatterns: string[];
  preferredMaterials: string[];
  avoidedPatternsAndMaterials: string[];
}

interface WardrobeInfo {
  wardrobeVariety: string;
  updateFrequency: string;
  frequentlyWornItems: string[];
}

interface LifestyleInfo {
  dressOccasions: string[];
  dailyInfluence: string;
  wardrobeChallenges: string[];
}

interface BudgetInfo {
  budgetRange: string;
  investmentPreference: string;
}

interface UserStyleProfile {
  casual: number;
  formal: number;
  active: number;
  pattern_variability: string;
  material_variety: string;
}

interface FashionPreferences {
  user_id: string;
  name: string;
  age?: number;
  gender: string;
  location?: string;
  onboarding_responses: {
    styleInfo: StyleInfo;
    colorInfo: ColorInfo;
    patternsAndMaterials: PatternsAndMaterials;
    wardrobeInfo: WardrobeInfo;
    lifestyleInfo: LifestyleInfo;
    budgetInfo: BudgetInfo;
  };
  style_profile: UserStyleProfile;
}

interface OnboardingContextType {
  showPreferencesModal: boolean;
  closePreferencesModal: () => void;
  userPreferences: FashionPreferences | null;
  setUserPreferences: (preferences: FashionPreferences) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, user } = useUser();
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState<FashionPreferences | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      // Try to load user preferences from server
      const fetchUserPreferences = async () => {
        try {
          const response = await fetch(`/api/user-preferences?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserPreferences(data);
          } else {
            // Show the preferences modal for new users
            setShowPreferencesModal(true);
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
          // Fallback to localStorage if API call fails
          const savedPreferences = localStorage.getItem(`fashion-preferences-${user.id}`);
          if (savedPreferences) {
            setUserPreferences(JSON.parse(savedPreferences));
          } else {
            // Show the preferences modal for new users
            setShowPreferencesModal(true);
          }
        }
      };

      fetchUserPreferences();
    }
  }, [isSignedIn, user]);

  const closePreferencesModal = () => {
    setShowPreferencesModal(false);
  };

  const saveUserPreferences = async (preferences: FashionPreferences) => {
    setUserPreferences(preferences);
    
    if (user) {
      // Save to localStorage as backup
      localStorage.setItem(`fashion-preferences-${user.id}`, JSON.stringify(preferences));
      
      // Save to server
      try {
        const response = await fetch('/api/user-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        });
        
        if (!response.ok) {
          console.error('Failed to save preferences to server');
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        showPreferencesModal, 
        closePreferencesModal, 
        userPreferences,
        setUserPreferences: saveUserPreferences
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}