export interface TajweedIssue {
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion: string;
}

export interface TajweedResult {
  transcription?: string;
  score?: number;
  issues?: TajweedIssue[];
  similarity?: number | null;
  reference?: string | null;
  error?: string;
}
