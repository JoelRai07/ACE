import { useState } from "react";

/**
 * FileUpload — Violations V71-V80
 */

export default function FileUpload() {
  const [files, setFiles] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section>
      <h1>Datei-Upload</h1>

      {/* V71: Dropzone div mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
      <div className="dropzone" onClick={() => document.getElementById("file-input")?.click()}>
        {/* V72: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/48x48/ccc/666" className="upload-icon" />
        <p>Dateien hier ablegen oder klicken</p>
      </div>

      {/* V73: File-Input ohne Label (syntaktisch, WCAG 1.3.1) */}
      <input
        id="file-input"
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name);
          setFiles((prev) => [...prev, ...names]);
        }}
      />

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={i} className="file-item">
              <span>{f}</span>
              {/* V74: Loeschen-Button ohne zugaenglichen Namen (syntaktisch, WCAG 4.1.2) */}
              <button className="btn-icon-tiny" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>
                &#10005;
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* V75: Fortschrittsbalken ohne aria-valuenow/aria-valuemax (syntaktisch, WCAG 4.1.2) */}
      <div className="progress-bar" role="progressbar">
        <div className="progress-fill" style={{ width: "60%" }}></div>
      </div>

      {/* V76: Kontrast Hilfetext zu niedrig (layout, WCAG 1.4.3) */}
      <p className="help-text-low">Max. 10 MB pro Datei, erlaubte Formate: PDF, DOCX, PNG</p>

      {/* V77: Button zu klein 18x18 (layout, WCAG 2.5.8) */}
      <button className="btn-tiny" onClick={() => setShowConfirm(true)}>Hochladen</button>

      {/* V78: Bestaetigungsdialog ohne Fokus-Trap (semantisch, WCAG 2.1.2) */}
      {showConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            {/* V79: Dialog ohne aria-labelledby (syntaktisch, WCAG 4.1.2) */}
            <h2>Upload bestaetigen</h2>
            <p>{files.length} Datei(en) hochladen?</p>
            {/* V80: outline:none (layout, WCAG 2.4.7) */}
            <button style={{ outline: "none" }} className="btn-primary" onClick={() => setShowConfirm(false)}>
              Bestaetigen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
