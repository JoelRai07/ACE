/**
 * Dashboard — Violations V11-V20
 */

export default function Dashboard() {
  return (
    <section className="dashboard">
      {/* V11: Ueberschriften-Hierarchie uebersprungen h3 statt h1 (semantisch, WCAG 1.3.1) */}
      <h3 className="dashboard-title">Dashboard</h3>

      <div className="kpi-grid">
        {/* V12: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <div className="kpi-card">
          <img src="https://placehold.co/48x48/28a745/white" className="kpi-icon" />
          <span className="kpi-label">Tickets</span>
          {/* V13: Kontrast kpi-value zu niedrig (layout, WCAG 1.4.3) */}
          <span className="kpi-value-low">42</span>
        </div>

        {/* V14: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
        <div className="kpi-card">
          <img src="https://placehold.co/48x48/dc3545/white" className="kpi-icon" />
          <span className="kpi-label">Fehler</span>
          <span className="kpi-value-critical">7</span>
        </div>

        {/* V15: onClick auf div ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <div className="kpi-card clickable" onClick={() => alert("Details")}>
          <span className="kpi-label">Tasks</span>
          <span className="kpi-value-low">128</span>
        </div>

        {/* V16: role="button" ohne tabIndex (semantisch, WCAG 4.1.2) */}
        <div className="kpi-card clickable" role="button" onClick={() => alert("Stats")}>
          <span className="kpi-label">Statistiken</span>
          <span className="kpi-value-low">99%</span>
        </div>
      </div>

      {/* V17: Chart-Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
      <img src="https://placehold.co/600x200/eee/999" className="chart-img" />

      {/* V18: Tabelle ohne caption (semantisch, WCAG 1.3.1) */}
      <table className="data-table-simple">
        <thead>
          <tr>
            {/* V19: th ohne scope (syntaktisch, WCAG 1.3.1) */}
            <th>Datum</th>
            <th>Aktion</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-03-28</td>
            <td>Deployment</td>
            {/* V20: Status nur durch Farbe (semantisch, WCAG 1.4.1) */}
            <td><span className="dot green"></span></td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
