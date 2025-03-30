import React from 'react';
import ImageEditComponent from '../../../components/ImageEditComponent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Photo - Lux',
  description: 'Edit your photo and get AI-powered outfit recommendations',
};

export default function EditPage() {
  return <ImageEditComponent />;
}
