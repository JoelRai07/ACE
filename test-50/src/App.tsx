import { useState } from "react";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import DataTable from "./components/DataTable";
import Notifications from "./components/Notifications";
import Sidebar from "./components/Sidebar";
import "./styles.css";

/**
 * ACE Test-50: Synthetische Testkomponente mit 50 WCAG-Violations.
 * Simuliert eine realistische Intranet-Dashboard-Anwendung.
 *
 * Violations in App.tsx: V1-V8
 */

type Page = "dashboard" | "profile" | "data" | "notifications";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="app">
      {/* V1: Skip-Link fehlt (semantisch, WCAG 2.4.1) */}

      {/* V2: <html> hat kein lang-Attribut — ist in index.html (syntaktisch, WCAG 3.1.1) */}

      <header className="app-header">
        {/* V3: Logo ohne alt-Attribut (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/140x40/0057B8/white" className="logo" />

        {/* V4: Dekoratives Bild ohne alt="" oder role="presentation" (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/24x24/ccc/999" className="header-icon" />

        <div className="header-actions">
          {/* V5: Button ohne zugaenglichen Namen (syntaktisch, WCAG 4.1.2) */}
          <button className="btn-icon-header" onClick={() => {}}>
            <span aria-hidden="true">&#9776;</span>
          </button>

          {/* V6: Link ohne href — nicht fokussierbar/interagierbar (semantisch, WCAG 2.1.1) */}
          <a className="header-link">Hilfe</a>

          {/* V7: Kontrast Header-Badge zu niedrig (layout, WCAG 1.4.3) */}
          <span className="header-badge">3 neu</span>
        </div>
      </header>

      {/* V8: DOM-Reihenfolge weicht von visueller Reihenfolge ab — CSS order (semantisch, WCAG 1.3.2) */}
      <div className="app-body">
        <Sidebar currentPage={page} onNavigate={setPage} />
        <main className="app-main">
          {page === "dashboard" && <Dashboard />}
          {page === "profile" && <UserProfile />}
          {page === "data" && <DataTable />}
          {page === "notifications" && <Notifications />}
        </main>
      </div>

      <footer className="app-footer">
        <p>ACE Test-50 Synthetische Testkomponente</p>
      </footer>
    </div>
  );
}
