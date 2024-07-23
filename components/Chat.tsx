"use client"
import { useState } from 'react';
import axios from 'axios';

interface Message {
  role: string;
  content: string;
}

function Chat({ chatIds }: { chatIds: { assistantId: string, threadId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { assistantId, threadId } = chatIds;

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };

    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chat', { assistantId, threadId, message: input });
      const assistantMessage = { role: 'assistant', content: response.data.message };
      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error('Error chatting with assistant:', error);
    }
  };

  return (
    <div>
      <div className="mb-4 h-64 overflow-y-auto border rounded p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleChat}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the code"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="mt-2 p-2 bg-green-500 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
