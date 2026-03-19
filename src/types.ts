/**
 * Unified Finding Schema (UFS) — zentrales Datenmodell der Pipeline.
 *
 * Alle Quellen (axe-core, Playwright, grep) werden vor dem Prompt-Building
 * in dieses Format überführt. Felder, die eine Quelle nicht liefern kann,
 * bleiben null und können später durch Code-Anreicherung ergänzt werden.
 */

export type FindingSource = "axe" | "playwright" | "grep";

export type Severity = "critical" | "serious" | "moderate" | "minor";

export type WcagLevel = "A" | "AA" | "AAA";

/** Taxonomie nach Fathallah et al. 2025 */
export type ViolationCategory = "syntaktisch" | "semantisch" | "layout";

export interface UnifiedFinding {
  id: string;
  source: FindingSource;
  ruleId: string;
  description: string;
  severity: Severity;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
  /** Verletzungskategorie: syntaktisch = fehlende/falsche Attribute, semantisch = falsche Bedeutung/Struktur, layout = visuell */
  category: ViolationCategory;
  selector: string | null;
  componentPath: string | null;
  codeSnippet: string | null;
  lineRange: [number, number] | null;
  rawData: Record<string, unknown>;
}

export interface PipelineFindings {
  axe: UnifiedFinding[];
  playwright: UnifiedFinding[];
  grep: UnifiedFinding[];
  collectedAt: string;
  targetUrl: string;
}

export interface AceCheckDefinition {
  ruleId: string;
  description: string;
  severity: Severity;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
  category: ViolationCategory;
}
