# Evaluation To-do (Kurzfassung)

## Ziel
- Beitrag lokaler LLMs für Priorisierung/Aufbereitung bewerten (FF1).
- Mehrwert von Codekontext + LLM-Detektor gegenüber Tool-only prüfen (FF2).

## Versuchsdesign
- Modelle: qwen2.5-coder:7b, qwen2.5-coder:14b, qwen3:32b, deepseek-r1:70b.
- Suiten: 12 (10 tests), 50 (5 tests), 100 Fehler (5 tests).
- Bedingungen:
  - axe-only
  - tools-only (axe + Playwright + grep)
  - tools + LLM-Priorisierung
  - tools + LLM-Detektor + LLM-Priorisierung
  - optional: ohne grep
- Reproduzierbarkeit fixieren: gleiche Prompts, Temperature, Hardware/VM, Zeitfenster.

## Metriken
- Detektion: Recall, Precision, F1, False-Positive-Rate.
- Empfehlungsqualität: 0/1/2.
- Formatstabilität: Parsing-Quote.
- Effizienz: Laufzeit pro Phase + Gesamt, Prompt-/Output-Tokens.

## 3-Dimensionen-Auswertung
- Verstoßkategorie: syntaktisch, semantisch, layout.
- WCAG-Ebene: z. B. 1.1.1, 2.1.1, 2.4.7.
- Pipeline/Modellgröße: Ablation + Qualitäts/Laufzeit-Trade-off.

## Ergebnisdarstellung
- Quantitativ: Gesamtmetriken, 3-Dimensionen-Tabellen, Laufzeit/Token (Median/Mittel/Streuung).
- Qualitativ: mind. 3 Fallbeispiele (gut, teilweise, Halluzination) inkl. 0/1/2-Bewertung.

## Limitationen
- axe-core nur Initialzustand.
- grep-Regex-Limits/False Positives.
- Modell-Halluzinationen/Formatabweichungen.
- Externe Validität: derzeit eine SPA-Klasse.

## Kapitelabschluss
- FF1 und FF2 jeweils mit klarer Ja/Nein-Aussage + 2-3 Kennzahlen beantworten.
