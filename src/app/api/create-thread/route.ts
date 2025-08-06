import { NextResponse } from "next/server";
import OpenAI from "openai";
import admin from "firebase-admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Initialize services INSIDE the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    const { sessionId } = await req.json();
    const thread = await openai.beta.threads.create();
    const db = admin.firestore();
    await db.collection("sessions").doc(sessionId).set({
      threadId: thread.id,
      createdAt: new Date()
    });
    return NextResponse.json({ threadId: thread.id });
  } catch (error) {
    console.error("Create thread error:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}