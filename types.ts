export enum AgeGroup {
  CHILD = 'Child (8-12)',
  TEEN = 'Teen (13-17)',
  ADULT = 'Adult (18+)'
}

export interface HistoricalFigure {
  id: string;
  name: string;
  shortName: string; // For bubbles
  gender: 'Male' | 'Female';
  description: string;
  avatarUrl: string;
  era: string;
  philosophy: string;
  quotes: string[];
}

export interface DialogueTurn {
  speakerId: string;
  text: string;
  mood: 'neutral' | 'passionate' | 'thoughtful' | 'angry' | 'amused';
  relevantQuote?: string;
}

export interface DebateSettings {
  topic: string;
  ageGroup: AgeGroup;
  participants: HistoricalFigure[];
  userGender: 'male' | 'female' | 'silent';
}

export interface ChatMessage extends DialogueTurn {
  id: string;
  timestamp: number;
  userReaction?: 'Agree' | 'Disagree' | 'Interesting';
}