import React from 'react';
import Navbar from '@/components/Navbar';

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      
      {children}
      {/* Footer is intentionally omitted */}
    </>
  );
}