// ============================================================
// STAGEY MOBILE — CONSTANTS BARREL EXPORT
// Drop this file into: constants/index.ts
// ============================================================

export * from './colors';
export * from './typography';
export * from './spacing';

// App-wide constants
export const APP_NAME = 'Stagey';
export const APP_TAGLINE = 'Your Stage Awaits';
export const APP_WEBSITE = 'https://stagey-app.com';
export const API_BASE_URL = 'https://stage-ly-adam975.replit.app';
export const SUPPORT_EMAIL = 'info@backstage.stagey-app.com';
export const PRIVACY_URL = 'https://stage-ly-adam975.replit.app/privacy';
export const TERMS_URL = 'https://stage-ly-adam975.replit.app/terms';

// Async storage keys
export const STORAGE_KEYS = {
  SESSION: 'stagey_session',
  THEME: 'stagey_theme',
  DISMISSED_BANNERS: 'stagey_dismissed_banners',
  QUIZ_ANONYMOUS_COMPLETED: 'stagey_quiz_completed_',
  LOCAL_CALENDAR_EVENTS: 'stagey_calendar_events',
  CACHED_HOME_DATA: 'stagey_home_cache',
  CACHED_SHOWS: 'stagey_shows_cache',
  CACHED_SOCIETIES: 'stagey_societies_cache',
} as const;

// The 10 selectable roles on the platform
export const THEATRE_ROLES = [
  'Choreographer',
  'Director',
  'Lighting Engineer',
  'Musical Director',
  'Musician',
  'Performer',
  'Producer',
  'Set Designer',
  'Sound Engineer',
  'Stage Manager',
] as const;

// Profile type display labels
export const PROFILE_TYPE_LABELS: Record<string, string> = {
  performer: 'Performer',
  stage_crew: 'Stage Crew',
  parent: 'Parent',
  creative: 'Creative',
  theatre_fan: 'Theatre Fan',
  other: 'Other',
};

// Backstage Pass section labels (matches DB section field values)
export const GUIDE_SECTIONS = [
  { key: 'performers', label: 'For Performers', emoji: '🎭' },
  { key: 'young_performers', label: 'For Young Performers', emoji: '🌟' },
  { key: 'parents', label: 'For Parents', emoji: '👪' },
  { key: 'creative_teams', label: 'For Creative Teams', emoji: '🎬' },
  { key: 'tech_teams', label: 'For Tech Teams', emoji: '🔧' },
] as const;

// Marketplace category → DB type mapping
export const MARKETPLACE_CATEGORIES = [
  { label: 'All', types: null },
  { label: 'Costumes', types: ['costume', 'jewellery'] },
  { label: 'Props', types: ['props'] },
  { label: 'Sets', types: ['staging'] },
  { label: 'Tech', types: ['sound', 'lighting'] },
  { label: 'Other', types: ['other'] },
] as const;

// Sale type display labels
export const SALE_TYPE_LABELS: Record<string, string> = {
  buy: 'Buy',
  hire: 'Hire',
  free: 'Free',
};

// Show/Casting production type display labels
export const PRODUCTION_TYPE_LABELS: Record<string, string> = {
  amateur: 'Amateur',
  youth: 'Youth',
  professional: 'Professional',
  semi_professional: 'Semi-Professional',
};

// Expert service category display labels
export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  production_services: 'Production Services',
  venue_space: 'Venue & Space',
  training_education: 'Training & Education',
  business_services: 'Business Services',
};

// Budget calculator expense categories
export const BUDGET_EXPENSE_CATEGORIES = [
  { id: 'royalties', label: 'Royalties & Licences', emoji: '🎵' },
  { id: 'costumes', label: 'Costumes & Wardrobe', emoji: '👗' },
  { id: 'sets', label: 'Set & Staging', emoji: '🏛️' },
  { id: 'marketing', label: 'Marketing & Promotion', emoji: '📢' },
  { id: 'venue', label: 'Venue Hire', emoji: '🏢' },
  { id: 'cast_crew', label: 'Cast & Crew', emoji: '👥' },
  { id: 'ld_sd', label: 'Lighting & Sound', emoji: '💡' },
  { id: 'printing', label: 'Printing & Stationery', emoji: '🖨️' },
  { id: 'box_office', label: 'Tickets & Box Office', emoji: '🎟️' },
  { id: 'misc', label: 'Miscellaneous', emoji: '📋' },
] as const;

// Quiz difficulty colours
export const QUIZ_DIFFICULTY_COLORS = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
} as const;

// Character type display config
export const CHARACTER_TYPE_CONFIG = {
  lead: { label: 'Lead', color: '#EAB308' },
  supporting: { label: 'Supporting', color: '#3B82F6' },
  ensemble: { label: 'Ensemble', color: '#6B7280' },
  featured_ensemble: { label: 'Featured Ensemble', color: '#8B5CF6' },
} as const;

// History event type icons (use with lucide-react-native)
export const HISTORY_EVENT_ICONS: Record<string, string> = {
  premiere: 'Star',
  broadway_opening: 'Theater',
  west_end_opening: 'Theater',
  revival: 'Music',
  film_adaptation: 'Film',
  award: 'Award',
  closing: 'Calendar',
  record: 'Star',
  other: 'Calendar',
};

// Fun fact category colours (for Show Library)
export const FUN_FACT_CATEGORY_COLORS: Record<string, string> = {
  casting: '#3B82F6',
  production: '#8B5CF6',
  history: '#EAB308',
  trivia: '#22C55E',
  behind_the_scenes: '#EC4899',
  records: '#F97316',
};

// Competition entry status display
export const COMPETITION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Entered', color: '#F59E0B' },
  winner: { label: 'Winner! 🏆', color: '#22C55E' },
  not_selected: { label: 'Not Selected', color: '#6B7280' },
};

// Support chat quick prompts
export const SUPPORT_QUICK_PROMPTS = [
  'How do I join a society?',
  'How do I list on the marketplace?',
  'How does Backstage Pass work?',
  'How do I apply for a casting?',
  'How do I submit a show?',
  'How do I reset my password?',
] as const;

// Stage name quiz questions
// These are sent to the backend with the user's answers for AI processing
export const STAGE_NAME_QUESTIONS = [
  {
    id: 'show_type',
    question: 'Pick the type of show you were born to be in:',
    options: ['Classic Musical', 'Contemporary Drama', 'Shakespeare', 'Panto', 'Opera', 'Revue'],
  },
  {
    id: 'dream_role',
    question: 'Choose a role type you dream of playing:',
    options: ['The Lead', 'The Villain', 'The Comic Relief', 'The Love Interest', 'The Mentor', 'The Ensemble Star'],
  },
  {
    id: 'warmup',
    question: 'Your warm-up routine is:',
    options: ['Vocal scales for 30 mins', 'A quick hum and pray', 'Stretching in silence', 'Chatting to everyone', 'Method acting prep', 'Dancing it out'],
  },
  {
    id: 'opening_night',
    question: 'Opening night nerves — how do you handle them?',
    options: ['Channel them into energy', 'Find a quiet corner', 'Surround myself with cast', 'Ignore them completely', 'Deep breathing', 'Complete chaos'],
  },
  {
    id: 'inspiration',
    question: 'Your theatrical inspiration is:',
    options: ['Elaine Paige', 'Ian McKellen', 'Audrey Hepburn', 'Patti LuPone', 'Anthony Hopkins', 'Imelda Staunton'],
  },
] as const;
