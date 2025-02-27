"use server"
import { type ChatCompletionMessageParam } from './types'

/**
 * Interface for OpenAI API response
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Configuration options for the OpenAI API request
 */
interface OpenAIConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  apiKey?: string;
  enableCoT?: boolean;
}

// Default API key from the provided resources
const DEFAULT_API_KEY = process.env.API_KEY
console.log('[chatgpt] openai key:', DEFAULT_API_KEY)

/**
 * Query the OpenAI API with a list of messages
 * 
 * @param messages - Array of message objects with role and content (can include images)
 * @param config - Optional configuration for the API request
 * @returns The response from OpenAI
 */
export async function queryOpenAI(
  messages: ChatCompletionMessageParam[],
  config: OpenAIConfig = {}
): Promise<OpenAIResponse> {
  const {
    model = 'gpt-4o',
    temperature = 0.7,
    max_tokens = 1000,
    apiKey = process.env.API_KEY,
    enableCoT = false,
  } = config;

  console.log('[queryOpenAI] apiKey:', DEFAULT_API_KEY)

  // Add chain-of-thought instruction if enabled
  let processedMessages = [...messages];
  
  if (enableCoT && messages.length > 0) {
    // Add a system message for chain-of-thought reasoning if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    
    if (!hasSystemMessage) {
      processedMessages.unshift({
        role: 'system',
        content: 'You are a helpful assistant that uses chain-of-thought reasoning. For each response, first think step-by-step about the problem before providing your final answer. Structure your response with "Thinking:" followed by your reasoning process, and then "Answer:" followed by your final response.'
      });
    } else {
      // Update existing system message to include CoT instructions
      processedMessages = processedMessages.map(msg => {
        if (msg.role === 'system') {
          return {
            ...msg,
            content: typeof msg.content === 'string' 
              ? `${msg.content} Use chain-of-thought reasoning. For each response, first think step-by-step about the problem before providing your final answer. Structure your response with "Thinking:" followed by your reasoning process, and then "Answer:" followed by your final response.`
              : msg.content
          };
        }
        return msg;
      });
    }
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: processedMessages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * A simplified version of queryOpenAI that returns just the response text
 * 
 * @param messages - Array of message objects with role and content (can include images)
 * @param config - Optional configuration for the API request
 * @returns The text response from the model
 */
export async function getOpenAIResponse(
  messages: ChatCompletionMessageParam[],
  config: OpenAIConfig = {}
): Promise<string> {
  const response = await queryOpenAI(messages, config);
  return response.choices[0]?.message.content || '';
}

/**
 * Get a response with chain-of-thought reasoning
 * 
 * @param messages - Array of message objects with role and content (can include images)
 * @param config - Optional configuration for the API request
 * @returns An object containing the thinking process and the final answer
 */
export async function getChainOfThoughtResponse(
  messages: ChatCompletionMessageParam[],
  config: OpenAIConfig = {}
): Promise<{ thinking: string; answer: string }> {
  // Enable chain-of-thought reasoning
  const response = await getOpenAIResponse(messages, { ...config, enableCoT: true }).catch((err) => {
    console.warn('[chatgpt] error:', err)
    throw err
  })
  
  // Parse the response to extract thinking and answer
  const parts = response.split(/Answer:/i);
  
  if (parts.length > 1) {
    // If we found "Answer:", extract the thinking part and answer part
    const thinkingPart = parts[0].replace(/^Thinking:/i, '').trim();
    const answerPart = parts[1].trim();
    return { thinking: thinkingPart, answer: answerPart };
  } else {
    // If no "Answer:" found, check if there's a "Thinking:" section
    const thinkingParts = response.split(/Thinking:/i);
    if (thinkingParts.length > 1) {
      return { thinking: thinkingParts[1].trim(), answer: '' };
    }
    // If neither found, return the whole response as the answer
    return { thinking: '', answer: response };
  }
}

export async function uploadFilesToChatGPT(formData: FormData) {
  console.log('[chatgpt] formData:', formData)

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  });

  console.log('[chatgpt] formdata:', response)

  return response.json()
}