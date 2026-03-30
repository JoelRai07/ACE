import { useState } from "react";

/**
 * Settings — Violations V51-V60
 */

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const tabs = ["Allgemein", "Sicherheit", "Benachrichtigungen"];

  return (
    <section>
      <h1>Einstellungen</h1>

      {/* V51-V53: Tab-Navigation: divs mit onClick ohne onKeyDown, ohne role="tab" (semantisch, WCAG 2.1.1) */}
      <div className="tab-bar">
        {tabs.map((tab, i) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === i ? "active-tab" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="settings-panel">
          {/* V54: Toggle ohne zugänglichen Namen (syntaktisch, WCAG 4.1.2) */}
          <div className="setting-row">
            <span>Dark Mode</span>
            <div
              className={`toggle ${darkMode ? "on" : "off"}`}
              role="switch"
              onClick={() => setDarkMode(!darkMode)}
            ></div>
          </div>

          {/* V55: Select ohne Label (syntaktisch, WCAG 1.3.1) */}
          <div className="setting-row">
            <span>Sprache</span>
            <select className="setting-select">
              <option>Deutsch</option>
              <option>English</option>
            </select>
          </div>

          {/* V56: Input ohne Label (syntaktisch, WCAG 1.3.1) */}
          <div className="setting-row">
            <span>Zeitzone</span>
            <input type="text" className="field-input" value="Europe/Berlin" readOnly />
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="settings-panel">
          {/* V57: Passwortfeld ohne Label (syntaktisch, WCAG 1.3.1) */}
          <div className="field-group">
            <span className="field-label-fake">Neues Passwort</span>
            <input type="password" className="field-input" placeholder="Passwort" />
          </div>

          {/* V58: Passwortfeld ohne Label (syntaktisch, WCAG 1.3.1) */}
          <div className="field-group">
            <span className="field-label-fake">Passwort bestätigen</span>
            <input type="password" className="field-input" placeholder="Bestätigen" />
          </div>

          {/* V59: Button mit zu niedrigem Kontrast (layout, WCAG 1.4.3) */}
          <button className="btn-lowcontrast">Passwort ändern</button>
        </div>
      )}

      {activeTab === 2 && (
        <div className="settings-panel">
          {/* V60: Checkboxen ohne Label (syntaktisch, WCAG 1.3.1) */}
          <div className="setting-row">
            <span>E-Mail-Benachrichtigungen</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-row">
            <span>Push-Benachrichtigungen</span>
            <input type="checkbox" />
          </div>
        </div>
      )}
    </section>
  );
}
