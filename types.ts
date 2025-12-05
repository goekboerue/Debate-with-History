export enum AgeGroup {
  CHILD = 'Child (8-12)',
  TEEN = 'Teen (13-17)',
  ADULT = 'Adult (18+)'
}

export interface HistoricalFigure {
  id: string;
  name: string;
  shortName: string; // For bubbles
  description: string;
  avatarUrl: string;
  era: string;
  philosophy: string;
}

export interface DialogueTurn {
  speakerId: string;
  text: string;
  mood: 'neutral' | 'passionate' | 'thoughtful' | 'angry' | 'amused';
}

export interface DebateSettings {
  topic: string;
  ageGroup: AgeGroup;
  participants: HistoricalFigure[];
}

export interface ChatMessage extends DialogueTurn {
  id: string;
  timestamp: number;
}