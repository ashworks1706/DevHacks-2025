import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth, currentUser } from '@clerk/nextjs/server';

const ensureUserDir = (userId: string) => {
  // Create the user directory path in the public folder
  const userDir = path.join(process.cwd(), 'public', 'users', userId);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  return userDir;
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get('userId');
    
    if (queryUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const userDir = ensureUserDir(userId);
    const filePath = path.join(userDir, `preferences.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }
    
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const preferences = JSON.parse(fileData);
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error retrieving user preferences:', error);
    return NextResponse.json({ error: 'Failed to retrieve user preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the userId from auth()
    const { userId } = await auth();
    const user = await currentUser();
    
    // Get the preferences from the request body
    const requestData = await request.json();
    
    // Handle guest users with generated IDs
    let actualUserId: string;
    
    if (!userId && requestData.user_id.startsWith('guest-')) {
      // Use the guest ID from the request
      actualUserId = requestData.user_id;
    } else if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    } else {
      actualUserId = userId;
    }
    
    const preferences = requestData;
    
    // Add user email if available
    if (user?.emailAddresses) {
      preferences.email = user.emailAddresses[0]?.emailAddress || '';
    }
    
    // Add timestamp
    preferences.updated_at = new Date().toISOString();
    
    // Ensure the user directory exists
    const userDir = ensureUserDir(actualUserId);
    
    // Save preferences to JSON file
    const preferencesFilePath = path.join(userDir, `preferences.json`);
    fs.writeFileSync(preferencesFilePath, JSON.stringify(preferences, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved successfully',
      userId: actualUserId
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json({ error: 'Failed to save user preferences' }, { status: 500 });
  }
}