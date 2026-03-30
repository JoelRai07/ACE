import { useState } from "react";

/**
 * HelpCenter — FAQ/Accordion. Violations V95-V100
 */

const FAQS = [
  { q: "Wie ändere ich mein Passwort?", a: "Unter Einstellungen > Sicherheit." },
  { q: "Wo finde ich die API-Docs?", a: "Im Wiki unter /docs/api." },
  { q: "Wie kontaktiere ich den Support?", a: "Per Chat oder Telefon." },
];

export default function HelpCenter() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <h1>Hilfe-Center</h1>

      {/* V95: Suchfeld ohne Label (syntaktisch, WCAG 1.3.1) */}
      <input type="search" className="search-input" placeholder="Hilfethema suchen..." />

      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <div key={i} className="faq-item">
            {/* V96: Accordion-Header: div mit onClick ohne onKeyDown, ohne role (semantisch, WCAG 2.1.1) */}
            <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
              <span>{faq.q}</span>
              <span className="faq-chevron">{open === i ? "▲" : "▼"}</span>
            </div>
            {/* V97: Accordion-Body ohne aria-expanded Steuerung (semantisch, WCAG 4.1.2) */}
            {open === i && (
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* V98: Kontaktkarte: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
      <div className="contact-card">
        <img src="https://placehold.co/48x48/0057B8/white" className="contact-avatar" />
        <div>
          <span className="contact-name">Support-Team</span>
          {/* V99: Kontrast Kontaktinfo zu niedrig (layout, WCAG 1.4.3) */}
          <span className="contact-info">support@bitbw.de</span>
        </div>
      </div>

      {/* V100: aria-hidden auf fokussierbarem Link (syntaktisch, WCAG 4.1.2) */}
      <a href="#feedback" aria-hidden="true" tabIndex={0} className="feedback-link">
        Feedback geben
      </a>
    </section>
  );
}
