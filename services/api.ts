// ============================================================
// STAGEY MOBILE — API SERVICE LAYER
// Drop this file into: services/api.ts
//
// Every API call the mobile app makes goes through this file.
// Endpoints exactly match the Stagey backend (routes.ts).
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User, PublicProfile, Show, Society, Membership, MembershipWithSociety,
  SocietyMember, SocietyNotice, Rehearsal, Casting, CastingApplication,
  MarketplaceItem, NewsArticle, CuratedRssArticle, GlossaryTerm,
  ShowLibrary, ShowLibraryFull, Masterclass, MasterclassDetail,
  MasterclassCheckoutResult, TheatreService, PartnerOffer,
  Competition, CompetitionEntry, CompetitionDetailResponse,
  CommunityCategory, CommunityChat,
  CommunityMessage, CommunityReactionType, Conversation, DirectMessage,
  AppNotification, ProfileDetail, ProfileConnectionUser, Connection,
  CalendarEvent,
  QuizData, QuizSubmitResult, LeaderboardEntry, MoodBoard, ShowBudget,
  ParentResource, AchievementBadge, UserAchievement, AnnouncementBanner,
  SupportMessage,
} from '../types';

// ── Base Configuration ────────────────────────────────────────

export const API_BASE_URL = 'https://stage-ly-adam975.replit.app';

// Session token key in AsyncStorage
const SESSION_KEY = 'stagey_session';

// ── Request Helpers ───────────────────────────────────────────

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function getSessionToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

async function saveSessionToken(token: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, token);
}

async function clearSessionToken(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;
  const url = buildUrl(path, params);
  const sessionToken = await getSessionToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (sessionToken) {
    requestHeaders['Cookie'] = `connect.sid=${sessionToken}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    credentials: 'include',
  });

  // Capture and persist Set-Cookie header (session management)
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/connect\.sid=([^;]+)/);
    if (match) {
      await saveSessionToken(match[1]);
    }
  }

  if (!response.ok) {
    let errorMessage = `API error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {}
    const error = new Error(errorMessage) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return request<T>(path, { method: 'GET', params });
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// ── Auth API ──────────────────────────────────────────────────

export const AuthAPI = {
  getUser: (): Promise<User | null> =>
    get<User>('/api/auth/user').catch((e) => {
      if (e.status === 401) return null;
      throw e;
    }),

  // NOTE: endpoint paths and response shapes below are corrected to match the
  // live backend (server/routes.ts). The backend serves auth under /api/auth/*
  // and wraps the user in { user, adultTransition }. The original foundation
  // pointed at /api/login etc. which hit the SPA fallback (200 HTML) and never
  // actually authenticated. See AUTH-NOTES.md for the full finding.
  login: async (email: string, password: string): Promise<User> => {
    const res = await post<{ user: User; adultTransition?: unknown }>(
      '/api/auth/login',
      { email, password },
    );
    return res.user;
  },

  register: async (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    profileTypes?: string[];
    dateOfBirth?: string;
    guardianEmail?: string;
  }): Promise<User> => {
    const res = await post<{ user: User }>('/api/auth/signup', data);
    return res.user;
  },

  logout: async (): Promise<void> => {
    await post<void>('/api/auth/logout');
    await clearSessionToken();
  },

  forgotPassword: (email: string): Promise<void> =>
    post<void>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string): Promise<void> =>
    post<void>('/api/auth/reset-password', { token, password }),

  updateProfile: (id: string, data: Partial<User>): Promise<User> =>
    patch<User>(`/api/users/${id}`, data),

  updatePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    put<void>('/api/user/password', { currentPassword, newPassword }),

  updateNotificationPreferences: (prefs: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    castingNotifications?: boolean;
    messageNotifications?: boolean;
    societyNotifications?: boolean;
  }): Promise<void> => put<void>('/api/user/notification-preferences', prefs),

  updatePrivacySettings: (settings: {
    profileVisibility?: 'public' | 'hidden';
  }): Promise<void> => put<void>('/api/privacy-settings', settings),

  deleteAccount: (): Promise<void> => del<void>('/api/users/me'),

  registerPushToken: (token: string): Promise<void> =>
    post<void>('/api/user/push-token', { token }),

  removePushToken: (): Promise<void> => del<void>('/api/user/push-token'),
};

// ── Shows API ─────────────────────────────────────────────────

export const ShowsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    genre?: string;
    location?: string;
    productionType?: string;
    startDate?: string;
    endDate?: string;
    onSale?: boolean;
    featured?: boolean;
  }): Promise<{ shows: Show[]; total: number }> =>
    get('/api/shows', params as any),

  getBySlug: (slug: string): Promise<Show> =>
    get(`/api/shows/${slug}`),

  create: (data: Partial<Show>): Promise<Show> =>
    post<Show>('/api/shows', data),

  delete: (slug: string): Promise<void> =>
    del<void>(`/api/shows/${slug}`),
};

// ── Societies API ─────────────────────────────────────────────

export const SocietiesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    featured?: boolean;
  }): Promise<{ societies: Society[]; total: number }> =>
    get('/api/societies', params as any),

  getBySlug: (slug: string): Promise<Society> =>
    get(`/api/societies/${slug}`),

  getMembers: (slug: string): Promise<SocietyMember[]> =>
    get(`/api/societies/${slug}/members`),

  getNotices: (slug: string): Promise<SocietyNotice[]> =>
    get(`/api/societies/${slug}/notices`),

  createNotice: (slug: string, payload: { title: string; content: string; color: string; noticeType: string }): Promise<SocietyNotice> =>
    post(`/api/societies/${slug}/notices`, payload),

  togglePinNotice: (slug: string, noticeId: number, isPinned: boolean): Promise<SocietyNotice> =>
    put(`/api/societies/${slug}/notices/${noticeId}`, { isPinned: !isPinned }),

  deleteNotice: (slug: string, noticeId: number): Promise<void> =>
    del(`/api/societies/${slug}/notices/${noticeId}`),

  getRehearsals: (slug: string): Promise<Rehearsal[]> =>
    get(`/api/societies/${slug}/rehearsals`),

  getChatMessages: (slug: string): Promise<CommunityMessage[]> =>
    get(`/api/societies/${slug}/chat/messages`),

  sendChatMessage: (slug: string, content: string): Promise<CommunityMessage> =>
    post(`/api/societies/${slug}/chat/messages`, { content }),

  apply: (slug: string, message?: string): Promise<void> =>
    post(`/api/societies/${slug}/apply`, { message }),

  follow: (slug: string): Promise<void> =>
    post(`/api/societies/${slug}/follow`),

  unfollow: (slug: string): Promise<void> =>
    del(`/api/societies/${slug}/follow`),

  getUserMemberships: (): Promise<MembershipWithSociety[]> =>
    get('/api/user/memberships'),

  create: (data: Partial<Society>): Promise<Society> =>
    post('/api/societies', data),

  createRehearsal: (slug: string, data: Partial<Rehearsal>): Promise<Rehearsal> =>
    post(`/api/societies/${slug}/rehearsals`, data),

  bulkCancelRehearsals: (slug: string, ids: number[]): Promise<void> =>
    post(`/api/societies/${slug}/rehearsals/bulk-cancel`, { ids }),

  bulkRescheduleRehearsals: (slug: string, ids: number[], offsetDays: number): Promise<void> =>
    post(`/api/societies/${slug}/rehearsals/bulk-reschedule`, { ids, offsetDays }),
};

// ── Castings API ──────────────────────────────────────────────

export const CastingsAPI = {
  getAll: (params?: {
    performerType?: string;
    location?: string;
    productionType?: string;
    positionCategory?: string;
    roleType?: string;
  }): Promise<Casting[]> => get('/api/castings', params as any),

  getById: (id: number): Promise<Casting> =>
    get(`/api/castings/${id}`),

  create: (data: Partial<Casting>): Promise<Casting> =>
    post<Casting>('/api/castings', data),

  delete: (id: number): Promise<void> =>
    del<void>(`/api/castings/${id}`),

  submitApplication: (data: {
    castingId: number;
    name?: string;
    experience?: string;
    availability?: string;
    notes?: string;
  }): Promise<CastingApplication> => post('/api/applications', data),

  withdrawApplication: (id: number): Promise<void> =>
    del(`/api/applications/${id}`),
};

// ── Marketplace API ───────────────────────────────────────────

export const MarketplaceAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    saleType?: string;
    maxPrice?: number;
    isFree?: boolean;
    q?: string;
  }): Promise<MarketplaceItem[]> => get('/api/marketplace', params as any),

  getBySlug: (slug: string): Promise<MarketplaceItem> =>
    get(`/api/marketplace/${slug}`),

  create: (data: Partial<MarketplaceItem>): Promise<MarketplaceItem> =>
    post<MarketplaceItem>('/api/marketplace', data),

  update: (slug: string, data: Partial<MarketplaceItem>): Promise<MarketplaceItem> =>
    put<MarketplaceItem>(`/api/marketplace/${slug}`, data),

  delete: (slug: string): Promise<void> =>
    del<void>(`/api/marketplace/${slug}`),

  isSaved: (id: number): Promise<{ saved: boolean }> =>
    get(`/api/marketplace/${id}/saved`),

  save: (id: number): Promise<void> =>
    post(`/api/marketplace/${id}/save`),

  unsave: (id: number): Promise<void> =>
    del(`/api/marketplace/${id}/save`),

  getSaved: (): Promise<MarketplaceItem[]> =>
    get('/api/marketplace/saved'),
};

// ── News API ──────────────────────────────────────────────────

export const NewsAPI = {
  getAll: (): Promise<NewsArticle[]> =>
    get('/api/news'),

  getBySlug: (slug: string): Promise<NewsArticle> =>
    get(`/api/news/${slug}`),

  getCurated: (limit = 50): Promise<CuratedRssArticle[]> =>
    get('/api/rss-articles/curated', { limit }),
};

// ── Glossary API ──────────────────────────────────────────────

export const GlossaryAPI = {
  getAll: (): Promise<GlossaryTerm[]> =>
    get('/api/glossary'),
};

// ── Show Library API ──────────────────────────────────────────

export const LibraryAPI = {
  getAll: (): Promise<ShowLibrary[]> =>
    get('/api/library'),

  getBySlug: (slug: string): Promise<ShowLibraryFull> =>
    get(`/api/library/${slug}`),
};

// ── Masterclasses API ─────────────────────────────────────────

export const MasterclassesAPI = {
  getAll: (featured?: boolean): Promise<Masterclass[]> =>
    get('/api/masterclasses', featured !== undefined ? { featured } : undefined),

  getById: (id: number): Promise<MasterclassDetail> =>
    get(`/api/masterclasses/${id}`),

  getPurchased: (): Promise<Masterclass[]> =>
    get('/api/masterclasses/purchased'),

  // Returns { free: true } for free masterclasses (auto-enrolled) or
  // { url } pointing at a Stripe Checkout session to open in-app browser.
  checkout: (id: number): Promise<MasterclassCheckoutResult> =>
    post(`/api/masterclasses/${id}/checkout`),
};

// ── Expert Services API ───────────────────────────────────────

export const ServicesAPI = {
  getAll: (params?: {
    category?: string;
    isOnline?: boolean;
    q?: string;
  }): Promise<TheatreService[]> => get('/api/theatre-services', params as any),

  apply: (data: {
    businessName: string;
    category: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
  }): Promise<void> => post('/api/theatre-service-applications', data),
};

// ── Partner Offers API ────────────────────────────────────────

export const OffersAPI = {
  getAll: (): Promise<PartnerOffer[]> =>
    get('/api/partner-offers'),
};

// ── Competitions API ──────────────────────────────────────────

export const CompetitionsAPI = {
  getAll: (): Promise<Competition[]> =>
    get('/api/competitions'),

  getBySlug: (slug: string): Promise<CompetitionDetailResponse> =>
    get(`/api/competitions/${slug}`),

  getEntry: (id: number): Promise<{ entered: boolean; entry?: CompetitionEntry }> =>
    get(`/api/competitions/${id}/entry`),

  getMyEntries: (): Promise<CompetitionEntry[]> =>
    get('/api/competitions/user/entries'),

  // Entry is keyed by competition ID (not slug). Open to guests + logged-in users.
  enter: (
    id: number,
    data: {
      entrantName: string;
      entrantEmail: string;
      entryData?: Record<string, unknown>;
      score?: number;
      referralCode?: string;
    },
  ): Promise<{ message: string; entry: CompetitionEntry }> =>
    post(`/api/competitions/${id}/enter`, data),
};

// ── Community API ─────────────────────────────────────────────

export const CommunityAPI = {
  getCategories: (): Promise<CommunityCategory[]> =>
    get('/api/community/categories'),

  getCategory: (slug: string): Promise<CommunityCategory> =>
    get(`/api/community/categories/${slug}`),

  getChats: (categorySlug: string): Promise<CommunityChat[]> =>
    get(`/api/community/categories/${categorySlug}/chats`),

  getChat: (chatSlug: string): Promise<CommunityChat> =>
    get(`/api/community/chats/${chatSlug}`),

  getMessages: (chatSlug: string): Promise<CommunityMessage[]> =>
    get(`/api/community/chats/${chatSlug}/messages`),

  sendMessage: (
    chatSlug: string,
    body: { content: string; imageUrls?: string[]; parentMessageId?: number | null; mentionedUserIds?: string[] },
  ): Promise<CommunityMessage> =>
    post(`/api/community/chats/${chatSlug}/messages`, {
      content: body.content,
      imageUrls: body.imageUrls ?? [],
      parentMessageId: body.parentMessageId ?? null,
      mentionedUserIds: body.mentionedUserIds ?? [],
    }),

  addReaction: (messageId: number, type: CommunityReactionType): Promise<{ success: boolean }> =>
    post(`/api/community/messages/${messageId}/reactions`, { type }),

  removeReaction: (messageId: number, type: CommunityReactionType): Promise<{ success: boolean }> =>
    del(`/api/community/messages/${messageId}/reactions/${type}`),

  reportMessage: (messageId: number, reason: string): Promise<void> =>
    post(`/api/community/messages/${messageId}/report`, { reason }),
};

// ── Profiles API ──────────────────────────────────────────────

export const ProfilesAPI = {
  search: (params?: {
    q?: string;
    profileType?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PublicProfile[]> => get('/api/profiles', params as any),

  getByUsername: (username: string): Promise<ProfileDetail> =>
    get(`/api/profiles/${username}`),

  getFollowers: (username: string, limit?: number): Promise<ProfileConnectionUser[]> =>
    get(`/api/profiles/${username}/followers`, limit ? { limit } : undefined),

  getFollowing: (username: string, limit?: number): Promise<ProfileConnectionUser[]> =>
    get(`/api/profiles/${username}/following`, limit ? { limit } : undefined),

  follow: (username: string): Promise<{ success: boolean; followers: number; following: number }> =>
    post(`/api/profiles/${username}/follow`),

  unfollow: (username: string): Promise<{ success: boolean; followers: number; following: number }> =>
    del(`/api/profiles/${username}/follow`),

  report: (username: string, reason: string): Promise<void> =>
    post(`/api/profiles/${username}/report`, { reason }),
};

// ── Conversations API ─────────────────────────────────────────

export const ConversationsAPI = {
  getAll: (): Promise<Conversation[]> =>
    get('/api/conversations'),

  getById: (id: number): Promise<Conversation> =>
    get(`/api/conversations/${id}`),

  getUnreadCount: (): Promise<{ count: number }> =>
    get('/api/conversations/unread/count'),

  getMessages: (id: number): Promise<DirectMessage[]> =>
    get(`/api/conversations/${id}/messages`),

  create: (recipientId: string, message: string, marketplaceItemId?: number): Promise<Conversation> =>
    post('/api/conversations', { recipientId, message, marketplaceItemId }),

  start: (username: string, marketplaceItemId?: number): Promise<Conversation> =>
    post(`/api/conversations/start/${username}`, marketplaceItemId ? { marketplaceItemId } : {}),

  markRead: (id: number): Promise<void> =>
    put(`/api/conversations/${id}/read`),

  delete: (id: number): Promise<void> =>
    del(`/api/conversations/${id}`),

  sendMessage: (id: number, content: string): Promise<DirectMessage> =>
    post(`/api/conversations/${id}/messages`, { content }),
};

// ── Calendar API ──────────────────────────────────────────────

export const CalendarAPI = {
  getEvents: (from?: string, to?: string): Promise<CalendarEvent[]> =>
    get('/api/calendar/events', { from, to }),

  getUpcoming: (limit?: number): Promise<CalendarEvent[]> =>
    get('/api/calendar/upcoming', limit ? { limit } : undefined),
};

// ── Connections API ───────────────────────────────────────────

export const ConnectionsAPI = {
  getAll: (): Promise<Connection[]> =>
    get('/api/connections'),

  remove: (userId: string): Promise<void> =>
    del(`/api/connections/${userId}`),
};

// ── Notifications API ─────────────────────────────────────────

export const NotificationsAPI = {
  getAll: (): Promise<AppNotification[]> =>
    get('/api/notifications'),

  markRead: (id: number): Promise<void> =>
    post(`/api/notifications/${id}/read`),

  markAllRead: (): Promise<void> =>
    post('/api/notifications/read-all'),

  delete: (id: number): Promise<void> =>
    del(`/api/notifications/${id}`),

  deleteAll: (): Promise<void> =>
    del('/api/notifications/delete-all'),
};

// ── Daily Quiz API ────────────────────────────────────────────

export const QuizAPI = {
  getToday: (): Promise<QuizData> =>
    get('/api/daily-quiz'),

  getPreview: (): Promise<QuizData> =>
    get('/api/daily-quiz/preview'),

  submit: (quizId: number, answers: number[]): Promise<QuizSubmitResult> =>
    post('/api/quiz/daily/submit', { quizId, answers }),

  getHistory: (): Promise<QuizData[]> =>
    get('/api/daily-quiz/history'),

  getLeaderboard: (quizId: number): Promise<LeaderboardEntry[]> =>
    get(`/api/daily-quiz/${quizId}/leaderboard`),

  generateStageName: (answers: Record<string, string>): Promise<{
    stageName: string;
    explanation: string;
  }> => post('/api/quiz/stage-name', { answers }),
};

// ── Mood Boards API ───────────────────────────────────────────

export const MoodBoardsAPI = {
  getAll: (): Promise<MoodBoard[]> =>
    get('/api/mood-boards'),

  create: (name: string): Promise<MoodBoard> =>
    post('/api/mood-boards', { name }),

  delete: (id: number): Promise<void> =>
    del(`/api/mood-boards/${id}`),

  addItem: (boardId: number, imageUrl: string): Promise<void> =>
    post(`/api/mood-boards/${boardId}/items`, { imageUrl }),

  removeItem: (boardId: number, itemId: number): Promise<void> =>
    del(`/api/mood-boards/${boardId}/items/${itemId}`),

  reorder: (boardId: number, itemIds: number[]): Promise<void> =>
    post(`/api/mood-boards/${boardId}/reorder`, { itemIds }),

  getShared: (shareToken: string): Promise<MoodBoard> =>
    get(`/api/mood-boards/shared/${shareToken}`),
};

// ── Show Budgets API ──────────────────────────────────────────

export const BudgetsAPI = {
  getAll: (): Promise<ShowBudget[]> =>
    get('/api/show-budgets'),

  create: (name: string, data: unknown): Promise<ShowBudget> =>
    post('/api/show-budgets', { name, data }),

  delete: (id: number): Promise<void> =>
    del(`/api/show-budgets/${id}`),
};

// ── Backstage Pass (Guides) API ───────────────────────────────

export const GuidesAPI = {
  getAll: (section?: string): Promise<ParentResource[]> =>
    get('/api/parent-resources', section ? { section } : undefined),

  getBySlug: (slug: string): Promise<ParentResource> =>
    get(`/api/parent-resources/${slug}`),
};

// ── Achievements API ──────────────────────────────────────────

export const AchievementsAPI = {
  getBadges: (): Promise<AchievementBadge[]> =>
    get('/api/achievements/badges'),

  getUserAchievements: (userId: string): Promise<UserAchievement[]> =>
    get(`/api/achievements/user/${userId}`),
};

// ── Announcements / Banner API ────────────────────────────────

export const BannerAPI = {
  getActive: (): Promise<AnnouncementBanner | null> =>
    get<AnnouncementBanner | null>('/api/banner/active').catch(() => null),
};

// ── Support Chat API ──────────────────────────────────────────

export const SupportAPI = {
  sendMessage: (message: string, history?: SupportMessage[]): Promise<{ response: string }> =>
    post('/api/support/chat', { message, history }),
};

// ── Image Upload API ──────────────────────────────────────────

export const UploadAPI = {
  /**
   * Upload an image file to Stagey Object Storage.
   * Use expo-image-picker to get the file URI first.
   *
   * const result = await ImagePicker.launchImageLibraryAsync({...});
   * if (!result.canceled) {
   *   const url = await UploadAPI.uploadImage(result.assets[0].uri);
   * }
   */
  uploadImage: async (localUri: string, filename?: string): Promise<string> => {
    const sessionToken = await getSessionToken();
    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      type: 'image/jpeg',
      name: filename || 'upload.jpg',
    } as any);

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (sessionToken) {
      headers['Cookie'] = `connect.sid=${sessionToken}`;
    }

    const uploadResponse = await fetch(`${API_BASE_URL}/api/objects/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    const { uploadId } = await uploadResponse.json();

    const finalizeResponse = await fetch(`${API_BASE_URL}/api/objects/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Cookie: `connect.sid=${sessionToken}` } : {}),
      },
      body: JSON.stringify({ uploadId }),
      credentials: 'include',
    });

    if (!finalizeResponse.ok) {
      throw new Error('Upload finalization failed');
    }

    const { url } = await finalizeResponse.json();
    return url;
  },
};

// ── Analytics API ─────────────────────────────────────────────

export const AnalyticsAPI = {
  trackPageView: (path: string): Promise<void> =>
    post('/api/analytics/page-view', { path }).catch(() => {}), // fire-and-forget

  trackLinkClick: (url: string, label?: string): Promise<void> =>
    post('/api/analytics/link-click', { url, label }).catch(() => {}), // fire-and-forget
};

// ── Stripe API ────────────────────────────────────────────────

export const StripeAPI = {
  getPublishableKey: (): Promise<{ publishableKey: string }> =>
    get('/api/stripe/publishable-key'),
};

// ── Aggregate client (namespaced access) ──────────────────────
// Some components (e.g. NoticeBoard) consume a single `apiClient` object with
// lower-cased namespaces rather than the individual *API exports. This keeps
// both styles available without duplicating any logic.

export const apiClient = {
  auth: AuthAPI,
  shows: ShowsAPI,
  societies: SocietiesAPI,
  castings: CastingsAPI,
  marketplace: MarketplaceAPI,
  news: NewsAPI,
  glossary: GlossaryAPI,
  library: LibraryAPI,
  masterclasses: MasterclassesAPI,
  services: ServicesAPI,
  offers: OffersAPI,
  competitions: CompetitionsAPI,
  community: CommunityAPI,
  profiles: ProfilesAPI,
  conversations: ConversationsAPI,
  calendar: CalendarAPI,
  connections: ConnectionsAPI,
  notifications: NotificationsAPI,
  quiz: QuizAPI,
  moodBoards: MoodBoardsAPI,
  budgets: BudgetsAPI,
  guides: GuidesAPI,
  achievements: AchievementsAPI,
  banner: BannerAPI,
  support: SupportAPI,
  upload: UploadAPI,
  analytics: AnalyticsAPI,
  stripe: StripeAPI,
};

// ── Export utility functions for direct use ───────────────────

export { getSessionToken, saveSessionToken, clearSessionToken };
