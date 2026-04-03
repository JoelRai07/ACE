import { useState } from "react";

/**
 * Chat — Violations V88-V94
 */

const MESSAGES = [
  { id: 1, sender: "Anna", text: "Ist das Deployment durch?", time: "14:32" },
  { id: 2, sender: "Du", text: "Ja, läuft auf Staging.", time: "14:35" },
  { id: 3, sender: "Anna", text: "Super, danke!", time: "14:36" },
];

export default function Chat() {
  const [msg, setMsg] = useState("");

  return (
    <section>
      <h1>Chat</h1>

      {/* V88: Chat-Bereich ohne aria-live für neue Nachrichten (semantisch, WCAG 4.1.3) */}
      <div className="chat-messages">
        {MESSAGES.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender === "Du" ? "self" : "other"}`}>
            <span className="chat-sender">{m.sender}</span>
            <p className="chat-text">{m.text}</p>
            {/* V89: Kontrast Zeitstempel zu niedrig (layout, WCAG 1.4.3) */}
            <span className="chat-time">{m.time}</span>
          </div>
        ))}
      </div>

      {/* V90: Input ohne Label (syntaktisch, WCAG 1.3.1) */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="Nachricht schreiben..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        {/* V91: Senden-Button ohne zugänglichen Namen (syntaktisch, WCAG 4.1.2) */}
        <button className="btn-icon-small" onClick={() => setMsg("")}>&#9654;</button>
      </div>

      {/* V92: Emoji-Picker: div mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
      <div className="emoji-bar">
        {["😀", "👍", "❤️", "😂"].map((e) => (
          <div key={e} className="emoji-btn" onClick={() => setMsg((p) => p + e)}>
            {e}
          </div>
        ))}
      </div>

      {/* V93: Online-Status nur durch Farbe (semantisch, WCAG 1.4.1) */}
      <div className="chat-status">
        <span className="online-dot"></span>
        Anna
      </div>

      {/* V94: Kontrast Hilfetext zu niedrig (layout, WCAG 1.4.3) */}
      <p className="help-text-low">Ende-zu-Ende verschlüsselt</p>
    </section>
  );
}
