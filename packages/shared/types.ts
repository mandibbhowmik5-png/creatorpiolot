/**
 * CreatorPilot - Shared TypeScript Types & API Schemas
 * 100% Free & Open Source Stack
 */

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export type PlatformTarget = 'tiktok' | 'reels' | 'shorts' | 'linkedin' | 'x';

export interface TensionBeat {
  id: string;
  timestampStart: number; // in seconds
  timestampEnd: number;
  tensionScore: number; // 0-100
  audioEnergyScore: number; // 0-100
  speechPaceWpm: number;
  sentimentShiftScore: number; // 0-100
  laughterOrPauseScore: number; // 0-100
  hookRating: number; // 0-100 (LLM hook strength)
  hookSummary: string;
  transcriptSnippet: string;
  isPeak: boolean;
  reelExportUrl?: string;
}

export interface VideoAnalysisResult {
  jobId: string;
  title: string;
  duration: number; // seconds
  sourceUrl: string;
  createdAt: string;
  beats: TensionBeat[];
  topBeats: TensionBeat[];
  averageTension: number;
  speechSummary: string;
}

export interface ThumbnailVariant {
  id: string;
  label: string;
  frameTimestamp: number;
  imageUrl: string;
  heatmapUrl: string;
  saliencyScore: number; // 0-100 (Spectral Residual attention)
  geminiVisionScore: number; // 0-100 (contrast, face prominence, hook legibility)
  compositeScore: number; // 0-100
  faceDetected: boolean;
  textHook: string;
  colorGrade: 'cyber_cyan' | 'electric_magenta' | 'cinema_contrast' | 'vibrant_warm' | 'raw';
  whyThisWins: string;
  abVotes: number;
  abImpressions: number;
  simulatedCtr: number; // e.g. 11.4%
}

export interface PersonaProfile {
  id: string;
  name: string;
  creatorHandle: string;
  niche: string;
  toneHumor: number; // 0-100
  toneEnthusiasm: number; // 0-100
  toneTechnicality: number; // 0-100
  toneEmpathy: number; // 0-100
  bannedWords: string[];
  signaturePhrases: string[];
  systemPrompt: string;
  sampleComments: { user: string; reply: string }[];
  autopilotEnabled: boolean;
}

export interface CommunityComment {
  id: string;
  videoId: string;
  videoTitle: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  publishedAt: string;
  sentiment: 'positive' | 'question' | 'critique' | 'neutral';
  suggestedReply: string;
  replyReasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'posted';
  editedReply?: string;
  confidenceScore: number; // 0-100
}

export interface CutdownExport {
  id: string;
  aspectRatio: AspectRatio;
  platform: PlatformTarget;
  title: string;
  durationSeconds: number;
  captionText: string;
  hashtags: string[];
  srtContent: string;
  previewUrl: string;
}

export interface SemanticItem {
  id: string;
  type: 'clip' | 'thumbnail' | 'comment' | 'insight';
  title: string;
  snippet: string;
  tags: string[];
  timestamp?: number;
  tensionScore?: number;
  similarityScore?: number;
}

export interface CalendarSlot {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  platform: PlatformTarget;
  recommendedTopic: string;
  projectedEngagement: 'Very High' | 'High' | 'Medium';
  format: AspectRatio;
  hookIdea: string;
}

export interface WeeklyStrategyReport {
  generatedAt: string;
  overview: string;
  topPerformingHooks: string[];
  retentionWins: string[];
  thumbnailTakeaways: string[];
  recommendedSchedule: CalendarSlot[];
  nextWeekActionPlan: string[];
}

export interface ExportPackage {
  jobId: string;
  clipTitle: string;
  cuts: CutdownExport[];
  thumbnails: ThumbnailVariant[];
  srtFile: string;
  captionPack: {
    tiktok: string;
    reels: string;
    shorts: string;
    linkedin: string;
    x: string;
  };
  generatedAt: string;
}

export interface AgentCardDetail {
  id: 'tension' | 'thumbnail' | 'persona';
  title: string;
  tagline: string;
  problemStatementDetail: string;
  seedPromptLines: string[];
  techStackChips: string[];
  metricHeadline: string;
}
