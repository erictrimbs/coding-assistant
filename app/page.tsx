"use client"
import { useState } from 'react';
import GitHubForm from '../components/GitHubForm';
import Chat from '../components/Chat';

interface ChatIds {
  assistantId: string;
  threadId: string;
}

export default function Home() {
  const [chatIds, setChatIds] = useState<ChatIds | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Assistant</h1>
      {!chatIds ? (
        <GitHubForm setChatIds={setChatIds} />
      ) : (
        <Chat chatIds={chatIds} />
      )}
    </div>
  );
}
