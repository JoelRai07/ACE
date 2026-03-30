/**
 * Sidebar — Navigation mit Violations V9-V15
 */

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: "dashboard" | "profile" | "data" | "notifications") => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    // V9: <nav> ohne aria-label bei mehreren nav-Elementen (syntaktisch, WCAG 1.3.1)
    <nav className="sidebar">
      <ul className="sidebar-list">
        {/* V10: onClick auf <li> ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li
          className={`sidebar-item ${currentPage === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </li>

        {/* V11: onClick auf <li> ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li
          className={`sidebar-item ${currentPage === "profile" ? "active" : ""}`}
          onClick={() => onNavigate("profile")}
        >
          Profil
        </li>

        {/* V12: onClick auf <li> ohne onKeyDown + role="button" ohne tabIndex (semantisch, WCAG 4.1.2) */}
        <li
          className={`sidebar-item ${currentPage === "data" ? "active" : ""}`}
          role="button"
          onClick={() => onNavigate("data")}
        >
          Datentabelle
        </li>

        {/* V13: onClick auf <li> ohne onKeyDown (semantisch, WCAG 2.1.1) */}
        <li
          className={`sidebar-item ${currentPage === "notifications" ? "active" : ""}`}
          onClick={() => onNavigate("notifications")}
        >
          Benachrichtigungen
        </li>
      </ul>

      {/* V14: Sidebar-Footer mit zu kleinem Klickziel (layout, WCAG 2.5.8) */}
      <div className="sidebar-footer">
        <button className="btn-tiny-sidebar" onClick={() => {}}>
          Minimieren
        </button>
      </div>

      {/* V15: aria-hidden="true" auf fokussierbarem Element (syntaktisch, WCAG 4.1.2) */}
      <a href="#settings" aria-hidden="true" tabIndex={0} className="sidebar-settings-link">
        Einstellungen
      </a>
    </nav>
  );
}
