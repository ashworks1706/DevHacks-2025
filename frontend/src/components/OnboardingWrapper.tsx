'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/components/OnboardingContext';
import OnboardingModal from '@/components/OnboardingModal';

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { showPreferencesModal, closePreferencesModal, setUserPreferences } = useOnboarding();
  
  const handleCompleteOnboarding = (preferences: any) => {
    setUserPreferences(preferences);
    closePreferencesModal();
  };
  
  return (
    <>
      {children}
      
      <OnboardingModal 
        isOpen={showPreferencesModal} 
        onClose={closePreferencesModal}
        onComplete={handleCompleteOnboarding}
      />
    </>
  );
}