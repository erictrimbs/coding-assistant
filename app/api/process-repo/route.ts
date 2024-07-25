import { Octokit } from 'octokit';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const github_octokit = new Octokit({ auth: process.env.GITHUB_SECRET_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

let errormsg = "";

async function fetchRepoContents(uniqueId: string, owner: string, repo: string, path: string, ref: string) {
  let { data: repoContents } = await github_octokit.rest.repos.getContent({
    owner, repo, path, ref
  });

  if (!Array.isArray(repoContents)) {
    repoContents = [repoContents];
  }

  const fileIds: Array<string> = [];

  await Promise.all(repoContents.map(async (item) => {
    if (item.type === 'file') {
      try {
        const { data: fileContent } = await github_octokit.rest.repos.getContent({
          owner, repo, path: item.path, ref
        });

        if (!('content' in fileContent)) {
          return;
        }

        const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
        const file = new File([content], `${uniqueId}_${item.path}.txt`, { type: 'text/plain' });

        const uploadedFile = await openai.files.create({
          file,
          purpose: 'assistants',
        });
        fileIds.push(uploadedFile.id);
      } catch (error) {
        console.error(error);
      }
    } else if (item.type === 'dir') {
      const dirFileIds = await fetchRepoContents(uniqueId, owner, repo, item.path, ref);
      fileIds.push(...dirFileIds);
    }
  }));

  return fileIds;
}

async function createVectorStore(uniqueId: string, fileIds: string[]) {
  try {
    const vectorStore = await openai.beta.vectorStores.create({
      file_ids: fileIds,
      name: `Vector Store ${uniqueId}`,
      expires_after: { anchor: "last_active_at", days: 1 }
    });
    return vectorStore.id;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
}

async function createAssistant(uniqueId: string, vectorStoreId: string) {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Code Assistant ".concat(uniqueId),
      instructions: "This GPT assists with reviewing, understanding, and suggesting changes to your code repository. It can analyze a code repository and answer questions about it. The GPT can reference the provided files to give specific and accurate advice.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      }
    });
    return assistant.id;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  const res = await req.json();

  const { repoUrl } = res;
  const uniqueId = uuidv4();

  console.log('Received repoUrl:', repoUrl);

  try {
    // 1. Parse GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    const [, owner, repo, branch] = match;

    // 2. Get and upload repository contents recursively
    const fileIds = await fetchRepoContents(uniqueId, owner, repo, '', branch || 'main');
    console.log("fileIds: " + JSON.stringify(fileIds));

    // 3. Create Vector Store
    const vectorStoreId = await createVectorStore(uniqueId, fileIds.filter(Boolean));
    console.log("Vector Store ID:", vectorStoreId);

    // 4. Create OpenAI Assistant
    const assistantId = await createAssistant(uniqueId, vectorStoreId);
    console.log("Assistant ID:", assistantId);

    // 5. Create Assistant Thread
    const thread = await openai.beta.threads.create();
    console.log("Thread ID:", thread.id);

    // 6. Send response
    return new Response(JSON.stringify({ assistantId: assistantId, threadId: thread.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing the repository.'.concat(errormsg) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
