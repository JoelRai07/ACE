/**
 * SearchResults — Violations V61-V70
 */

const RESULTS = [
  { id: 1, title: "Projektbericht Q1", type: "PDF", date: "2026-03-15" },
  { id: 2, title: "Server-Monitoring Guide", type: "Docs", date: "2026-03-10" },
  { id: 3, title: "Onboarding Checkliste", type: "Wiki", date: "2026-02-28" },
  { id: 4, title: "API Dokumentation v2", type: "Docs", date: "2026-02-20" },
];

export default function SearchResults() {
  return (
    <section>
      <h1>Suchergebnisse</h1>

      {/* V61: Suchformular: Input ohne Label (syntaktisch, WCAG 1.3.1) */}
      <div className="search-bar">
        <input type="search" className="search-input" placeholder="Suche..." />
        {/* V62: Button ohne zugänglichen Namen (syntaktisch, WCAG 4.1.2) */}
        <button className="btn-icon-small" onClick={() => {}}>&#128269;</button>
      </div>

      {/* V63: Filter-Chips: divs mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
      <div className="filter-chips">
        <div className="chip active-chip" onClick={() => {}}>Alle</div>
        <div className="chip" onClick={() => {}}>PDF</div>
        <div className="chip" onClick={() => {}}>Docs</div>
        <div className="chip" onClick={() => {}}>Wiki</div>
      </div>

      <ul className="search-results-list">
        {RESULTS.map((r) => (
          // V64-V67: Suchergebnis-Karten: onClick auf li ohne onKeyDown (semantisch, WCAG 2.1.1)
          <li key={r.id} className="search-result-item" onClick={() => alert(r.title)}>
            {/* V68: Typ-Badge nur durch Farbe (semantisch, WCAG 1.4.1) */}
            <span className={`type-badge ${r.type.toLowerCase()}`}></span>
            <div className="result-content">
              <span className="result-title">{r.title}</span>
              {/* V69: Kontrast Datum zu niedrig (layout, WCAG 1.4.3) */}
              <span className="result-date">{r.date}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* V70: Paginierung role="button" ohne tabIndex (semantisch, WCAG 4.1.2) */}
      <div className="pagination">
        <div className="page-btn" role="button" onClick={() => {}}>Zurück</div>
        <div className="page-btn" role="button" onClick={() => {}}>Weiter</div>
      </div>
    </section>
  );
}
