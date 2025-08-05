import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { sessionId, transcript } = await req.json();
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert("./serviceAccount.json"),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  const db = admin.firestore();
  await db.collection("transcripts").doc(sessionId).set({
    transcript,
    timestamp: new Date(),
    emailed: false, // Flag for cron
  });
  return NextResponse.json({ success: true });
}