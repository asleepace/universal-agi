import { NextRequest, NextResponse } from 'next/server';
import { getChainOfThoughtResponse } from '../../../lib/chatgpt';
import { ChatCompletionMessageParam } from '../../../lib/types';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Process the messages through OpenAI
    const response = await getChainOfThoughtResponse(
      messages as ChatCompletionMessageParam[]
    );

    // Return the response
    return NextResponse.json({
      thinking: response.thinking,
      answer: response.answer
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export const GET = async () => {
  return NextResponse.json({
    message: 'Chat API is running'
  });
}