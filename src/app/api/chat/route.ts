import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic'; // Fuerza dynamic runtime

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistantId = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: Request) {
  const { threadId, message } = await req.json();
  await openai.beta.threads.messages.create(threadId, { role: "user", content: message });
  const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, { run_id: run.id });
  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, { run_id: run.id });
  }
  const messages = await openai.beta.threads.messages.list(threadId);
  const response = messages.data[0].content[0].type === "text" ? messages.data[0].content[0].text.value : "";
  return NextResponse.json({ response });
}