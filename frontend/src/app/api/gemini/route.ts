import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.API_GEMINI_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userMessage, chatHistory } = data;

    if (!userMessage) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Initialize the model (using the Gemini-Pro model)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format chat history for Gemini
    const formattedHistory = chatHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send the message to the model
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    return NextResponse.json({ 
      response,
      status: 'success' 
    });
  } catch (error) {
    console.error('Error in Gemini API:', error);
    return NextResponse.json({ 
      error: 'Failed to process with Gemini', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}