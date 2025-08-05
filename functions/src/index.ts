import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const db = admin.firestore();
const brevoApiKey = process.env.BREVO_API_KEY;
const yourEmail = process.env.YOUR_EMAIL;

// Scheduled function: Every hour, check for unemailed transcripts and send
export const sendEmails = functions.pubsub.schedule("0 * * * *").onRun(async () => {
  const snapshots = await db.collection("transcripts").where("emailed", "==", false).get();
  for (const doc of snapshots.docs) {
    const { transcript } = doc.data();
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "no-reply@yourapp.com" },
        to: [{ email: yourEmail }],
        subject: `Chat Transcript - Session ${doc.id}`,
        textContent: transcript,
      },
      { headers: { "api-key": brevoApiKey, "Content-Type": "application/json" } }
    );
    await doc.ref.update({ emailed: true });
  }
});
