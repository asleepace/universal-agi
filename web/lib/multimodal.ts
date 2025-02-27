import { type ChatCompletionMessageParam, type ImageContentPart } from './types';

/**
 * Converts a File object to a base64 data URL
 * 
 * @param file - The file to convert
 * @returns A Promise that resolves to the base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Creates an image content part for OpenAI API from a file
 * 
 * @param file - The image file
 * @param detail - The detail level for the image processing (optional)
 * @returns A Promise that resolves to an ImageContentPart
 */
export async function createImageContent(
  file: File, 
  detail: 'low' | 'high' | 'auto' = 'auto'
): Promise<ImageContentPart> {
  const base64Image = await fileToBase64(file);
  
  return {
    type: 'image_url',
    image_url: {
      url: base64Image,
      detail
    }
  };
}

/**
 * Creates a message with text and optional images for OpenAI API
 * 
 * @param text - The text content
 * @param imageFiles - Optional array of image files to include
 * @param role - The role of the message (default: 'user')
 * @returns A Promise that resolves to a ChatCompletionMessageParam
 */
export async function createMultiModalMessage(
  text: string,
  imageFiles: File[] = [],
  role: 'system' | 'user' | 'assistant' | 'function' = 'user'
): Promise<ChatCompletionMessageParam> {
  // If no images, return a simple text message
  if (imageFiles.length === 0) {
    return {
      role,
      content: text
    };
  }
  
  // Create image content parts for each file
  const imageContentPromises = imageFiles.map(file => createImageContent(file));
  const imageContents = await Promise.all(imageContentPromises);
  
  // Create the full content array with text and images
  const content = [
    { type: 'text', text } as const,
    ...imageContents
  ];
  
  return {
    role,
    content
  };
}
