import { NextResponse } from "next/server";
import OpenAI from "openai";
import admin from "firebase-admin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const thread = await openai.beta.threads.create();
  const db = admin.firestore();
  await db.collection("sessions").doc(sessionId).set({ threadId: thread.id, createdAt: new Date() });
  return NextResponse.json({ threadId: thread.id });
}