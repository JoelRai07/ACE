/**
 * Dashboard — Startseite mit KPI-Karten und Charts. Violations V16-V25
 */

export default function Dashboard() {
  return (
    <section className="dashboard">
      {/* V16: Ueberschriften-Hierarchie uebersprungen: h1 fehlt, direkt h3 (semantisch, WCAG 1.3.1) */}
      <h3 className="dashboard-title">Dashboard-Uebersicht</h3>

      <div className="kpi-grid">
        {/* V17: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <div className="kpi-card">
          <img src="https://placehold.co/48x48/28a745/white" className="kpi-icon" />
          <div className="kpi-content">
            <span className="kpi-label">Offene Tickets</span>
            {/* V18: Kontrast kpi-value zu niedrig (layout, WCAG 1.4.3) */}
            <span className="kpi-value">42</span>
          </div>
        </div>

        {/* V19: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <div className="kpi-card">
          <img src="https://placehold.co/48x48/dc3545/white" className="kpi-icon" />
          <div className="kpi-content">
            <span className="kpi-label">Kritische Fehler</span>
            <span className="kpi-value-critical">7</span>
          </div>
        </div>

        {/* V20: Karte mit onClick ohne Keyboard-Handler (semantisch, WCAG 2.1.1) */}
        <div className="kpi-card clickable" onClick={() => alert("Details")}>
          <div className="kpi-content">
            <span className="kpi-label">Abgeschlossene Tasks</span>
            <span className="kpi-value">128</span>
          </div>
        </div>

        {/* V21: role="button" auf div ohne tabIndex (semantisch, WCAG 4.1.2) */}
        <div className="kpi-card clickable" role="button" onClick={() => alert("Statistik")}>
          <div className="kpi-content">
            <span className="kpi-label">Statistiken</span>
            <span className="kpi-value">99%</span>
          </div>
        </div>
      </div>

      {/* V22: Chart-Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
      <div className="chart-section">
        <h4>Verlauf</h4>
        <img src="https://placehold.co/600x200/eee/999" className="chart-img" />
      </div>

      {/* V23: Tabelle ohne caption oder aria-label (semantisch, WCAG 1.3.1) */}
      <table className="dashboard-table">
        <thead>
          <tr>
            {/* V24: <th> ohne scope-Attribut (syntaktisch, WCAG 1.3.1) */}
            <th>Datum</th>
            <th>Aktion</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-03-28</td>
            <td>Deployment</td>
            {/* V25: Farbcodierung ohne Textalternative (semantisch, WCAG 1.4.1) */}
            <td><span className="status-dot green"></span></td>
          </tr>
          <tr>
            <td>2026-03-27</td>
            <td>Review</td>
            <td><span className="status-dot red"></span></td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
