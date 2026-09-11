export type AutonomyMode = 'Observe' | 'Recommend' | 'Autonomous';
export type IncidentStatus = 'Detected' | 'Investigating' | 'Correlating' | 'FixProposed' | 'AwaitingApproval' | 'Deploying' | 'Verifying' | 'Resolved' | 'Rejected';
export type ApiChangeStatus = 'Detected' | 'Analyzed' | 'FixProposed' | 'PendingApproval' | 'Approved' | 'Migrated';
export type RetrievalProvider = 'MossCloud' | 'LocalRetrievalFallback';

export interface EvidenceItem {
  id: string;
  investigationId: string;
  docId: string;
  title: string;
  type: string;
  service: string;
  snippet: string;
  relevanceScore: number;
  filePath: string;
  latencyMs: number;
  provider: RetrievalProvider;
  retrievedAt: string;
}

export interface TimelineEvent {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
  eventType: string;
  severity: string;
  timestamp: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  nodeType: string;
  subtitle: string;
  snippet: string;
  status: string;
}

export interface EvidenceEdge {
  sourceId: string;
  targetId: string;
  label: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export interface CorrelationResult {
  id: string;
  incidentId: string;
  correlatedApiChangeId?: string;
  correlatedDeploymentId?: string;
  confidence: string;
  score: number;
  summaryExplanation: string;
  correlationReasons: string[];
  evidenceDocIds: string[];
  correlatedAt: string;
}

export interface ProposedPatch {
  id: string;
  filePath: string;
  oldContent: string;
  newContent: string;
  unifiedDiff: string;
  explanation: string;
  risk: string;
  rollbackPlan: string;
  isApplied: boolean;
  generatedAt: string;
}

export interface ValidationReport {
  id: string;
  syntaxValid: boolean;
  totalTests: number;
  passedTests: number;
  secretsCheckPassed: boolean;
  regressionCheckPassed: boolean;
  riskAnalysisPassed: boolean;
  isSuccess: boolean;
  testNames: string[];
  outputSummary: string;
  validatedAt: string;
}

export interface ApprovalRecord {
  id: string;
  status: string;
  approver?: string;
  approvedAt?: string;
  decisionNotes?: string;
}

export interface GitHubPrRecord {
  id: string;
  branchName: string;
  commitSha: string;
  prNumber: number;
  prUrl: string;
  title: string;
  body: string;
  isDemoMode: boolean;
  createdAt: string;
}

export interface DeploymentVerification {
  id: string;
  stagingEnvironment: string;
  status: string;
  beforeErrorRate: number;
  afterErrorRate: number;
  beforeLatencyMs: number;
  afterLatencyMs: number;
  beforeActiveConnections: number;
  afterActiveConnections: number;
  completedAt: string;
}

export interface MemoryMatchResult {
  previousIncidentId: string;
  title: string;
  service: string;
  previousRootCause: string;
  previousFix: string;
  previousValidation: string;
  previousOutcome: string;
  relevanceReason: string;
  matchConfidence: number;
  resolvedAt: string;
  daysAgo: number;
}

export interface IncidentMemory {
  id: string;
  incidentId: string;
  title: string;
  service: string;
  incidentType: string;
  symptoms: string;
  rootCause: string;
  relatedApiChangeId?: string;
  affectedFiles: string;
  affectedServices: string;
  proposedFixSummary: string;
  validationResultSummary: string;
  riskLevel: string;
  approvalResult: string;
  gitHubPrReference?: string;
  deploymentResult: string;
  verificationResult: string;
  resolutionOutcome: string;
  resolvedAt: string;
  evidenceReferences: string;
  isBaseline: boolean;
}

export interface Investigation {
  id: string;
  incidentId: string;
  startedAt: string;
  completedAt?: string;
  classification: string;
  rootCause: string;
  confidenceScore: number;
  confidenceExplanation: string;
  evidenceItems: EvidenceItem[];
  timeline: TimelineEvent[];
  evidenceGraph: EvidenceGraph;
  similarMemoryMatch?: MemoryMatchResult;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: string;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  problemDescription: string;
  rootCause?: string;
  errorRateBefore: number;
  errorRateAfter?: number;
  activeConnections: number;
  maxConnections: number;
  latencyBeforeMs: number;
  latencyAfterMs?: number;
  investigation?: Investigation;
  correlation?: CorrelationResult;
  proposedPatch?: ProposedPatch;
  validationReport?: ValidationReport;
  approval?: ApprovalRecord;
  githubPr?: GitHubPrRecord;
  verification?: DeploymentVerification;
}

export interface ApiChange {
  id: string;
  provider: string;
  version: string;
  title: string;
  status: ApiChangeStatus;
  detectedAt: string;
  oldField: string;
  newField: string;
  endpoint: string;
  affectedReferencesCount: number;
  affectedServicesCount: number;
  affectedTestsCount: number;
  affectedServices: string[];
  affectedFiles: string[];
  risk: string;
  proposedPatch?: ProposedPatch;
  validationReport?: ValidationReport;
  approval?: ApprovalRecord;
  githubPr?: GitHubPrRecord;
}

export interface MossMetric {
  id: string;
  query: string;
  latencyMs: number;
  resultCount: number;
  provider: RetrievalProvider;
  timestamp: string;
}

export interface MossObservabilityStats {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  averageMs: number;
  lastQueryLatencyMs: number;
  totalQueries: number;
  currentProvider: RetrievalProvider;
  recentQueries: MossMetric[];
}

export interface MossBenchmarkResult {
  mossLatencyMs: number;
  syntheticRemoteBaselineMs: number;
  speedupFactor: number;
  note: string;
}

export interface ServiceHealth {
  name: string;
  status: string;
  errorRate: number;
  latencyMs: number;
  version: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  environment: string;
  apiKeyPrefix: string;
  repositoryUrl: string;
  defaultBranch: string;
  services: string[];
  createdAt: string;
  lastEventAt?: string;
  isActive: boolean;
}

export interface RescueEvent {
  eventId: string;
  schemaVersion: string;
  projectId: string;
  service: string;
  environment: string;
  eventType: string;
  severity: string;
  timestamp: string;
  data: Record<string, any>;
  correlation: Record<string, string>;
}
