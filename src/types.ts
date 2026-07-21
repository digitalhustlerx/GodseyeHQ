export type ActiveView = 'landing' | 'buy' | 'download' | 'success';

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
  foundersPrice?: string;
  foundersExpiresInDays?: number;
  foundersBadge?: string;
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

