import React from 'react';
import UploadComponent from '../../components/UploadComponent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Photo - FashionAI',
  description: 'Upload your photo for AI-powered outfit recommendations',
};

export default function UploadPage() {
  return <UploadComponent />;
}