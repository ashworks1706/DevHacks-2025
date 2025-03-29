import React from 'react';
import UploadComponent from '../../components/UploadComponent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Video - RacketVision',
  description: 'Upload your tennis video for AI analysis and feedback',
};

export default function UploadPage() {
  return <UploadComponent />;
}