export type ActiveView = 'landing' | 'download' | 'success' | 'blog';

export interface WordPressPost {
  id: number;
  title: string;
  status: 'publish' | 'draft';
  author: string;
}

export interface WordPressPlugin {
  name: string;
  slug: string;
  active: boolean;
  version: string;
}

export interface WooCommerceOrder {
  id: number;
  customer: string;
  total: string;
  status: 'pending' | 'completed' | 'processing';
}

export interface WordPressMedia {
  id: number;
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface MockWPState {
  posts: WordPressPost[];
  plugins: WordPressPlugin[];
  orders: WooCommerceOrder[];
  media: WordPressMedia[];
  siteHealth: {
    wpVersion: string;
    phpVersion: string;
    sslActive: boolean;
    activePlugins: number;
    securityScore: number;
  };
  elementorHeroPrice: string;
}

export interface PlaygroundMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isGenerating?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: string;
  sites: string;
  features: string[];
  polarProductId: string;
  isPopular?: boolean;
  listPrice?: string;
  foundersPrice?: string;
  foundersExpiresInDays?: number;
  foundersBadge?: string;
  foundersPercentageOff?: string;
}

export interface SelfHostPlan {
  id: string;
  name: string;
  setupFee: string;
  monthlyFee: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isPopular?: boolean;
}

// ── Niche Profile Templates ─────────────────────────────
// A template is a pre-built "agent profile": pick a niche, and the agent
// boots already knowing your world, your tools, and your work — then asks
// a short set of onboarding questions to go specific before it starts.

export interface OnboardingQuestion {
  id: string;
  /** The question itself, phrased the way the agent would actually ask it. */
  prompt: string;
  /** Hint / example the reader can type (shows in the input placeholder). */
  placeholder: string;
}

export interface TemplateCapability {
  /** Name-dropped platform/tool, e.g. Elementor, WooCommerce, RankMath. */
  label: string;
}

export interface ProfileTemplate {
  id: string;
  /** Niche name, e.g. "Solo Web Developer" */
  title: string;
  /** Short one-line hook for the card. */
  tagline: string;
  /** Longer description shown on the detail panel. */
  description: string;
  /** Icon emoji. */
  icon: string;
  /** Optional pro-mode gate — feature set that unlocks on a paid plan. */
  pro?: boolean;
  /** The pre-loaded "skills" / behavior the agent has from second one. */
  skills: string[];
  /** The tools & platforms the agent already knows how to drive. */
  capabilities: TemplateCapability[];
  /** The onboarding questions the agent asks to go specific. */
  onboarding: OnboardingQuestion[];
}

