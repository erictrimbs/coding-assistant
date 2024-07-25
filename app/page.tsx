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
      <p><br />Usage guide:<br />
        - Input your PUBLIC GitHub repository for processing in the format: &quot;https://github.com/erictrimbs/coding-assistant&quot; or, to point to a specific branch, &quot;https://github.com/erictrimbs/coding-assistant/tree/&lt;main&gt;&quot;.<br />
        - Wait for processing as the backend uploads your repo to the assistant (ChatGPT gpt-4o).<br />
        - Sometimes, the assistant will take a minute to process your files even after the chat window has opened!<br />
        - Continue to chat to the assistant, give it up to 30-60 seconds to respond.
      </p>
    </div>
  );
}
