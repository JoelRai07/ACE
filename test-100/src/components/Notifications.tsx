import { useState } from "react";

/**
 * Notifications — Violations V41-V50
 */

export default function Notifications() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section>
      <h1>Benachrichtigungen</h1>

      <ul className="notification-list">
        {/* V41: li mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li className="notification-item unread" onClick={() => setModalOpen(true)}>
          {/* V42: Ungelesen nur durch Farbe (semantisch, WCAG 1.4.1) */}
          <span className="unread-dot visible"></span>
          <span className="notification-title">Deployment fertig</span>
          {/* V43: Kontrast Zeitangabe (layout, WCAG 1.4.3) */}
          <span className="notification-time">vor 5 Min.</span>
        </li>

        {/* V44: li mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li className="notification-item read" onClick={() => setModalOpen(true)}>
          <span className="notification-title">Review angefordert</span>
          <span className="notification-time">vor 2 Std.</span>
        </li>

        {/* V45: li mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li className="notification-item unread" onClick={() => setModalOpen(true)}>
          <span className="unread-dot visible"></span>
          <span className="notification-title">Sicherheitswarnung</span>
          <span className="notification-time">vor 3 Std.</span>
        </li>
      </ul>

      {/* V46: Button zu klein 16x16 (layout, WCAG 2.5.8) */}
      <button className="btn-tiny" onClick={() => {}}>Alle gelesen</button>

      {/* V47: Modal ohne Fokus-Trap (semantisch, WCAG 2.1.2) */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            {/* V48: Dialog ohne aria-labelledby (syntaktisch, WCAG 4.1.2) */}
            <h2>Details</h2>
            <p>Benachrichtigungsinhalt.</p>
            {/* V49: outline:none (layout, WCAG 2.4.7) */}
            <button style={{ outline: "none" }} className="btn-primary" onClick={() => setModalOpen(false)}>
              Schliessen
            </button>
          </div>
        </div>
      )}

      {/* V50: aria-hidden auf fokussierbarem Element (syntaktisch, WCAG 4.1.2) */}
      <a href="#archive" aria-hidden="true" tabIndex={0} className="archive-link">Archiv</a>
    </section>
  );
}
