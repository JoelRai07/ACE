import { useState } from "react";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import DataTable from "./components/DataTable";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import SearchResults from "./components/SearchResults";
import FileUpload from "./components/FileUpload";
import Calendar from "./components/Calendar";
import Chat from "./components/Chat";
import HelpCenter from "./components/HelpCenter";
import "./styles.css";

/**
 * ACE Test-100: Enterprise-App mit 100 WCAG-Violations.
 * Violations in App.tsx: V1-V10
 */

type Page = "dashboard" | "profile" | "data" | "notifications" | "settings" | "search" | "upload" | "calendar" | "chat" | "help";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const pages: { key: Page; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "profile", label: "Profil" },
    { key: "data", label: "Daten" },
    { key: "notifications", label: "Meldungen" },
    { key: "settings", label: "Einstellungen" },
    { key: "search", label: "Suche" },
    { key: "upload", label: "Upload" },
    { key: "calendar", label: "Kalender" },
    { key: "chat", label: "Chat" },
    { key: "help", label: "Hilfe" },
  ];

  return (
    <div className="app">
      {/* V1: Skip-Link fehlt (semantisch, WCAG 2.4.1) */}

      {/* V2: <html> ohne lang-Attribut (syntaktisch, WCAG 3.1.1) — in index.html */}

      <header className="app-header">
        {/* V3: Logo ohne alt (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/140x40/0057B8/white" className="logo" />

        {/* V4: Deko-Bild ohne alt="" (syntaktisch, WCAG 1.1.1) */}
        <img src="https://placehold.co/24x24/ccc/999" className="header-icon" />

        {/* V5: Button ohne zugaenglichen Namen (syntaktisch, WCAG 4.1.2) */}
        <button className="btn-icon-header" onClick={() => {}}>
          <span aria-hidden="true">&#9776;</span>
        </button>

        {/* V6: Kontrast Badge (layout, WCAG 1.4.3) */}
        <span className="header-badge">5 neu</span>

        {/* V7: <a> ohne href (semantisch, WCAG 2.1.1) */}
        <a className="header-link">Hilfe</a>
      </header>

      {/* V8: DOM-Reihenfolge weicht von visueller ab durch CSS order (semantisch, WCAG 1.3.2) */}
      <div className="app-body">
        <nav className="sidebar">
          {/* V9: <nav> ohne aria-label bei mehrfacher nav (syntaktisch, WCAG 1.3.1) */}
          <ul className="sidebar-list">
            {pages.map((p) => (
              // V10: onClick auf <li> ohne onKeyDown (semantisch, WCAG 2.1.1) — 10 Instanzen, zaehlt als 1 Violation-Typ
              <li
                key={p.key}
                className={`sidebar-item ${page === p.key ? "active" : ""}`}
                onClick={() => setPage(p.key)}
              >
                {p.label}
              </li>
            ))}
          </ul>
        </nav>

        <main id="main-content" className="app-main">
          {page === "dashboard" && <Dashboard />}
          {page === "profile" && <UserProfile />}
          {page === "data" && <DataTable />}
          {page === "notifications" && <Notifications />}
          {page === "settings" && <Settings />}
          {page === "search" && <SearchResults />}
          {page === "upload" && <FileUpload />}
          {page === "calendar" && <Calendar />}
          {page === "chat" && <Chat />}
          {page === "help" && <HelpCenter />}
        </main>
      </div>

      <footer className="app-footer">
        <p>ACE Test-100 Synthetische Testkomponente</p>
      </footer>
    </div>
  );
}
