Auswertung: test-12 Suite — 3 Modelle × 10 Runs
1. Rohdaten-Übersicht
Metrik	7b	14b	32b
Parse-Erfolg	10/10	10/10	10/10
mustHave Ø	5.0	20.7	11.3
niceToHave Ø	18.3	0.0	9.7
LLM-Detektor Findings Ø	~10	~20	~19
Dauer Ø (Gesamt/Run)	~133s	~320s	~700s
outputTokens	3072 alle Runs	3072 alle Runs	3072 fast alle Runs
Problem: outputTokens = 3072 in nahezu allen Runs → Antwort wurde abgeschnitten. Die numPredict-Erhöhung auf 6144 war richtig.

2. Recall-Analyse — Was findet die Pipeline wirklich?
Ohne LLM-Detektor (Baseline): axe + Playwright + grep erkennen 8 von 12 Violations zuverlässig. V2, V8, V11, V12 wurden nicht erkannt.

Mit LLM-Detektor (alle Modelle):

Violation	Baseline	7b	14b	32b
V1 img alt	✓	✓	✓	✓
V3 Input-Label	✓	✓	✓	✓
V4 Kontrast	✓	✓	✓	✓
V5 outline:none	✓	✓	✓	✓
V6/V7 role=button	✓	✓	✓	✓
V9 Skip-Link	✓	✓	✓	✓
V10 aria-hidden	✓	✗	✓	✓
V8 Modal-FocusTrap	✗	✓	✓	✓
V11 DOM-Reihenfolge	✗	✗	~	✓
V12 Button-Größe	✗	~	✓	✓
V2 Button-Label	✗	✗	✓	✓
Recall	~8/12	~9/12	~11/12	~11-12/12
Zentrales Ergebnis für die BA: Der LLM-Detektor erhöht den Recall messbar gegenüber der reinen Tool-Pipeline. V8, V11 und V12 — nicht detektierbar durch axe/Playwright/grep — werden durch den LLM-Detektor erkannt.

3. Priorisierungsqualität (must-have vs. nice-to-have)
Hier zeigt sich der größte Qualitätsunterschied:

7b: Katastrophale Priorisierung. Klassifiziert pw-001 (Fokusindikator, WCAG-Pflicht) und pw-002 (Skip-Link, WCAG-Pflicht) als Nice-to-have — gesetzlich relevant falsch eingestuft. Setzt stattdessen Minor-Findings als Must-have. Nicht produktionstauglich.

14b: Alle 20-21 Findings als Must-have, 0 Nice-to-have. Über-kategorisiert systematisch alles als kritisch — keine Differenzierung. Für den Entwickler wenig hilfreich, da keine Priorität erkennbar.

32b: ~11 Must-have, ~10 Nice-to-have. Beste Balance. Trennt korrekt zwischen WCAG-Pflicht und Empfehlungen. Fix-Vorschläge am detailliertesten (z.B. vollständiger Focus-Trap mit useEffect).

4. Fix-Qualität (Stufe 0/1/2)
7b	14b	32b
Fix für V1 (alt-Text)	2	2	2
Fix für V4 (Kontrast)	1 (nur Farbe)	1	2 (CSS-Regel)
Fix für V5 (outline)	0 (teils falsch)	1	2 (CSS-Klasse)
Fix für V8 (Focus-Trap)	1	1	2 (useEffect)
Fix für V11 (DOM-Order)	—	—	2 (CSS order)
5. Laufzeit-Effizienz
Modell	Detect-Phase	LLM-Phase	Gesamt
7b	~74s	~53s	~133s
14b	~172s	~143s	~320s
32b	~356s	~344s	~700s
32b braucht ~5× länger als 7b. Für lokalen Einsatz relevant, aber noch im akzeptablen Rahmen.

6. Schlussfolgerungen für die BA
RQ1 (Kann ACE Barrieren automatisch erkennen?):
Ja — mit LLM-Detektor erkennt die Pipeline 9–12 von 12 Violations. Ohne Detektor nur 8/12. Der Detektor liefert echten Mehrwert bei semantischen Violations (V8, V11, V12).

RQ2 (Welches Modell ist am besten geeignet?):
32b > 14b > 7b in Recall und Fix-Qualität. 14b ist ein guter Kompromiss (Recall ~11/12, schneller als 32b). 7b ist nicht produktionstauglich (falsche Priorisierung, fehlender Recall).

Wichtiger Vorbehalt: Alle Runs haben das Token-Limit (3072) erreicht und wurden abgeschnitten. Die Ergebnisse unterschätzen die echte Qualität — besonders bei 14b. Mit numPredict: 6144 werden die nächsten Runs vollständigere Ausgaben liefern.