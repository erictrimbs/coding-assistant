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
        - Input your PUBLIC GitHub repository for processing in the format: &quot;https://github.com/erictrimbs/coding-assistant/tree/main (swap &quot;main&quot; with your branch name);.
        <br />- Wait for processing as the backend uploads your repo to the assistant (ChatGPT gpt-4o-mini).
        <br />- Sometimes, the assistant will take a minute to process your files even after the chat window has opened!
        <br />- Continue to chat to the assistant, give it up to 30-60 seconds to respond.
        <br />- Common error: make sure to specify the branch name by appending &quot;/tree/&lt;branch&gt;&quot;
        <br />- Limitations: the tool can only process the first 100 files it sees (higher up in repository nesting is first). It will skip most non-text files. The tool may break if I exceed my OpenAI or GitHub API limits.
        <br />Made with &lt;3 by Eric Trimble at https://github.com/erictrimbs/coding-assistant/
      </p>
    </div>
  );
}
