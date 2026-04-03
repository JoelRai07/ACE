import { useState } from "react";

/**
 * DataTable — Datentabelle mit Sortierung und Paginierung. Violations V36-V43
 */

const DATA = [
  { id: 1, name: "Server Alpha", status: "online", load: 42 },
  { id: 2, name: "Server Beta", status: "offline", load: 0 },
  { id: 3, name: "Server Gamma", status: "online", load: 87 },
  { id: 4, name: "Server Delta", status: "wartung", load: 15 },
];

export default function DataTable() {
  const [selected, setSelected] = useState<number[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...DATA].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  return (
    <section className="datatable-section">
      <h1 className="section-title">Serverstatus</h1>

      <div className="table-toolbar">
        {/* V36: onClick auf span ohne Keyboard-Handler (semantisch, WCAG 2.1.1) */}
        <span className="sort-toggle" onClick={() => setSortAsc(!sortAsc)}>
          Sortierung: {sortAsc ? "A-Z" : "Z-A"}
        </span>

        {/* V37: Suchfeld ohne sichtbares Label (syntaktisch, WCAG 1.3.1) */}
        <input type="search" className="table-search" placeholder="Suchen..." />
      </div>

      {/* V38: Tabelle ohne caption (semantisch, WCAG 1.3.1) */}
      <table className="data-table">
        <thead>
          <tr>
            {/* V39: Checkbox ohne Label (syntaktisch, WCAG 1.3.1) */}
            <th><input type="checkbox" /></th>
            <th>Name</th>
            <th>Status</th>
            <th>Last (%)</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              {/* V40: Checkbox ohne Label (syntaktisch, WCAG 1.3.1) */}
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() =>
                    setSelected((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id],
                    )
                  }
                />
              </td>
              <td>{row.name}</td>
              {/* V41: Nur Farbe zur Statusanzeige, kein Text (semantisch, WCAG 1.4.1) */}
              <td><span className={`status-indicator ${row.status}`}></span></td>
              <td>{row.load}</td>
              <td>
                {/* V42: Icon-Button ohne zugänglichen Namen (syntaktisch, WCAG 4.1.2) */}
                <button className="btn-icon-small" onClick={() => alert(`Details ${row.name}`)}>
                  &#9998;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* V43: Paginierung als div mit onClick ohne Keyboard-Support (semantisch, WCAG 2.1.1) */}
      <div className="pagination">
        <div className="page-btn" onClick={() => {}}>&#9664; Zurück</div>
        <div className="page-btn active-page" onClick={() => {}}>1</div>
        <div className="page-btn" onClick={() => {}}>2</div>
        <div className="page-btn" onClick={() => {}}>Weiter &#9654;</div>
      </div>
    </section>
  );
}
