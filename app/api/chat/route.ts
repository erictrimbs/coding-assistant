import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });

export async function POST(req: Request) {
  const res = await req.json();

  const { assistantId, threadId, message } = res;


  if (!assistantId || !threadId || !message) {
    return res.status(400).json({ error: 'Missing assistantId or message in request body' });
  }

  try {
    // Creates the message
    await openai.beta.threads.messages.create(threadId, { role: 'user', content: `"${message}"` })

    const run = await openai.beta.threads.runs.createAndPoll(threadId, { assistant_id: assistantId });
    console.log('Run finished with status: ' + run.status);


    if (run.status === "completed") {
      const messagesResponse = await openai.beta.threads.messages.list(threadId, { run_id: run.id })
      const response = messagesResponse.getPaginatedItems()[0].content[0];
      console.log('Run created and returned message: ' + JSON.stringify(response));

      if (response.type !== "text") {
        return new Response(JSON.stringify({ message: "Model returned an image. Try again." }))
      }
      const responseText = response.text.value;
      return new Response(JSON.stringify({ message: responseText }));
    }
    else if (run.status in ['expired', 'failed', 'cancelled', 'incomplete', 'requires_action']) {
      return new Response(JSON.stringify({ message: "Model didn't load. Try again." }))
    }

  } catch (error) {
    console.error('Error processing chat message:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the chat message.' }),
      { status: 500 }
    );
  }
}
