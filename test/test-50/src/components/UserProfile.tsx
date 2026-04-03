import { useState } from "react";

/**
 * UserProfile — Profilseite mit Formular. Violations V26-V35
 */

export default function UserProfile() {
  const [name, setName] = useState("Max Mustermann");
  const [email, setEmail] = useState("max@bitbw.de");
  const [bio, setBio] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <section className="profile">
      <h1 className="profile-title">Profil bearbeiten</h1>

      <div className="profile-body">
        {/* V26: Avatar-Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/80x80/0057B8/white" className="avatar" />

        {/* V27: Input ohne zugehöriges <label> (syntaktisch, WCAG 1.3.1) */}
        <div className="field-group">
          <span className="field-label-fake">Anzeigename</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
            placeholder="Name eingeben"
          />
        </div>

        {/* V28: Input ohne zugehöriges <label> (syntaktisch, WCAG 1.3.1) */}
        <div className="field-group">
          <span className="field-label-fake">E-Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            placeholder="E-Mail eingeben"
          />
        </div>

        {/* V29: Textarea ohne <label> (syntaktisch, WCAG 1.3.1) */}
        <div className="field-group">
          <span className="field-label-fake">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="field-input"
            rows={3}
            placeholder="Über mich..."
          />
        </div>

        {/* V30: Pflichtfeld ohne aria-required oder required-Attribut (syntaktisch, WCAG 3.3.2) */}
        <div className="field-group">
          <label htmlFor="dept" className="field-label">Abteilung *</label>
          <input id="dept" type="text" className="field-input" placeholder="Pflichtfeld" />
        </div>

        {/* V31: Fehlermeldung nicht programmatisch verknüpft (semantisch, WCAG 3.3.1) */}
        <div className="field-group">
          <label htmlFor="phone" className="field-label">Telefon</label>
          <input id="phone" type="tel" className="field-input" />
          <span className="error-text">Bitte gültige Nummer eingeben</span>
        </div>

        {/* V32: Kontrast des Buttons zu niedrig (layout, WCAG 1.4.3) */}
        <button
          className="btn-save-lowcontrast"
          onClick={() => setShowSuccess(true)}
        >
          Speichern
        </button>

        {/* V33: Fokus-Outline entfernt (layout, WCAG 2.4.7) */}
        <button
          className="btn-cancel"
          style={{ outline: "none" }}
          onClick={() => setShowSuccess(false)}
        >
          Abbrechen
        </button>

        {/* V34: Statusmeldung ohne aria-live (semantisch, WCAG 4.1.3) */}
        {showSuccess && (
          <div className="success-banner">
            Profil gespeichert!
          </div>
        )}

        {/* V35: Duplikat-ID auf verstecktem Hilfe-Element (syntaktisch, WCAG 4.1.1) */}
        <div id="help-text" className="sr-only">Hilfetext 1</div>
        <div id="help-text" className="sr-only">Hilfetext 2</div>
      </div>
    </section>
  );
}
