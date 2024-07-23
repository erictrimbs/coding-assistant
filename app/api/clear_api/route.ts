import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

export async function GET() {
  try {
    // Fetch files, vector stores, and assistants concurrently
    const [files, vectorStores, assistants] = await Promise.all([
      openai.files.list(),
      openai.beta.vectorStores.list({ limit: 100 }),
      openai.beta.assistants.list({ limit: 100 })
    ]);

    // Delete files, vector stores, and assistants concurrently
    await Promise.all([
      ...files.data.map((file: OpenAI.Files.FileObject) => openai.files.del(file.id)),
      ...vectorStores.data.map((vectorStore: OpenAI.Beta.VectorStores.VectorStore) => openai.beta.vectorStores.del(vectorStore.id)),
      ...assistants.data.map((assistant: OpenAI.Beta.Assistants.Assistant) => openai.beta.assistants.del(assistant.id))
    ]);

    return new Response(JSON.stringify({ status: 200, content: 'Deleted' }));

  } catch (error) {
    console.error('Error deleting data', error);
    return new Response(JSON.stringify({ status: 500, error: 'An error occurred while clearing the data.' }));
  }
}