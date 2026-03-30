# ACE Test-50 – Synthetische Testkomponente (50 Violations)

Dieses Projekt simuliert eine realistische Intranet-Dashboard-Anwendung mit **50 bewusst eingebauten WCAG-Violations** zur Evaluation des ACE-PoC.

## Setup

```bash
npm install
npm run dev
# -> http://localhost:5174
```

## Violations-Tabelle

| #   | Violation                                          | Kategorie   | Erwartete Quelle      | WCAG  | Datei / Stelle                    |
| --- | -------------------------------------------------- | ----------- | --------------------- | ----- | --------------------------------- |
| V1  | Skip-Link fehlt                                    | semantisch  | Playwright            | 2.4.1 | App.tsx                           |
| V2  | `<html>` ohne `lang`-Attribut                      | syntaktisch | axe-core              | 3.1.1 | index.html                        |
| V3  | Logo `<img>` ohne `alt`                            | syntaktisch | axe-core + grep       | 1.1.1 | App.tsx                           |
| V4  | Deko-Bild ohne `alt=""` / `role="presentation"`    | syntaktisch | axe-core + grep       | 1.1.1 | App.tsx                           |
| V5  | Hamburger-Button ohne zugaenglichen Namen           | syntaktisch | axe-core              | 4.1.2 | App.tsx                           |
| V6  | `<a>` ohne `href` — nicht fokussierbar             | semantisch  | axe-core              | 2.1.1 | App.tsx                           |
| V7  | Badge Kontrast zu niedrig (#aac auf #0057b8)       | layout      | axe-core              | 1.4.3 | styles.css                        |
| V8  | CSS `order` weicht von DOM-Reihenfolge ab          | semantisch  | axe-core              | 1.3.2 | styles.css                        |
| V9  | `<nav>` ohne `aria-label`                          | syntaktisch | axe-core              | 1.3.1 | Sidebar.tsx                       |
| V10 | `onClick` auf `<li>` ohne `onKeyDown`              | semantisch  | grep                  | 2.1.1 | Sidebar.tsx                       |
| V11 | `onClick` auf `<li>` ohne `onKeyDown`              | semantisch  | grep                  | 2.1.1 | Sidebar.tsx                       |
| V12 | `role="button"` ohne `tabIndex`                    | semantisch  | axe-core + grep       | 4.1.2 | Sidebar.tsx                       |
| V13 | `onClick` auf `<li>` ohne `onKeyDown`              | semantisch  | grep                  | 2.1.1 | Sidebar.tsx                       |
| V14 | Button 16x16px < 24x24px Mindestgroesse            | layout      | grep (CSS)            | 2.5.8 | styles.css                        |
| V15 | `aria-hidden="true"` auf fokussierbarem Element    | syntaktisch | axe-core              | 4.1.2 | Sidebar.tsx                       |
| V16 | Ueberschriften-Hierarchie uebersprungen (h3 statt h1) | semantisch | axe-core          | 1.3.1 | Dashboard.tsx                     |
| V17 | KPI-Icon `<img>` ohne `alt`                        | syntaktisch | axe-core + grep       | 1.1.1 | Dashboard.tsx                     |
| V18 | KPI-Wert Kontrast zu niedrig (#bbb auf #fff)       | layout      | axe-core              | 1.4.3 | styles.css                        |
| V19 | KPI-Icon `<img>` ohne `alt`                        | syntaktisch | axe-core + grep       | 1.1.1 | Dashboard.tsx                     |
| V20 | `onClick` auf `<div>` ohne `onKeyDown`             | semantisch  | grep                  | 2.1.1 | Dashboard.tsx                     |
| V21 | `role="button"` auf `<div>` ohne `tabIndex`        | semantisch  | axe-core + grep       | 4.1.2 | Dashboard.tsx                     |
| V22 | Chart-Bild ohne `alt`                              | syntaktisch | axe-core + grep       | 1.1.1 | Dashboard.tsx                     |
| V23 | Tabelle ohne `<caption>` oder `aria-label`         | semantisch  | axe-core              | 1.3.1 | Dashboard.tsx                     |
| V24 | `<th>` ohne `scope`-Attribut                       | syntaktisch | axe-core              | 1.3.1 | Dashboard.tsx                     |
| V25 | Status nur durch Farbe kodiert                     | semantisch  | manuell               | 1.4.1 | Dashboard.tsx                     |
| V26 | Avatar `<img>` ohne `alt`                          | syntaktisch | axe-core + grep       | 1.1.1 | UserProfile.tsx                   |
| V27 | Input ohne `<label>` (Anzeigename)                 | syntaktisch | axe-core              | 1.3.1 | UserProfile.tsx                   |
| V28 | Input ohne `<label>` (E-Mail)                      | syntaktisch | axe-core              | 1.3.1 | UserProfile.tsx                   |
| V29 | Textarea ohne `<label>` (Bio)                      | syntaktisch | axe-core              | 1.3.1 | UserProfile.tsx                   |
| V30 | Pflichtfeld ohne `required` / `aria-required`      | syntaktisch | manuell               | 3.3.2 | UserProfile.tsx                   |
| V31 | Fehlermeldung nicht programmatisch verknuepft       | semantisch  | manuell               | 3.3.1 | UserProfile.tsx                   |
| V32 | Button Kontrast zu niedrig (#999 auf #fff)         | layout      | axe-core              | 1.4.3 | styles.css                        |
| V33 | `outline: none` auf Button (Fokus entfernt)        | layout      | Playwright            | 2.4.7 | UserProfile.tsx                   |
| V34 | Statusmeldung ohne `aria-live`                     | semantisch  | manuell               | 4.1.3 | UserProfile.tsx                   |
| V35 | Duplikat-ID `help-text`                            | syntaktisch | axe-core              | 4.1.1 | UserProfile.tsx                   |
| V36 | `onClick` auf `<span>` ohne `onKeyDown`            | semantisch  | grep                  | 2.1.1 | DataTable.tsx                     |
| V37 | Suchfeld ohne sichtbares Label                     | syntaktisch | axe-core              | 1.3.1 | DataTable.tsx                     |
| V38 | Tabelle ohne `<caption>`                           | semantisch  | axe-core              | 1.3.1 | DataTable.tsx                     |
| V39 | Checkbox ohne Label (Header)                       | syntaktisch | axe-core              | 1.3.1 | DataTable.tsx                     |
| V40 | Checkbox ohne Label (Zeilen)                       | syntaktisch | axe-core              | 1.3.1 | DataTable.tsx                     |
| V41 | Status nur durch Farbe kodiert                     | semantisch  | manuell               | 1.4.1 | DataTable.tsx                     |
| V42 | Icon-Button ohne zugaenglichen Namen               | syntaktisch | axe-core              | 4.1.2 | DataTable.tsx                     |
| V43 | Paginierung: `onClick` auf `<div>` ohne Keyboard   | semantisch  | grep                  | 2.1.1 | DataTable.tsx                     |
| V44 | `<li>` mit `onClick` ohne `onKeyDown`              | semantisch  | grep                  | 2.1.1 | Notifications.tsx                 |
| V45 | Ungelesen nur durch Farbe kodiert                  | semantisch  | manuell               | 1.4.1 | Notifications.tsx                 |
| V46 | Zeitangabe Kontrast zu niedrig (#bbb auf #fff)     | layout      | axe-core              | 1.4.3 | styles.css                        |
| V47 | Button 16x16px < 24x24px Mindestgroesse            | layout      | grep (CSS)            | 2.5.8 | styles.css                        |
| V48 | Modaler Dialog ohne Fokus-Trap                     | semantisch  | Playwright            | 2.1.2 | Notifications.tsx                 |
| V49 | Dialog ohne `aria-labelledby`                      | syntaktisch | axe-core              | 4.1.2 | Notifications.tsx                 |
| V50 | `outline: none` im Modal-Button (Fokus entfernt)  | layout      | Playwright            | 2.4.7 | Notifications.tsx                 |

## Kategorie-Verteilung

| Kategorie   | Violations                                                          | Anzahl |
| ----------- | ------------------------------------------------------------------- | ------ |
| syntaktisch | V2-V5, V9, V15, V17, V19, V22, V24, V26-V30, V35, V37, V39-V40, V42, V49 | 20 |
| semantisch  | V1, V6, V8, V10-V13, V16, V20-V21, V23, V25, V31, V34, V36, V38, V41, V43-V45, V48 | 21 |
| layout      | V7, V14, V18, V32-V33, V46-V47, V50                                | 9      |

## Hinweis

Alle Violations sind absichtlich eingebaut und durch Kommentare im Quellcode dokumentiert.
Dieses Projekt ist ausschliesslich fuer Evaluationszwecke im Rahmen der Bachelorarbeit bestimmt.
