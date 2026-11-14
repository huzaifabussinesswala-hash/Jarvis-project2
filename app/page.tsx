"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const starters = [
  "Mujhe aaj ka plan banane mein help karo",
  "Explain artificial intelligence in simple words",
  "Mere business ke liye 3 ideas do"
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(value?: string) {
    const text = (value ?? input).trim();
    if (!text || loading) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated); setInput(""); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kuch masla ho gaya.");
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Dobara try karein.");
    } finally {
      setLoading(false); inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void sendMessage(); }
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/"><span className="brand-mark">J</span><span>JARVIS</span></a>
        <button className="new-chat" onClick={() => { setMessages([]); setError(""); setInput(""); }}>
          <span>＋</span> New chat
        </button>
        <div className="side-note"><span className="status-dot" /><div><strong>JARVIS is ready</strong><small>Gemini AI connection</small></div></div>
        <div className="sidebar-bottom">Your personal AI companion</div>
      </aside>

      <section className="chat-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">J</span> JARVIS</div>
          <div className="model-label"><span className="status-dot" /> Gemini AI</div>
        </header>
        <div className="conversation">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-orb"><span>J</span></div>
              <p className="eyebrow">YOUR PERSONAL AI ASSISTANT</p>
              <h1>How can I help<br /><span>you today?</span></h1>
              <p className="welcome-copy">Assalam-o-alaikum! Main JARVIS hoon. Aap Roman Urdu, Urdu ya English mein baat kar sakte hain.</p>
              <div className="starter-grid">
                {starters.map((starter) => <button key={starter} className="starter" onClick={() => void sendMessage(starter)}><span>↗</span>{starter}</button>)}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message, index) => (
                <article className={`message ${message.role}`} key={index}>
                  <div className="avatar">{message.role === "user" ? "You" : "J"}</div>
                  <div className="message-body"><strong>{message.role === "user" ? "You" : "JARVIS"}</strong><p>{message.content}</p></div>
                </article>
              ))}
              {loading && <article className="message assistant"><div className="avatar">J</div><div className="message-body"><strong>JARVIS</strong><p className="typing"><i /><i /><i /></p></div></article>}
              <div ref={bottomRef} />
            </div>
          )}
          {error && <div className="error-message" role="alert">{error}</div>}
        </div>
        <div className="composer-wrap">
          <form className="composer" onSubmit={handleSubmit}>
            <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown} placeholder="Message JARVIS..." rows={1} maxLength={8000} aria-label="Message JARVIS" />
            <button className="send-button" type="submit" disabled={!input.trim() || loading} aria-label="Send message">
              {loading ? <span className="spinner" /> : "↑"}
            </button>
          </form>
          <p className="disclaimer">JARVIS can make mistakes. Check important information. · Enter to send, Shift + Enter for new line</p>
        </div>
      </section>
    </main>
  );
}