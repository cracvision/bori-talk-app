"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationMinutes = parseInt(process.env.NEXT_PUBLIC_CHAT_EXPIRATION_MINUTES || "10");

  const saveTranscript = useCallback(async () => {
    if (!sessionId) return;
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    await fetch("/api/save-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, transcript }),
    });
  }, [sessionId, messages]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsExpired(true);
      saveTranscript();
    }, expirationMinutes * 60 * 1000);
  }, [expirationMinutes, saveTranscript]);

  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    startTimer();
    createThread(newSessionId);
  }, [startTimer]);

  const createThread = async (sid: string) => {
    const res = await fetch("/api/create-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    });
    const { threadId } = await res.json();
    setThreadId(threadId);
  };

  const handleSend = async () => {
    if (!input || isExpired || !threadId) return;
    startTimer();
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, message: input }),
    });
    const { response } = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  const handleTTS = async (text: string) => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const audioBlob = await res.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chatbot</h1>
      <div className="flex-1 overflow-y-auto border p-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span className="font-bold">{msg.role}:</span> {msg.content}
            {msg.role === "assistant" && (
              <button
                onClick={() => handleTTS(msg.content)}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              >
                🔊 TTS
              </button>
            )}
          </div>
        ))}
        {isLoading && <div>Assistant is thinking...</div>}
      </div>
      {!isExpired ? (
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-2"
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="bg-green-500 text-white px-4 py-2">
            Send
          </button>
        </div>
      ) : (
        <div className="text-red-500">Chat expired due to inactivity.</div>
      )}
    </div>
  );
}