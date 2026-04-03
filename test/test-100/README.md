# ACE Test-100 – Synthetische Testkomponente (100 Violations)

Enterprise-App mit **100 bewusst eingebauten WCAG-Violations** zur Evaluation des ACE-PoC.

## Setup

```bash
npm install
npm run dev
# -> http://localhost:5175
```

## Violations-Tabelle

| #    | Violation                                          | Kategorie   | Erwartete Quelle | WCAG  | Datei               |
| ---- | -------------------------------------------------- | ----------- | ---------------- | ----- | ------------------- |
| V1   | Skip-Link fehlt                                    | semantisch  | Playwright       | 2.4.1 | App.tsx             |
| V2   | `<html>` ohne `lang`                               | syntaktisch | axe-core         | 3.1.1 | index.html          |
| V3   | Logo ohne `alt`                                    | syntaktisch | axe-core + grep  | 1.1.1 | App.tsx             |
| V4   | Deko-Bild ohne `alt=""`                            | syntaktisch | axe-core + grep  | 1.1.1 | App.tsx             |
| V5   | Button ohne zugänglichen Namen                    | syntaktisch | axe-core         | 4.1.2 | App.tsx             |
| V6   | Badge Kontrast zu niedrig                          | layout      | axe-core         | 1.4.3 | styles.css          |
| V7   | `<a>` ohne `href`                                  | semantisch  | axe-core         | 2.1.1 | App.tsx             |
| V8   | CSS `order` weicht von DOM ab                      | semantisch  | axe-core         | 1.3.2 | styles.css          |
| V9   | `<nav>` ohne `aria-label`                          | syntaktisch | axe-core         | 1.3.1 | App.tsx             |
| V10  | `onClick` auf `<li>` ohne `onKeyDown`              | semantisch  | grep             | 2.1.1 | App.tsx             |
| V11  | Headings übersprungen (h3)                        | semantisch  | axe-core         | 1.3.1 | Dashboard.tsx       |
| V12  | KPI-Icon ohne `alt`                                | syntaktisch | axe-core + grep  | 1.1.1 | Dashboard.tsx       |
| V13  | KPI-Wert Kontrast niedrig                          | layout      | axe-core         | 1.4.3 | styles.css          |
| V14  | KPI-Icon ohne `alt`                                | syntaktisch | axe-core + grep  | 1.1.1 | Dashboard.tsx       |
| V15  | `onClick` auf div ohne `onKeyDown`                 | semantisch  | grep             | 2.1.1 | Dashboard.tsx       |
| V16  | `role="button"` ohne `tabIndex`                    | semantisch  | axe-core + grep  | 4.1.2 | Dashboard.tsx       |
| V17  | Chart ohne `alt`                                   | syntaktisch | axe-core + grep  | 1.1.1 | Dashboard.tsx       |
| V18  | Tabelle ohne `<caption>`                           | semantisch  | axe-core         | 1.3.1 | Dashboard.tsx       |
| V19  | `<th>` ohne `scope`                                | syntaktisch | axe-core         | 1.3.1 | Dashboard.tsx       |
| V20  | Status nur durch Farbe                             | semantisch  | manuell          | 1.4.1 | Dashboard.tsx       |
| V21  | Avatar ohne `alt`                                  | syntaktisch | axe-core + grep  | 1.1.1 | UserProfile.tsx     |
| V22  | Input ohne `<label>`                               | syntaktisch | axe-core         | 1.3.1 | UserProfile.tsx     |
| V23  | Input ohne `<label>`                               | syntaktisch | axe-core         | 1.3.1 | UserProfile.tsx     |
| V24  | Textarea ohne `<label>`                            | syntaktisch | axe-core         | 1.3.1 | UserProfile.tsx     |
| V25  | Pflichtfeld ohne `required`                        | syntaktisch | manuell          | 3.3.2 | UserProfile.tsx     |
| V26  | Fehlermeldung nicht verknüpft                     | semantisch  | manuell          | 3.3.1 | UserProfile.tsx     |
| V27  | Button Kontrast niedrig                            | layout      | axe-core         | 1.4.3 | styles.css          |
| V28  | `outline: none` auf Button                         | layout      | Playwright       | 2.4.7 | UserProfile.tsx     |
| V29  | Statusmeldung ohne `aria-live`                     | semantisch  | manuell          | 4.1.3 | UserProfile.tsx     |
| V30  | Duplikat-ID                                        | syntaktisch | axe-core         | 4.1.1 | UserProfile.tsx     |
| V31  | `onClick` auf span ohne `onKeyDown`                | semantisch  | grep             | 2.1.1 | DataTable.tsx       |
| V32  | Suchfeld ohne Label                                | syntaktisch | axe-core         | 1.3.1 | DataTable.tsx       |
| V33  | Tabelle ohne `<caption>`                           | semantisch  | axe-core         | 1.3.1 | DataTable.tsx       |
| V34  | Checkbox ohne Label                                | syntaktisch | axe-core         | 1.3.1 | DataTable.tsx       |
| V35  | Checkbox ohne Label (Zeilen)                       | syntaktisch | axe-core         | 1.3.1 | DataTable.tsx       |
| V36  | Status nur durch Farbe                             | semantisch  | manuell          | 1.4.1 | DataTable.tsx       |
| V37  | Icon-Button ohne Namen                             | syntaktisch | axe-core         | 4.1.2 | DataTable.tsx       |
| V38  | Paginierung onClick ohne Keyboard                  | semantisch  | grep             | 2.1.1 | DataTable.tsx       |
| V39  | Paginierung onClick ohne Keyboard                  | semantisch  | grep             | 2.1.1 | DataTable.tsx       |
| V40  | Paginierung onClick ohne Keyboard                  | semantisch  | grep             | 2.1.1 | DataTable.tsx       |
| V41  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | Notifications.tsx   |
| V42  | Ungelesen nur durch Farbe                          | semantisch  | manuell          | 1.4.1 | Notifications.tsx   |
| V43  | Kontrast Zeitangabe niedrig                        | layout      | axe-core         | 1.4.3 | styles.css          |
| V44  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | Notifications.tsx   |
| V45  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | Notifications.tsx   |
| V46  | Button 16x16 < 24x24                               | layout      | grep (CSS)       | 2.5.8 | styles.css          |
| V47  | Modal ohne Fokus-Trap                              | semantisch  | Playwright       | 2.1.2 | Notifications.tsx   |
| V48  | Dialog ohne `aria-labelledby`                      | syntaktisch | axe-core         | 4.1.2 | Notifications.tsx   |
| V49  | `outline: none` auf Button                         | layout      | Playwright       | 2.4.7 | Notifications.tsx   |
| V50  | `aria-hidden` auf fokussierbar                     | syntaktisch | axe-core         | 4.1.2 | Notifications.tsx   |
| V51  | Tab onClick ohne `onKeyDown`                       | semantisch  | grep             | 2.1.1 | Settings.tsx        |
| V52  | Tab onClick ohne `onKeyDown`                       | semantisch  | grep             | 2.1.1 | Settings.tsx        |
| V53  | Tab onClick ohne `onKeyDown`                       | semantisch  | grep             | 2.1.1 | Settings.tsx        |
| V54  | Toggle ohne zugänglichen Namen                    | syntaktisch | axe-core         | 4.1.2 | Settings.tsx        |
| V55  | Select ohne Label                                  | syntaktisch | axe-core         | 1.3.1 | Settings.tsx        |
| V56  | Input ohne Label                                   | syntaktisch | axe-core         | 1.3.1 | Settings.tsx        |
| V57  | Passwortfeld ohne Label                            | syntaktisch | axe-core         | 1.3.1 | Settings.tsx        |
| V58  | Passwortfeld ohne Label                            | syntaktisch | axe-core         | 1.3.1 | Settings.tsx        |
| V59  | Button Kontrast niedrig                            | layout      | axe-core         | 1.4.3 | styles.css          |
| V60  | Checkbox ohne Label                                | syntaktisch | axe-core         | 1.3.1 | Settings.tsx        |
| V61  | Suchfeld ohne Label                                | syntaktisch | axe-core         | 1.3.1 | SearchResults.tsx   |
| V62  | Button ohne Namen                                  | syntaktisch | axe-core         | 4.1.2 | SearchResults.tsx   |
| V63  | Filter-Chips onClick ohne Keyboard                 | semantisch  | grep             | 2.1.1 | SearchResults.tsx   |
| V64  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | SearchResults.tsx   |
| V65  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | SearchResults.tsx   |
| V66  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | SearchResults.tsx   |
| V67  | `<li>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | SearchResults.tsx   |
| V68  | Typ-Badge nur durch Farbe                          | semantisch  | manuell          | 1.4.1 | SearchResults.tsx   |
| V69  | Kontrast Datum niedrig                             | layout      | axe-core         | 1.4.3 | styles.css          |
| V70  | Paginierung `role="button"` ohne `tabIndex`        | semantisch  | axe-core + grep  | 4.1.2 | SearchResults.tsx   |
| V71  | Dropzone onClick ohne `onKeyDown`                  | semantisch  | grep             | 2.1.1 | FileUpload.tsx      |
| V72  | Upload-Icon ohne `alt`                             | syntaktisch | axe-core + grep  | 1.1.1 | FileUpload.tsx      |
| V73  | File-Input ohne Label                              | syntaktisch | axe-core         | 1.3.1 | FileUpload.tsx      |
| V74  | Löschen-Button ohne Namen                         | syntaktisch | axe-core         | 4.1.2 | FileUpload.tsx      |
| V75  | Progressbar ohne `aria-valuenow`                   | syntaktisch | axe-core         | 4.1.2 | FileUpload.tsx      |
| V76  | Kontrast Hilfetext niedrig                         | layout      | axe-core         | 1.4.3 | styles.css          |
| V77  | Button 16x16 < 24x24                               | layout      | grep (CSS)       | 2.5.8 | styles.css          |
| V78  | Modal ohne Fokus-Trap                              | semantisch  | Playwright       | 2.1.2 | FileUpload.tsx      |
| V79  | Dialog ohne `aria-labelledby`                      | syntaktisch | axe-core         | 4.1.2 | FileUpload.tsx      |
| V80  | `outline: none` auf Button                         | layout      | Playwright       | 2.4.7 | FileUpload.tsx      |
| V81  | Tabelle ohne `<caption>`                           | semantisch  | axe-core         | 1.3.1 | Calendar.tsx        |
| V82  | `<th>` ohne `scope`                                | syntaktisch | axe-core         | 1.3.1 | Calendar.tsx        |
| V83  | `<td>` onClick ohne `onKeyDown`                    | semantisch  | grep             | 2.1.1 | Calendar.tsx        |
| V84  | Event nur durch Farbe                              | semantisch  | manuell          | 1.4.1 | Calendar.tsx        |
| V85  | `role="button"` ohne `tabIndex`                    | semantisch  | axe-core + grep  | 4.1.2 | Calendar.tsx        |
| V86  | Detail ohne `aria-live`                            | semantisch  | manuell          | 4.1.3 | Calendar.tsx        |
| V87  | Banner-Bild ohne `alt`                             | syntaktisch | axe-core + grep  | 1.1.1 | Calendar.tsx        |
| V88  | Chat ohne `aria-live`                              | semantisch  | manuell          | 4.1.3 | Chat.tsx            |
| V89  | Kontrast Zeitstempel niedrig                       | layout      | axe-core         | 1.4.3 | styles.css          |
| V90  | Chat-Input ohne Label                              | syntaktisch | axe-core         | 1.3.1 | Chat.tsx            |
| V91  | Senden-Button ohne Namen                           | syntaktisch | axe-core         | 4.1.2 | Chat.tsx            |
| V92  | Emoji onClick ohne `onKeyDown`                     | semantisch  | grep             | 2.1.1 | Chat.tsx            |
| V93  | Online-Status nur durch Farbe                      | semantisch  | manuell          | 1.4.1 | Chat.tsx            |
| V94  | Kontrast Hilfetext niedrig                         | layout      | axe-core         | 1.4.3 | styles.css          |
| V95  | Suchfeld ohne Label                                | syntaktisch | axe-core         | 1.3.1 | HelpCenter.tsx      |
| V96  | Accordion onClick ohne `onKeyDown`                 | semantisch  | grep             | 2.1.1 | HelpCenter.tsx      |
| V97  | Accordion ohne `aria-expanded`                     | semantisch  | manuell          | 4.1.2 | HelpCenter.tsx      |
| V98  | Kontaktbild ohne `alt`                             | syntaktisch | axe-core + grep  | 1.1.1 | HelpCenter.tsx      |
| V99  | Kontrast Kontaktinfo niedrig                       | layout      | axe-core         | 1.4.3 | styles.css          |
| V100 | `aria-hidden` auf fokussierbar                     | syntaktisch | axe-core         | 4.1.2 | HelpCenter.tsx      |

## Kategorie-Verteilung

| Kategorie   | Anzahl |
| ----------- | ------ |
| syntaktisch | 38     |
| semantisch  | 43     |
| layout      | 19     |

## Hinweis

Alle Violations sind absichtlich eingebaut und durch Kommentare im Quellcode dokumentiert.
Dieses Projekt ist ausschließlich für Evaluationszwecke im Rahmen der Bachelorarbeit bestimmt.
