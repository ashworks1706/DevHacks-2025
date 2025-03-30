'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface FashionPreferences {
  gender: string;
  preferredStyles: string[];
  favoriteSeasons: string[];
  colorPreference: string;
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
      // Check if the user has already set preferences
      const savedPreferences = localStorage.getItem(`fashion-preferences-${user.id}`);
      
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      } else {
        // Show the preferences modal for new users
        setShowPreferencesModal(true);
      }
    }
  }, [isSignedIn, user]);

  const closePreferencesModal = () => {
    setShowPreferencesModal(false);
  };

  const saveUserPreferences = (preferences: FashionPreferences) => {
    setUserPreferences(preferences);
    
    if (user) {
      localStorage.setItem(`fashion-preferences-${user.id}`, JSON.stringify(preferences));
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