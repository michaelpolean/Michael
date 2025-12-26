export interface TravelGuideRequest {
  urls: string[];
  additionalNotes?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Analyzing URLs
  SYNTHESIZING = 'SYNTHESIZING', // Generating Guide
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TravelGuideResponse {
  markdownContent: string;
  sources: GroundingSource[];
}

export type BudgetLevel = 'Economy' | 'Comfort' | 'Luxury' | '';
export type TravelSeason = 'Off-peak' | 'Shoulder' | 'Peak' | '';
export type CompanionType = 'Solo' | 'Couple' | 'Family' | 'Friends' | '';

export interface TravelPreferences {
  budget: BudgetLevel;
  season: TravelSeason;
  companion: CompanionType;
  additionalNotes: string;
}