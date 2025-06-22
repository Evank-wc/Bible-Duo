export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  name: string;
  chapters: Chapter[];
}

export interface Bible {
  translation: string;
  books: Book[];
}

export interface Passage {
  book: string;
  chapter: number;
  verses: string;
}

export interface DailyReading {
  day: number;
  date: string;
  passages: Passage[];
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  readings: DailyReading[];
}

export interface DailyPlans {
  plans: ReadingPlan[];
}

export interface UserProgress {
  planId: string;
  currentDay: number;
  streak: number;
  longestStreak?: number;
  lastReadDate: string;
  completedDays: string[];
  startDate?: string;
}

export interface AppSettings {
  translation: 'ESV' | 'CUVS';
  uiLanguage: 'en' | 'zh';
  fontSize: number;
  theme: 'light' | 'dark';
  selectedPlan?: string;
  currentDay?: number;
  completedDays?: Set<number>;
  completionDates?: Map<number, string>;
  notifications?: {
    enabled: boolean;
    time: string;
  };
} 