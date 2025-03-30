'use client';

import { ReactNode } from 'react';
import OnboardingModal from './OnboardingModal';
import { useOnboarding } from './OnboardingContext';

interface PreferencesWrapperProps {
  children: ReactNode;
}

export default function PreferencesWrapper({ children }: PreferencesWrapperProps) {
  const { showPreferencesModal, closePreferencesModal } = useOnboarding();

  return (
    <>
      {children}
      <OnboardingModal isOpen={showPreferencesModal} onClose={closePreferencesModal} />
    </>
  );
}