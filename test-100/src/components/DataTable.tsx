import { useState } from "react";

/**
 * DataTable — Violations V31-V40
 */

const DATA = [
  { id: 1, name: "Alpha", status: "online", load: 42 },
  { id: 2, name: "Beta", status: "offline", load: 0 },
  { id: 3, name: "Gamma", status: "online", load: 87 },
];

export default function DataTable() {
  const [selected, setSelected] = useState<number[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  return (
    <section>
      <h1>Datentabelle</h1>

      {/* V31: onClick auf span ohne onKeyDown (semantisch, WCAG 2.1.1) */}
      <span className="sort-toggle" onClick={() => setSortAsc(!sortAsc)}>
        Sortierung: {sortAsc ? "A-Z" : "Z-A"}
      </span>

      {/* V32: Suchfeld ohne Label (syntaktisch, WCAG 1.3.1) */}
      <input type="search" className="table-search" placeholder="Suchen..." />

      {/* V33: Tabelle ohne caption (semantisch, WCAG 1.3.1) */}
      <table className="data-table">
        <thead>
          <tr>
            {/* V34: Checkbox ohne Label (syntaktisch, WCAG 1.3.1) */}
            <th><input type="checkbox" /></th>
            <th>Name</th>
            <th>Status</th>
            <th>Last</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {DATA.map((row) => (
            <tr key={row.id}>
              {/* V35: Checkbox ohne Label (syntaktisch, WCAG 1.3.1) */}
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() =>
                    setSelected((p) => p.includes(row.id) ? p.filter((i) => i !== row.id) : [...p, row.id])
                  }
                />
              </td>
              <td>{row.name}</td>
              {/* V36: Status nur durch Farbe (semantisch, WCAG 1.4.1) */}
              <td><span className={`dot ${row.status}`}></span></td>
              <td>{row.load}%</td>
              <td>
                {/* V37: Icon-Button ohne zugaenglichen Namen (syntaktisch, WCAG 4.1.2) */}
                <button className="btn-icon-small" onClick={() => {}}>&#9998;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* V38-V40: Paginierung: 3x div mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */}
      <div className="pagination">
        <div className="page-btn" onClick={() => {}}>Zurueck</div>
        <div className="page-btn" onClick={() => {}}>1</div>
        <div className="page-btn" onClick={() => {}}>Weiter</div>
      </div>
    </section>
  );
}
