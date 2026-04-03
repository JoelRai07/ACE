import { useState } from "react";

/**
 * Notifications — Benachrichtigungszentrale mit Modal. Violations V44-V50
 */

const NOTIFICATIONS = [
  { id: 1, title: "Deployment abgeschlossen", time: "vor 5 Min.", read: false },
  { id: 2, title: "Neuer Kommentar", time: "vor 1 Std.", read: true },
  { id: 3, title: "Sicherheitswarnung", time: "vor 3 Std.", read: false },
];

export default function Notifications() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section className="notifications-section">
      <h1 className="section-title">Benachrichtigungen</h1>

      <ul className="notification-list">
        {NOTIFICATIONS.map((n) => (
          // V44: <li> mit onClick ohne onKeyDown und ohne role (semantisch, WCAG 2.1.1)
          <li
            key={n.id}
            className={`notification-item ${n.read ? "read" : "unread"}`}
            onClick={() => {
              setSelectedId(n.id);
              setModalOpen(true);
            }}
          >
            {/* V45: Ungelesenen-Indikator nur durch Farbe (semantisch, WCAG 1.4.1) */}
            <span className={`unread-dot ${n.read ? "" : "visible"}`}></span>
            <div className="notification-content">
              <span className="notification-title">{n.title}</span>
              {/* V46: Zeitangabe mit zu niedrigem Kontrast (layout, WCAG 1.4.3) */}
              <span className="notification-time">{n.time}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* V47: "Alle lesen" Button zu klein 16x16px (layout, WCAG 2.5.8) */}
      <button className="btn-mark-read" onClick={() => {}}>
        Alle gelesen
      </button>

      {/* V48: Modaler Dialog ohne Fokus-Trap (semantisch, WCAG 2.1.2) */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            {/* V49: Dialog ohne aria-labelledby (syntaktisch, WCAG 4.1.2) */}
            <h2>Benachrichtigung #{selectedId}</h2>
            <p>Detailansicht der Benachrichtigung.</p>
            {/* V50: Schliessen-Button: outline:none + autoFocus fehlt (layout, WCAG 2.4.7) */}
            <button
              className="btn-primary"
              style={{ outline: "none" }}
              onClick={() => setModalOpen(false)}
            >
              Schliessen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
