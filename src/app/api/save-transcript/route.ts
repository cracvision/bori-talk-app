import { NextResponse } from "next/server";
import admin from "firebase-admin";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    const { sessionId, transcript } = await req.json();
    const db = admin.firestore();
    await db.collection("transcripts").doc(sessionId).set({
      transcript,
      timestamp: new Date(),
      emailed: false,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save transcript error:", error);
    return NextResponse.json(
      { error: "Failed to save transcript" },
      { status: 500 }
    );
  }
}