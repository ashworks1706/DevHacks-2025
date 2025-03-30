import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get the userId from auth()
    const { userId } = await auth();
    
    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    let folderPath: string;
    let relativePath: string;
    
    if (userId) {
      // For authenticated users - store in their personal folder
      folderPath = path.join(process.cwd(), 'public', 'users', userId);
      
      // Create user directory if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      // Create a relative path to use in the application
      relativePath = `/users/${userId}/${fileName}`;
    } else {
      // For non-authenticated users - store in a temporary folder
      folderPath = path.join(process.cwd(), 'public', 'temp');
      
      // Create temp directory if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const tempId = uuidv4(); // Generate a temporary ID for the guest
      const fileName = `${tempId}.${fileExtension}`;
      
      // Create a relative path to use in the application
      relativePath = `/temp/${fileName}`;
    }
    
    const filePath = path.join(folderPath, path.basename(relativePath));
    
    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write the file to disk
    fs.writeFileSync(filePath, buffer);
    
    return NextResponse.json(
      { 
        success: true,
        filePath: relativePath,
        userId: userId || 'guest'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false, // Disables body parsing, as we're using formData
  },
};