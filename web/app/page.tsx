"use client";

import ChainOfThoughtChat from '../components/ChainOfThoughtChat';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Multi-Modal Chain-of-Thought Chat</h1>
          <p className="text-gray-600">
            Ask questions, upload images, and see the AI&apos;s thinking process
          </p>
        </header>
        
        <ChainOfThoughtChat />
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by OpenAI GPT-4o</p>
        </footer>
      </div>
    </main>
  );
}
