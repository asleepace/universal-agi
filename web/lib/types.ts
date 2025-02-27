/**
 * Represents a message in a chat completion request
 */
export interface ChatCompletionMessageParam {
  /**
   * The role of the message author. One of 'system', 'user', 'assistant', or 'function'
   */
  role: 'system' | 'user' | 'assistant' | 'function';
  
  /**
   * The content of the message - can be a string or an array of content parts for multi-modal
   */
  content: string | ContentPart[];
  
  /**
   * The name of the author of this message. May contain a-z, A-Z, 0-9, and underscores,
   * with a maximum length of 64 characters.
   */
  name?: string;
}

/**
 * Represents a part of the content in a multi-modal message
 */
export type ContentPart = TextContentPart | ImageContentPart;

/**
 * Represents a text part in a multi-modal message
 */
export interface TextContentPart {
  type: 'text';
  text: string;
}

/**
 * Represents an image part in a multi-modal message
 */
export interface ImageContentPart {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
} 