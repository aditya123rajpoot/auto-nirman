'use client';

import { useState } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: { type: 'user'; text: string } = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Placeholder bot response
    const botReply: { type: 'bot'; text: string } = {
      type: 'bot',
      text: "I'm thinking... (In real app, connect me to an AI backend)",
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botReply]);
    }, 1000);

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <h2 className="text-3xl font-bold mb-6">🧠 Smart Chatbot Assistant</h2>

      <div className="max-w-2xl mx-auto border border-gray-700 rounded-lg p-4 bg-gray-900 space-y-4 h-[70vh] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg w-fit max-w-[75%] ${
              msg.type === 'user'
                ? 'ml-auto bg-blue-600'
                : 'bg-gray-700 text-left'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-4 flex">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-lg bg-gray-800 border border-gray-700 outline-none text-white"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
