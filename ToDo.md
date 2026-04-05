# Nächste Schritte bis zur Abgabe

## Phase 1 — Runs durchführen (nächste 3 Tage)

### BWEC (reale Anwendung)
- [ ] Pipeline auf BWEC-Client ausführen
- [ ] Manuelle Stichprobenverifikation (~10 Findings prüfen: stimmt das?)

### deepseek-r1:70b
- **Achtung:** In Kap. 7 steht jetzt, dass deepseek wegen RAM-Limit nicht evaluierbar war.
- Wenn du es doch laufen kannst → Satz in 7.tex Zeile ~21 rückgängig machen.
- Wenn nicht → einfach weglassen, Text passt so.

---

## Phase 2 — Evaluation dokumentieren

### test-50 & test-100
Benötigte Kennzahlen je Suite:
- Recall pro Verstoßkategorie (Tabelle analog zu `tab:recall_kategorie`)
- Wurde `tokensBudgetTruncated: true` ausgelöst?
- Laufzeit im Vergleich zu test-12
- 2–3 Sätze zu Skalierungseffekten (mehr Violations → mehr Token-Druck?)

### BWEC (Kap. 7, Sec. 7.7.2 — Platzhalter befüllen)
- Anzahl gemeldeter Violations gesamt
- Stichprobenverifikation: Wie viele der geprüften Findings sind valide?
- Qualitative Einschätzung der Fix-Vorschläge (Stufe 0/1/2 für Stichprobe)
- Hinweis: Keine Ground Truth → kein formaler Recall messbar

---

## Phase 3 — Textkorrekturen (nach den Runs)

### Pflicht (geht so nicht zur Abgabe)
- [ ] Kap. 7 Sec. 7.7.1 Platzhaltertext ersetzen (test-50/100 Ergebnisse)
- [ ] Kap. 7 Sec. 7.7.2 Platzhaltertext ersetzen (BWEC Ergebnisse)
- [ ] Alle "geplant"-Formulierungen in Vergangenheitsform umschreiben
  - 7.tex Zeile ~9: "sind als Folgeschritte geplant" → "wurden durchgeführt"
  - 7.tex Zeile ~285: "sind als Folgeschritte geplant" → entfernen
  - 7.tex Zeile ~46: "zeigt die geplante Verteilung" → anpassen
  - 8.tex Zeile ~48: "sollen Benchmarkläufe... durchgeführt werden" → Vergangenheit
- [ ] Benchmark-Tabelle `tab:benchmark_runs` mit echten Zahlen aktualisieren
  (-- → tatsächliche Run-Zahlen; "Gesamt (durchgeführt)" aktualisieren)
- [ ] Kapitelintro Kap. 7 Zeile 3: "skizziert die geplante Erweiterung" → anpassen

### Inkonsistenz im Anhang
- [ ] Anhang 16 (`tab:modellvergleich_4`): NFA-02 für qwen3:32b steht als ✓
  → ändern auf z.B. "(~)" oder Fußnote, weil Kap. 7 jetzt "nicht vollständig erfüllt" sagt

### Später (eigene Session)
- [ ] Kürzungen (Seitenlimit überschritten)

---

## Bereits erledigt (diese Session)

- [x] Section 7.8 "Handlungsempfehlungen und Ausblick" aus Kap. 7 entfernt (war doppelt)
- [x] Kap. 8 Kritische Reflexion gestrafft (Redundanz mit Kap. 7 beseitigt)
- [x] Modellwahl von \subsection zu \section hochgestuft (war strukturell falsch)
- [x] deepseek-Ausschluss in Kap. 7 mit RAM-Begründung versehen
- [x] qwen3:32b NFA-02-Bewertung ehrlich formuliert (max. 937s = nicht konform)
- [x] "90% Run-Konsistenz" durch σ = 0,53 mit Quellenangabe ersetzt
- [x] V8 Playwright-Gap erklärt (warum kein generischer Fokus-Trap-Test)
- [x] Mehrheitsprinzip (>5/10) begründet
- [x] 10 vs. 3 Runs Begründung in Tabellenunterschrift
- [x] Benchmark-Tabelle auf README-Werte aktualisiert
- [x] Chunk-Definition in Kap. 5 ergänzt
- [x] Zwei LLM-Stufen in Kap. 5 explizit mit Evaluation verknüpft
- [x] Max-Dateien Inkonsistenz (60 Default vs. 25 Benchmarks) in Kap. 6 erklärt
- [x] num_predict Inkonsistenz (6144 vs. 3072) in Kap. 6 erklärt
- [x] PipelineMetrics → Evaluationskennzahlen Verbindung in Kap. 6 ergänzt




Test-100 Screenshots ergänzen
2 bis 4 Screenshots der wichtigsten Problemstellen
Kurze Bildunterschrift: welche Violation sichtbar ist und warum relevant
Reproduzierbarkeitsblatt
Hardware (CPU, RAM, GPU falls genutzt)
OS + Version
Modellnamen/Versionen
Zentrale Parameter: Temperature, num_predict, Chunk-Größe, Runs pro Modell
Toolchain-Versionen (Ollama, Node, relevante Libraries)
Console-Output-Auszüge
Je Suite: ein „normaler“ guter Run
Zusätzlich insgesamt 1 Grenzfall (z. B. Truncation)
Nur 8-15 relevante Zeilen je Auszug, mit 1 Satz Interpretation darunter
Threats to Validity
Interne Validität: Prompt-/Modellabhängigkeit
Externe Validität: Übertragbarkeit auf andere Codebasen
Konstruktvalidität: Metriken repräsentieren nicht alle Qualitätsdimensionen
Fazit mit kurzer Einordnung der Auswirkungen
Run-Protokoll-Tabelle
Spalten: Suite, Modell, Run, LLM-Detektor-Zeit, Priorisierungszeit, Gesamtzeit, Parse-Erfolg, Truncation
Ziel: Ausreißer und Stabilität schnell nachvollziehbar machen
Mini-Deduplizierungsnachweis (einfacher Vorschlag)
Weil echte Deduplizierung intern im LLM passiert, nutze eine Proxy-Sicht:
Tabelle mit drei Stufen je Modell/Suite:
Roh-Findings gesamt (Axe + PW + Grep + LLM-Detektor)
Finale Report-Items (Must + Nice)
Kompressionsfaktor = finale Items / Roh-Findings
Vorteil: zeigt indirekt, dass Konsolidierung stattfindet, ohne interne LLM-Merge-Logs zu brauchen