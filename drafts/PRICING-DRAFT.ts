// GODSEYE — PRICING DRAFT (for approval, NOT live)
// This is a DRAFT. Do not import or use in production yet.
// When approved, merge into mockData.ts and create Polar products for each.

// === TYPES (extend types.ts with these) ===

export interface HourBundle {
  id: string;
  name: string;
  hours: number;
  price: number;
  pricePerHour: number;
  tagline: string;
  popular?: boolean;
  polarProductId?: string; // to be set after Polar product creation
}

export interface MonthlyHire {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  includedHours: number;
  agentCount: number;
  features: string[];
  polarProductId?: string;
  highlight?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  oneTime?: boolean;
}

// === HOUR BUNDLES (primary pricing unit) ===

export const HOUR_BUNDLES: HourBundle[] = [
  {
    id: "trial-1h",
    name: "1-Hour Trial",
    hours: 1,
    price: 9,
    pricePerHour: 9.00,
    tagline: "Try it tonight",
  },
  {
    id: "pack-10h",
    name: "10-Hour Pack",
    hours: 10,
    price: 69,
    pricePerHour: 6.90,
    tagline: "One project, done",
    popular: true,
  },
  {
    id: "pack-50h",
    name: "50-Hour Pack",
    hours: 50,
    price: 249,
    pricePerHour: 4.98,
    tagline: "Ongoing operations",
  },
  {
    id: "pack-100h",
    name: "100-Hour Pack",
    hours: 100,
    price: 399,
    pricePerHour: 3.99,
    tagline: "Agency / power user",
  },
];

// === MONTHLY HIRES (recurring revenue) ===

export const MONTHLY_HIRES: MonthlyHire[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    priceLabel: "$9/mo",
    includedHours: 5,
    agentCount: 1,
    features: [
      "1 agent standing by",
      "5 hours included per month",
      "WordPress management (posts, store, media)",
      "Telegram support",
      "Additional hours: $9/hr",
    ],
    polarProductId: "bc746111-be41-4f7e-8e75-ed3d7eb1e7e3", // existing Starter
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29/mo",
    includedHours: 20,
    agentCount: 3,
    features: [
      "Up to 3 agents",
      "20 hours included per month",
      "Everything in Starter, plus:",
      "Lead generation agent",
      "Social media management",
      "Analytics and reporting",
      "Additional hours: $7/hr",
    ],
    highlight: true,
    polarProductId: "a31bba8d-5ef6-4033-93c4-24acdb46a30f", // existing Pro
  },
  {
    id: "vps",
    name: "VPS / Self-Host",
    price: 99,
    priceLabel: "$99/mo",
    includedHours: 0, // unlimited on own server
    agentCount: -1, // unlimited
    features: [
      "Unlimited agents",
      "Your own VPS instance",
      "Bring your own API keys (BYOK)",
      "Full server control",
      "No API bills from us — one flat price",
      "Priority support + setup assistance",
    ],
    polarProductId: "b13480b8-f4ae-4051-aa1c-36ac31303ce7", // existing God Mode
  },
];

// === ADD-ONS (upsell at checkout) ===

export const ADDONS: AddOn[] = [
  {
    id: "extra-hours-5",
    name: "+5 Extra Hours",
    price: 35,
    priceLabel: "$35",
    description: "Add 5 more agent hours to any plan. Never expires.",
    oneTime: true,
  },
  {
    id: "site-migration",
    name: "Site Migration",
    price: 49,
    priceLabel: "$49",
    description: "We migrate your WordPress site to Godseye — zero downtime, full setup.",
    oneTime: true,
  },
  {
    id: "pack-store-bot",
    name: "Store-Bot Preset",
    price: 29,
    priceLabel: "$29",
    description: "Pre-configured WooCommerce agent: orders, inventory, coupons, cart recovery.",
    oneTime: true,
  },
  {
    id: "pack-content-bot",
    name: "Content Calendar Bot",
    price: 29,
    priceLabel: "$29",
    description: "30-day content calendar + auto-drafting + social cross-posting.",
    oneTime: true,
  },
  {
    id: "pack-lead-finder",
    name: "Lead-Finder Bot",
    price: 29,
    priceLabel: "$29",
    description: "Niche lead search + data enrichment + CSV export + cold email sequence.",
    oneTime: true,
  },
  {
    id: "infra-slot",
    name: "Dedicated VPS Slot",
    price: 20,
    priceLabel: "$20/mo",
    description: "Your own isolated infrastructure slot. Higher limits, dedicated resources.",
  },
  {
    id: "domain-setup",
    name: "Domain Management Setup",
    price: 19,
    priceLabel: "$19",
    description: "Connect your domain, configure DNS, SSL, and email. One-time setup.",
    oneTime: true,
  },
];

// === FREE TIER (the hook) ===

export const FREE_TIER = {
  id: "free",
  name: "Free",
  price: 0,
  hours: 0.5, // 30 min free trial — enough to see it work
  features: [
    "30-minute free trial",
    "No credit card required",
    "Test on your real business",
    "Upgrade anytime",
  ],
};

// === REFERRAL PROGRAM ===

export const REFERRAL = {
  reward: "5 free hours",
  rewardBoth: true, // both referrer and referee get it
  description: "Get 5 free hours when someone you refer hires their first agent.",
};
