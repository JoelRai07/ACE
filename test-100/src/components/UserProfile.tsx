import { useState } from "react";

/**
 * UserProfile — Violations V21-V30
 */

export default function UserProfile() {
  const [name, setName] = useState("Max");
  const [email, setEmail] = useState("max@bitbw.de");
  const [bio, setBio] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <section className="profile">
      <h1>Profil bearbeiten</h1>

      {/* V21: Avatar ohne alt (syntaktisch, WCAG 1.1.1) */}
      <img src="https://placehold.co/80x80/0057B8/white" className="avatar" />

      {/* V22: Input ohne label (syntaktisch, WCAG 1.3.1) */}
      <div className="field-group">
        <span className="field-label-fake">Name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
      </div>

      {/* V23: Input ohne label (syntaktisch, WCAG 1.3.1) */}
      <div className="field-group">
        <span className="field-label-fake">E-Mail</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
      </div>

      {/* V24: Textarea ohne label (syntaktisch, WCAG 1.3.1) */}
      <div className="field-group">
        <span className="field-label-fake">Bio</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="field-input" rows={3} />
      </div>

      {/* V25: Pflichtfeld ohne required/aria-required (syntaktisch, WCAG 3.3.2) */}
      <div className="field-group">
        <label htmlFor="dept" className="field-label">Abteilung *</label>
        <input id="dept" type="text" className="field-input" />
      </div>

      {/* V26: Fehlermeldung nicht programmatisch verknuepft (semantisch, WCAG 3.3.1) */}
      <div className="field-group">
        <label htmlFor="phone" className="field-label">Telefon</label>
        <input id="phone" type="tel" className="field-input" />
        <span className="error-text">Ungueltige Nummer</span>
      </div>

      {/* V27: Kontrast Button zu niedrig (layout, WCAG 1.4.3) */}
      <button className="btn-lowcontrast" onClick={() => setShowSuccess(true)}>Speichern</button>

      {/* V28: outline:none auf Button (layout, WCAG 2.4.7) */}
      <button className="btn-cancel" style={{ outline: "none" }} onClick={() => {}}>Abbrechen</button>

      {/* V29: Statusmeldung ohne aria-live (semantisch, WCAG 4.1.3) */}
      {showSuccess && <div className="success-banner">Gespeichert!</div>}

      {/* V30: Duplikat-ID (syntaktisch, WCAG 4.1.1) */}
      <div id="profile-help" className="sr-only">Hilfe 1</div>
      <div id="profile-help" className="sr-only">Hilfe 2</div>
    </section>
  );
}
