import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth, currentUser } from '@clerk/nextjs/server';


const ensureUserDir = () => {
  const userDir = path.join(process.cwd(), 'user');
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
    
    const userDir = ensureUserDir();
    const filePath = path.join(userDir, `${userId}.json`);
    
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const preferences = await request.json();
    
    // Ensure preferences belong to the authenticated user
    if (preferences.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const userDir = ensureUserDir();
    const filePath = path.join(userDir, `${userId}.json`);
    
    // Save preferences to JSON file
    fs.writeFileSync(filePath, JSON.stringify(preferences, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json({ error: 'Failed to save user preferences' }, { status: 500 });
  }
}