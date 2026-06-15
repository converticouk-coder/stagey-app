// ============================================================
// STAGEY MOBILE — TYPESCRIPT TYPES
// Drop this file into: types/index.ts
// These exactly mirror the Stagey backend database schema.
// ============================================================

// ── Auth / User ──────────────────────────────────────────────

export type ProfileType =
  | 'performer'
  | 'stage_crew'
  | 'parent'
  | 'creative'
  | 'theatre_fan'
  | 'other';

export type UserRole =
  | 'standard_user'
  | 'organisation_admin'
  | 'society_pro'
  | 'business_account'
  | 'platform_admin';

export type GuardianConsentStatus =
  | 'not_required'
  | 'pending'
  | 'approved'
  | 'rejected';

export type ProfileVisibility = 'public' | 'hidden';

export type VocalRange =
  | 'Soprano'
  | 'Mezzo-Soprano'
  | 'Alto'
  | 'Countertenor'
  | 'Tenor'
  | 'Baritone'
  | 'Bass'
  | 'Other';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  bannerColor?: string | null;
  profileTypes: ProfileType[];
  profileVisibility: ProfileVisibility;
  headline?: string | null;
  vocalRange?: string | null;
  roles: string[];
  location?: string | null;
  bio?: string | null;
  spotlightPin?: string | null;
  skills: string[];
  dreamRoles: string[];
  favouriteShows: string[];
  pastShows: string[];
  bucketListShows: string[];
  favouritePartPlayed?: string | null;
  role: UserRole;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  dateOfBirth?: string | null;
  guardianEmail?: string | null;
  guardianConsentStatus: GuardianConsentStatus;
  isRestricted: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  castingNotifications: boolean;
  messageNotifications: boolean;
  societyNotifications: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  bannerColor?: string | null;
  profileTypes: ProfileType[];
  profileVisibility: ProfileVisibility;
  headline?: string | null;
  vocalRange?: string | null;
  roles: string[];
  location?: string | null;
  bio?: string | null;
  spotlightPin?: string | null;
  skills: string[];
  dreamRoles: string[];
  favouriteShows: string[];
  pastShows: string[];
  bucketListShows: string[];
  favouritePartPlayed?: string | null;
  profileType?: string | null;
  displayName?: string;
  createdAt: string;
}

// ── Profile detail (GET /api/profiles/:username) ──────────────

export interface ProfileExperience {
  id: number;
  userId: string;
  showTitle: string;
  role: string;
  roleType?: string | null;
  societyName?: string | null;
  societyId?: number | null;
  venue?: string | null;
  year?: number | null;
  month?: number | null;
  description?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProfileMedia {
  id: number;
  userId: string;
  mediaType: 'photo' | 'video' | string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  caption?: string | null;
  showTitle?: string | null;
  year?: number | null;
  sortOrder?: number | null;
  featured?: boolean | null;
  createdAt?: string | null;
}

export interface ProfileSociety {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  role: string;
}

export interface ProfileDetail extends PublicProfile {
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
  isTeenager?: boolean;
  experience?: ProfileExperience[];
  media?: ProfileMedia[];
  prompts?: any[];
  noticeboard?: any[];
  reviews?: any[];
  societies?: ProfileSociety[];
}

// A user row returned by followers/following lists.
export interface ProfileConnectionUser {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string;
  profileImageUrl?: string | null;
  profileType?: string | null;
  profileTypes?: ProfileType[];
  headline?: string | null;
  location?: string | null;
  followedAt?: string;
}

// A connection row returned by GET /api/connections.
export interface Connection {
  id: number;
  userId: string;
  connectedUserId: string;
  connectedAt: string;
  username: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
}

// ── Calendar ──────────────────────────────────────────────────

export interface CalendarEvent {
  id: number;
  userId: string;
  sourceType: string;
  sourceId: number;
  societyId?: number | null;
  showId?: number | null;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  visibility: string;
  status: string;
  metadata?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ── Shows ──────────────────────────────────────────────────────

export type ProductionType =
  | 'amateur'
  | 'youth'
  | 'professional'
  | 'semi_professional';

export type ShowGenre =
  | 'Musical'
  | 'Play'
  | 'Opera'
  | 'Operetta'
  | 'Pantomime'
  | 'Revue'
  | 'Ballet'
  | 'Jukebox Musical'
  | 'Other';

export interface Show {
  id: number;
  title: string;
  slug: string;
  societyId?: number | null;
  societyName?: string | null;
  societyLogoUrl?: string | null;
  societySlug?: string | null;
  venue?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  ticketUrl?: string | null;
  onSale?: boolean;
  ticketSalesStart?: string | null;
  ticketSalesEnd?: string | null;
  genre?: string | null;
  productionType?: ProductionType | null;
  featured?: boolean;
  createdById?: string | null;
  createdAt: string;
}

// ── Societies ──────────────────────────────────────────────────

export interface Society {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  heroImageUrl?: string | null;
  location?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  foundingYear?: number | null;
  memberCount?: number;
  isFoundingSociety?: boolean;
  featured?: boolean;
  videoUrl?: string | null;
  createdAt: string;
}

export type MembershipRole = 'admin' | 'member';
export type MembershipStatus = 'approved' | 'pending' | 'rejected';

export interface Membership {
  id: number;
  societyId: number;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  tierId?: number | null;
  createdAt: string;
}

export interface MembershipWithSociety extends Membership {
  society: Society;
}

export interface SocietyMember {
  id: number;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  user: PublicProfile;
  tier?: MembershipTier | null;
}

export interface MembershipTier {
  id: number;
  societyId: number;
  name: string;
  description?: string | null;
  color: string;
  canCreateShows: boolean;
  canManageMarketplace: boolean;
  canManageCastings: boolean;
  canPost: boolean;
  priority: number;
  isDefault: boolean;
}

export type NoticeColor =
  | 'yellow'
  | 'pink'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange';

export type NoticeType =
  | 'update'
  | 'announcement'
  | 'celebration'
  | 'reminder'
  | 'news';

export interface SocietyNotice {
  id: number;
  societyId: number;
  createdBy: string;
  title: string;
  content: string;
  color: NoticeColor;
  noticeType: NoticeType;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticePayload {
  title: string;
  content: string;
  color: NoticeColor;
  noticeType: NoticeType;
}

export interface Rehearsal {
  id: number;
  societyId: number;
  showId?: number | null;
  seriesId?: string | null;
  date: string;
  time: string;
  endTime?: string | null;
  location: string;
  scene?: string | null;
  callFor?: string[] | null;
  notes?: string | null;
  visibilityScope?: string;
  isFullCompany?: boolean | null;
  isCancelled?: boolean | null;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
  // Enriched (optional, when API joins show)
  showName?: string | null;
}

// ── Castings ──────────────────────────────────────────────────

export type PerformerType =
  | 'Vocalist'
  | 'Actor'
  | 'Dancer'
  | 'Musician'
  | 'Crew'
  | 'Other';

export type PositionCategory =
  | 'Performance'
  | 'Technical'
  | 'Creative'
  | 'Production'
  | 'Front of House';

export type CastingRoleType =
  | 'Lead'
  | 'Supporting'
  | 'Ensemble'
  | 'Featured Ensemble'
  | 'Crew'
  | 'Director'
  | 'Other';

export interface Casting {
  id: number;
  title: string;
  description?: string | null;
  societyId?: number | null;
  societyName?: string | null;
  showName?: string | null;
  company?: string | null;
  location?: string | null;
  deadline?: string | null;
  rolesAvailable?: string | null;
  roles?: string[];
  performerType?: string | null;
  productionType?: string | null;
  positionCategory?: string | null;
  roleType?: string | null;
  isOpen: boolean;
  imageUrl?: string | null;
  createdById: string;
  type?: string | null;
  createdAt: string;
}

export interface CastingApplication {
  id: number;
  castingId: number;
  userId: string;
  name?: string | null;
  experience?: string | null;
  availability?: string | null;
  notes?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// ── Marketplace ───────────────────────────────────────────────

export type MarketplaceItemType =
  | 'costume'
  | 'props'
  | 'staging'
  | 'sound'
  | 'lighting'
  | 'jewellery'
  | 'other';

export type SaleType = 'buy' | 'hire' | 'free';

export type ItemCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface MarketplaceItem {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  type: MarketplaceItemType;
  saleType: SaleType;
  price?: number | null;
  isFree: boolean;
  condition?: string | null;
  location?: string | null;
  imageUrls?: string[];
  sellerId: string;
  sellerName?: string | null;
  sellerImageUrl?: string | null;
  societyId?: number | null;
  societyName?: string | null;
  createdAt: string;
}

// ── News ──────────────────────────────────────────────────────

export type ArticleType =
  | 'news'
  | 'review'
  | 'tips'
  | 'interview'
  | 'opinion'
  | 'announcement'
  | 'feature'
  | 'guide';

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  authorId?: string | null;
  authorFirstName?: string | null;
  authorLastName?: string | null;
  authorUsername?: string | null;
  articleType: ArticleType;
  isSponsored: boolean;
  isFeatured: boolean;
  sponsorLabel?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  publishedAt?: string | null;
  status: string;
}

export interface CuratedRssArticle {
  id: number;
  title: string;
  link: string;
  feedName: string;
  feedUrl?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  curatedAt?: string | null;
  stageyTake?: string | null;
}

// ── Glossary ──────────────────────────────────────────────────

export interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  category?: string | null;
  relatedTerms?: string[] | null;
}

// ── Show Library ──────────────────────────────────────────────

export type LibraryShowType =
  | 'Musical'
  | 'Play'
  | 'Opera'
  | 'Operetta'
  | 'Pantomime'
  | 'Revue'
  | 'Ballet'
  | 'Jukebox Musical'
  | 'Other';

export interface ShowLibrary {
  id: number;
  slug: string;
  title: string;
  alternativeTitles?: string[];
  type: string;
  synopsis?: string | null;
  shortDescription?: string | null;
  composer?: string | null;
  lyricist?: string | null;
  bookWriter?: string | null;
  originalProductionYear?: number | null;
  originalProductionLocation?: string | null;
  basedOn?: string | null;
  setting?: string | null;
  timePeriod?: string | null;
  themes?: string[];
  genres?: string[];
  awards?: string[];
  imageUrl?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  runtime?: string | null;
  numberOfActs?: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount?: number;
  // List preview enrichment (from GET /api/library)
  previewType?: 'song' | 'fact' | 'character' | null;
  previewText?: string | null;
}

export interface ShowLibraryMusicalNumber {
  id: number;
  showId: number;
  orderIndex: number;
  title: string;
  act?: number | null;
  description?: string | null;
  sungBy?: string[];
  repriseOf?: string | null;
  isFamous: boolean;
}

export interface ShowLibraryCharacter {
  id: number;
  showId: number;
  name: string;
  description?: string | null;
  voiceType?: string | null;
  characterType?: 'lead' | 'supporting' | 'ensemble' | 'featured_ensemble' | null;
  gender?: string | null;
  ageRange?: string | null;
  notableSongs?: string[];
  orderIndex?: number;
}

export interface ShowLibraryScene {
  id: number;
  showId: number;
  act: number;
  sceneNumber?: number | null;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  characters?: string[];
  orderIndex: number;
}

export interface ShowLibraryHistory {
  id: number;
  showId: number;
  date: string;
  eventType: string;
  title: string;
  description?: string | null;
  location?: string | null;
  orderIndex?: number;
}

export interface ShowLibraryFunFact {
  id: number;
  showId: number;
  fact: string;
  category?: string | null;
  source?: string | null;
  orderIndex?: number;
}

export interface ShowLibraryFull extends ShowLibrary {
  musicalNumbers: ShowLibraryMusicalNumber[];
  characters: ShowLibraryCharacter[];
  scenes: ShowLibraryScene[];
  history: ShowLibraryHistory[];
  funFacts: ShowLibraryFunFact[];
}

// ── Masterclasses ─────────────────────────────────────────────

export type MasterclassLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Masterclass {
  id: number;
  title: string;
  instructor: string;
  instructorRole?: string | null;
  price: string; // decimal string in pounds, e.g. "29.99"
  isPaid?: boolean | null;
  duration: string;
  level: string;
  imageUrl?: string | null;
  description?: string | null;
  modules?: string[] | null;
  videoUrl?: string | null;
  additionalVideos?: string[] | null;
  downloadableAssets?: string[] | null;
  rating?: string | null;
  reviewCount?: number | null;
  featured?: boolean | null;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface MasterclassDetail extends Masterclass {
  canAccess: boolean;
  isPurchased: boolean;
  isEnrolled: boolean;
}

export interface MasterclassCheckoutResult {
  free?: boolean;
  url?: string;
  message?: string;
}

// ── Expert Services ───────────────────────────────────────────

export type ServiceCategory =
  | 'production_services'
  | 'venue_space'
  | 'training_education'
  | 'business_services';

export interface TheatreService {
  id: number;
  businessName: string;
  description?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[] | null;
  category: ServiceCategory;
  subcategory?: string | null;
  location?: string | null;
  coverageArea?: string | null;
  isOnline?: boolean | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  videoUrl?: string | null;
  specialOffer?: string | null;
  featured?: boolean | null;
  status: string;
  createdAt: string;
}

// ── Partner Offers ────────────────────────────────────────────

export interface PartnerOffer {
  id: number;
  title: string;
  description: string;
  partnerName: string;
  partnerLogoUrl?: string | null;
  imageUrl?: string | null;
  promoCode?: string | null;
  discountAmount: string;
  offerType: string;
  category?: string | null;
  location?: string | null;
  redirectUrl: string;
  expiryDate?: string | null;
  termsAndConditions?: string | null;
  featured: boolean;
}

// ── Competitions ──────────────────────────────────────────────

export interface CompetitionPrize {
  position?: number;
  title?: string;
  description?: string;
  value?: string;
}

export interface Competition {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  type: string;
  entryMethod: string; // 'simple' | 'question' | 'multiple_choice' | 'image_upload' | 'social_link'
  winnerSelection?: string;
  maxWinners?: number;
  maxEntriesPerUser?: number;
  entryConfiguration?: Record<string, unknown> | null;
  requiresLogin: boolean;
  minQuizScore?: number | null;
  prizes: CompetitionPrize[];
  termsAndConditions?: string | null;
  startsAt: string;
  endsAt: string;
  winnersAnnouncedAt?: string | null;
  status: string; // 'draft' | 'active' | 'ended' | 'cancelled'
  isFeatured?: boolean | null;
  totalEntries?: number;
  createdAt: string;
}

export interface CompetitionEntry {
  id: number;
  competitionId: number;
  userId?: string | null;
  entrantName?: string;
  entrantEmail?: string;
  status: string;
  entryData?: Record<string, unknown>;
  score?: number | null;
  createdAt: string;
}

export interface CompetitionWinner {
  id: number;
  competitionId: number;
  entrantName?: string;
  position?: number;
}

export interface CompetitionDetailResponse {
  competition: Competition;
  winners: CompetitionWinner[];
}

// ── Community ─────────────────────────────────────────────────

export interface CommunityCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  memberCount?: number;
  messageCount?: number;
}

export type CommunityChatMode = 'standard' | 'qa' | 'spotlight' | 'daily' | string;

export interface CommunityChat {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  description?: string | null;
  createdById?: string;
  createdByUsername?: string | null;
  createdByProfileImageUrl?: string | null;
  mode?: CommunityChatMode;
  isLocked: boolean;
  isPinned: boolean;
  viewCount?: number;
  messageCount?: number;
  replyCount?: number;
  lastActivityAt?: string | null;
  createdAt: string;
}

export type CommunityReactionType = 'like' | 'applaud' | 'spotlight';

export interface CommunityMessage {
  id: number;
  chatId: number;
  parentId?: number | null;
  parentMessageId?: number | null;
  authorId: string;
  authorUsername?: string | null;
  authorProfileImageUrl?: string | null;
  content: string;
  imageUrls?: string[] | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  mentionedUserIds?: string[] | null;
  isEdited?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  likeCount?: number;
  applaudCount?: number;
  spotlightCount?: number;
  replyCount?: number;
  reactionCounts?: { like: number; applaud: number; spotlight: number };
  createdAt: string;
  updatedAt?: string | null;
}

// ── Messaging (Marketplace / Direct Messages) ─────────────────

export interface ConversationParticipant {
  id: number;
  userId: string;
  username: string | null;
  profileImageUrl?: string | null;
  isAdmin?: boolean | null;
}

export interface DirectMessage {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  attachmentUrls?: string[] | null;
  replyToId?: number | null;
  type?: string;
  createdAt: string;
  updatedAt?: string | null;
  isEdited?: boolean | null;
  senderUsername?: string | null;
  senderProfileImageUrl?: string | null;
}

export interface Conversation {
  id: number;
  type: string;
  title?: string | null;
  marketplaceItemId?: number | null;
  participants: ConversationParticipant[];
  lastMessage?: DirectMessage | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

// ── Notifications ─────────────────────────────────────────────

export interface AppNotification {
  id: number;
  userId: string;
  type: string;
  relatedId: number;
  relatedType: string;
  actorId: string;
  actorName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Daily Quiz ────────────────────────────────────────────────

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  index: number;
  question: string;
  options: string[];
  difficulty: QuizDifficulty;
  correctIndex?: number;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: number[];
}

export interface QuizData {
  id: number;
  title: string;
  quizDate: string;
  questions: QuizQuestion[];
  questionsWithAnswers?: QuizQuestion[];
  completed: boolean;
  result: QuizResult | null;
  streak: number;
  isAnonymous?: boolean;
}

export interface QuestionResult {
  index: number;
  question: string;
  options: string[];
  userAnswer: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  difficulty: QuizDifficulty;
}

export interface ScoreMessage {
  title: string;
  message: string;
  emoji: string;
}

export interface QuizSubmitResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  questionResults: QuestionResult[];
  scoreMessage: ScoreMessage;
  streak: number;
  streakMessage: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  profileImageUrl?: string | null;
  score: number;
  rank: number;
}

// ── Mood Board ────────────────────────────────────────────────

export interface MoodBoard {
  id: number;
  userId: string;
  name: string;
  shareToken?: string | null;
  items: MoodBoardItem[];
  createdAt: string;
}

export interface MoodBoardItem {
  id: number;
  boardId: number;
  imageUrl: string;
  order: number;
  createdAt: string;
}

// ── Show Budget ───────────────────────────────────────────────

export interface ShowBudget {
  id: number;
  userId: string;
  name: string;
  data: ShowBudgetData;
  createdAt: string;
  updatedAt: string;
}

export interface ShowBudgetData {
  showName: string;
  numberOfPerformances: number;
  venueCapacity: number;
  incomeItems: BudgetLineItem[];
  expenseCategories: BudgetExpenseCategory[];
}

export interface BudgetLineItem {
  id: string;
  label: string;
  amount: number;
  isAutoCalculated?: boolean;
  autoConfig?: Record<string, number>;
}

export interface BudgetExpenseCategory {
  id: string;
  label: string;
  emoji: string;
  items: BudgetLineItem[];
}

// ── Backstage Pass (Parent Resources / Guides) ────────────────

export type GuideSection =
  | 'performers'
  | 'young_performers'
  | 'parents'
  | 'creative_teams'
  | 'tech_teams';

export interface ParentResource {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  section: string;
  category: string;
  iconType: string;
  content: string;
  isPrintable: boolean;
  /**
   * Optional path to a bespoke interactive web version of this guide
   * (e.g. "/guides/first-rehearsal"). When set, the mobile app should
   * show an "Open the interactive version" CTA that opens
   * `${WEB_BASE_URL}${interactiveUrl}` in expo-web-browser.
   * Null / missing means there is no interactive version — render text only.
   */
  interactiveUrl: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

// ── Achievements ──────────────────────────────────────────────

export interface AchievementBadge {
  id: number;
  badgeKey: string;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  xpValue?: number;
  category: string;
  rarity: string;
  isActive?: boolean | null;
}

export interface UserAchievement {
  id: number;
  userId: string;
  badgeId: number;
  badge?: AchievementBadge;
  earnedAt: string;
  isDisplayed?: boolean | null;
}

// ── Announcement Banner ───────────────────────────────────────

export type BannerType = 'info' | 'warning' | 'success' | 'announcement' | 'error';

export interface AnnouncementBanner {
  id: number;
  title: string;
  body?: string | null;
  type: BannerType;
  ctaText?: string | null;
  ctaUrl?: string | null;
  active: boolean;
  createdAt: string;
}

// ── Support Chat ──────────────────────────────────────────────

export interface SupportMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Navigation Types (React Navigation) ──────────────────────

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  GuardianPending: undefined;
  Article: { slug: string };
  ShowDetail: { slug: string };
  SocietyProfile: { slug: string };
  CastingDetail: { id: number };
  MarketplaceItem: { slug: string };
  LibraryShow: { slug: string };
  UserProfile: { username: string };
  CompetitionDetail: { slug: string };
  Conversation: { conversationId: number };
  CommunityChat: { categorySlug: string; chatSlug: string };
  MoodBoardDetail: { boardId: number };
  MoodBoardShared: { shareToken: string };
  GuideDetail: { slug: string };
  MasterclassDetail: { id: number };
};

export type TabParamList = {
  Home: undefined;
  Market: undefined;
  Create: undefined;
  Societies: undefined;
  Shows: undefined;
};

export type DiscoverStackParamList = {
  DiscoverHub: undefined;
  Shows: undefined;
  ShowDetail: { slug: string };
  Castings: undefined;
  Library: undefined;
  LibraryShow: { slug: string };
  Glossary: undefined;
  News: undefined;
  Article: { slug: string };
  NewsFeed: undefined;
  Masterclasses: undefined;
  MasterclassDetail: { id: number };
  ExpertServices: undefined;
  PartnerOffers: undefined;
  Competitions: undefined;
  CompetitionDetail: { slug: string };
  DailyQuiz: undefined;
  BudgetCalculator: undefined;
};

export type CommunityStackParamList = {
  CommunityHub: undefined;
  SocietiesBrowse: undefined;
  SocietyProfile: { slug: string };
  CommunityCategories: undefined;
  CommunityChatThread: { categorySlug: string; chatSlug: string };
  Messages: undefined;
  Conversation: { conversationId: number };
  ProfileSearch: undefined;
  UserProfile: { username: string };
};

export type MeStackParamList = {
  OwnProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  ChangePassword: undefined;
  SavedItems: undefined;
  MyListings: undefined;
  MyBudgets: undefined;
  MyMoodBoards: undefined;
  MoodBoardDetail: { boardId: number };
  BackstagePass: undefined;
  GuideDetail: { slug: string };
  RehearsalPal: undefined;
  Support: undefined;
};
