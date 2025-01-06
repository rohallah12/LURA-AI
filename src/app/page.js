'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Next.js + Tailwind CSS client-side example calling the ChatGPT API via a secure server-side route.
 * The API key is securely stored on the server and never exposed to the client.
 */

export default function Home() {
  // Reference for auto-scrolling
  const chatEndRef = useRef(null);

  // Initialize messages with a system message defining Lura's behavior
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content:
        'You are Lura, a cute and flirty virtual companion. You love engaging users in playful and charming conversations.',
    },
    // Initial assistant message
    {
      role: 'assistant',
      content:
        "Hey there! 😊 I'm Lura, your virtual companion. Ready to chat and have some fun?",
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add the user message to the conversation
    const newMessages = [
      ...messages,
      { role: 'user', content: userInput },
    ];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.message}`);
      }

      const data = await response.json();
      const assistantMessage = data?.choices?.[0]?.message?.content || 'No response';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error calling ChatGPT API.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to the latest message whenever messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-black text-lime-300 p-4">
      {/* Header with Logo */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 mr-3 relative">
          <Image
            src="/LURA.webp" // Path to your image in the public folder
            alt="LURA Logo"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold">LURA CHAT</h1>
      </div>

      {/* Chat Messages */}
      <div className="w-full max-w-xl flex flex-col gap-3 border border-lime-300 p-4 rounded-md h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-md max-w-[75%] 
              ${msg.role === 'user' ? 'ml-auto bg-green-900' : 'mr-auto bg-gray-800'}
            `}
          >
            <strong>{msg.role === 'user' ? 'You' : 'Lura'}: </strong>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-800 p-3 rounded-md max-w-[75%] mr-auto">
            <em>Thinking...</em>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field and Send Button */}
      <div className="w-full max-w-xl flex mt-4">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-gray-800 text-lime-300 border border-lime-300 rounded-l-md px-3 py-2 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-gray-700 border border-lime-300 text-lime-300 px-4 py-2 rounded-r-md hover:bg-gray-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
