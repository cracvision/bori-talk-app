import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const thread = await openai.beta.threads.create();
  // Store session-thread mapping in Firestore (see Step 5)
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Use env or service account
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  const db = admin.firestore();
  await db.collection("sessions").doc(sessionId).set({ threadId: thread.id, createdAt: new Date() });
  return NextResponse.json({ threadId: thread.id });
}