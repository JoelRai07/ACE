# Nächste Schritte bis zur Abgabe

## Phase 1 — Runs durchführen (nächste 3 Tage)

### test-50 (10 Runs × 3 Modelle = 30 Runs)
- [ ] qwen2.5-coder:7b — 10 Runs (num_predict = 8.192)
- [ ] qwen2.5-coder:14b — 10 Runs (num_predict = 8.192)
- [ ] qwen3:32b — 10 Runs (num_predict = 8.192)

### test-100 (3 Runs × 3 Modelle = 9 Runs)
- [ ] qwen2.5-coder:7b — 3 Runs (num_predict = 12.288)
- [ ] qwen2.5-coder:14b — 3 Runs (num_predict = 12.288)
- [ ] qwen3:32b — 3 Runs (num_predict = 12.288)

### BWEC (reale Anwendung)
- [ ] Pipeline auf BWEC-Client ausführen
- [ ] Manuelle Stichprobenverifikation (~10 Findings prüfen: stimmt das?)

### deepseek-r1:70b
- **Achtung:** In Kap. 7 steht jetzt, dass deepseek wegen RAM-Limit nicht evaluierbar war.
- Wenn du es doch laufen kannst → Satz in 7.tex Zeile ~21 rückgängig machen.
- Wenn nicht → einfach weglassen, Text passt so.

---

## Phase 2 — Evaluation dokumentieren

### test-50 & test-100 (Kap. 7, Sec. 7.7.1 — Platzhalter befüllen)
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
