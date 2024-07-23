"use client"
import { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';

interface ChatIds {
  assistantId: string;
  threadId: string;
}

interface GitHubFormProps {
  setChatIds: Dispatch<SetStateAction<ChatIds | null>>;
}

function GitHubForm({ setChatIds }: GitHubFormProps) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(repoUrl)
    try {
      const response = await axios.post('/api/process-repo', { repoUrl }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setChatIds({ assistantId: response.data.assistantId, threadId: response.data.threadId });
    } catch (error) {
      console.error('Error processing repository:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={repoUrl}
        onChange={(e) => {
          console.log('Input value:', e.target.value); // Debug log
          setRepoUrl(e.target.value)
          console.log(repoUrl)
        }}
        placeholder="Enter GitHub repository URL"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded">
        Process Repository
      </button>
    </form>
  );
}

export default GitHubForm;
