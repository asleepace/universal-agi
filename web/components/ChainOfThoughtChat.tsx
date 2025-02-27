import React, { useState, useRef, useEffect } from 'react';
import FilePicker from './FilePicker';
import { createMultiModalMessage } from '../lib/multimodal';
import { getChainOfThoughtResponse } from '../lib/chatgpt';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  hasImages?: boolean;
}

export default function ChainOfThoughtChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showThinking, setShowThinking] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  // Toggle thinking visibility for a message
  const toggleThinking = (index: number) => {
    setShowThinking(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && selectedFiles.length === 0) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      hasImages: selectedFiles.length > 0
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Create multi-modal message with text and images
      const multiModalMessage = await createMultiModalMessage(input, selectedFiles);
      
      // Get all previous messages in the format expected by the API
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get response with chain-of-thought reasoning
      const { thinking, answer } = await getChainOfThoughtResponse(
        [...previousMessages, multiModalMessage]
      );
      
      // Add assistant response to chat
      const newMessageIndex = messages.length + 1;
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: answer,
          thinking
        }
      ]);
      
      // Show thinking by default for the new message
      setShowThinking(prev => ({
        ...prev,
        [newMessageIndex]: true
      }));
      
      // Clear selected files after submission
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: 'Error: Failed to get response. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chain-of-Thought Chat</h1>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[400px] border border-gray-200 rounded-lg p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            Start a conversation or upload an image for analysis
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div 
                className={`p-4 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-auto max-w-[80%]' 
                    : message.role === 'system'
                      ? 'bg-red-100 max-w-[80%]'
                      : 'bg-gray-100 max-w-[80%]'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">
                    {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI' : 'System'}
                  </div>
                  {message.hasImages && (
                    <div className="text-xs bg-blue-200 px-2 py-1 rounded">
                      Image attached
                    </div>
                  )}
                </div>
                
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Thinking toggle button for assistant messages */}
                {message.role === 'assistant' && message.thinking && (
                  <button
                    onClick={() => toggleThinking(index)}
                    className="mt-2 text-sm text-blue-600 hover:underline flex items-center"
                  >
                    {showThinking[index] ? 'Hide thinking' : 'Show thinking'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={`ml-1 transition-transform ${showThinking[index] ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Thinking section */}
              {message.role === 'assistant' && message.thinking && showThinking[index] && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 max-w-[80%]">
                  <div className="font-semibold mb-2 text-yellow-800">Thinking Process:</div>
                  <div className="whitespace-pre-wrap text-sm">{message.thinking}</div>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-100 p-4 rounded-lg max-w-[80%]">
            <div className="font-semibold mb-2">AI</div>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">Thinking</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="message-input" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={isLoading}
          />
        </div>
        
        {/* File picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Images (optional)
          </label>
          <FilePicker
            onFilesSelected={handleFilesSelected}
            accept="image/*"
            multiple={true}
            maxFiles={5}
            showPreviews={true}
            buttonText="Upload Images"
            buttonClassName="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center"
          disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Send'}
        </button>
      </form>
    </div>
  );
} 