import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert("./serviceAccount.json"),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export async function POST(req: Request) {
  const { sessionId, transcript } = await req.json();
  const db = admin.firestore();
  await db.collection("transcripts").doc(sessionId).set({
    transcript,
    timestamp: new Date(),
    emailed: false,
  });
  return NextResponse.json({ success: true });
}