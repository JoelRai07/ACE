/** Unified Finding Schema (UFS) — zentrales Datenmodell der Pipeline. */

export type FindingSource = "axe" | "playwright" | "grep" | "llm";

export type Severity = "critical" | "serious" | "moderate" | "minor";

export type WcagLevel = "A" | "AA" | "AAA";

export type ViolationCategory = "syntaktisch" | "semantisch" | "layout";

export interface UnifiedFinding {
  id: string;
  source: FindingSource;
  ruleId: string;
  description: string;
  severity: Severity;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
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
  llm: UnifiedFinding[];
  collectedAt: string;
  targetUrl: string;
}

export interface PipelineMetrics {
  phaseTimings: {
    axeMs: number;
    playwrightMs: number;
    codeEnrichMs: number;
    codePatternMs: number;
    llmDetectMs: number;
    llmDetectChunks: number;
    promptBuildMs: number;
    llmMs: number;
    outputMs: number;
    totalMs: number;
  };
  tokens: {
    estimated: number;
    actualPrompt: number;
    actualOutput: number;
  };
  enrichment: {
    enrichedCount: number;
    totalEnrichable: number;
    quote: number; // 0–1
  };
  deduplication: {
    beforeDedup: number;
    afterDedup: number;
    removed: number;
  };
}

export interface AceCheckDefinition {
  ruleId: string;
  description: string;
  severity: Severity;
  wcagCriteria: string[];
  wcagLevel: WcagLevel;
  category: ViolationCategory;
}
