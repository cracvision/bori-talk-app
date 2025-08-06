import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Initialize OpenAI INSIDE the function, not at module level
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }
    if (!assistantId) {
      return NextResponse.json(
        { error: "OpenAI Assistant ID not configured" },
        { status: 500 }
      );
    }
    const { threadId, message } = await req.json();
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message
    });
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (runStatus.status !== "completed") {
      if (runStatus.status === "failed") {
        return NextResponse.json(
          { error: "Assistant run failed" },
          { status: 500 }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data[0].content[0].type === "text"
      ? messages.data[0].content[0].text.value
      : "";
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}