import { PricingPlan, MockWPState, SelfHostPlan } from "./types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Vanilla Base",
    price: "$0",
    credits: "Running",
    sites: "1 running agent",
    features: [
      "A running agent you can talk to immediately on Telegram",
      "Bring your own LLM API keys, or use our shared keys at cost",
      "Your own plugin (agent directive) included",
      "Community support via Living with Agents",
      "Curated plugin feed (view-only)",
      "Agents file + primary store (storage-based)"
    ],
    polarProductId: "free"
  },
  {
    id: "starter",
    name: "Base",
    price: "$9",
    credits: "500",
    sites: "1 running agent + 1 connection",
    features: [
      "Everything in Vanilla Base, plus:",
      "Plugin marketplace access (Recommended plugins)",
      "Connect your own Telegram bot to your agent",
      "Live connectors (store, site, content)",
      "LLM keys at cost + our referral links",
      "Extra stores for your agents file",
      "Email Support (24h)"
    ],
    polarProductId: "bc746111-be41-4f7e-8e75-ed3d7eb1e7e3",
    isPopular: true
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    credits: "2,000",
    sites: "3 running agents + connectors",
    features: [
      "Everything in Base, plus:",
      "Recommended plugins unlocked & installable",
      "Multi-agent (3 agents) & multi-store",
      "Recurring tasks & automations",
      "Priority plugin library access",
      "Business analytics & insights",
      "Priority Support (4h)"
    ],
    polarProductId: "a31bba8d-5ef6-4033-93c4-24acdb46a30f"
  },
  {
    id: "godmode",
    name: "God Mode",
    price: "$99",
    credits: "10,000",
    sites: "Unlimited agents & connectors",
    features: [
      "Everything in Pro",
      "Unlimited everything — no rate limits",
      "Dedicated VPS included",
      "Bring your own API keys at full control",
      "Full server architecture control",
      "Earliest access to new store drops",
      "Dedicated support channel"
    ],
    polarProductId: "b13480b8-f4ae-4051-aa1c-36ac31303ce7"
  },
  {
    id: "burst",
    name: "Burst",
    price: "Free",
    credits: "Limited windows",
    sites: "No subscription",
    features: [
      "No subscription required",
      "Burst access to your resources in limited time windows",
      "Use your credits or keys for a set block of hours",
      "Perfect for a quick job without committing to a plan",
      "Upsell path to a plan when you need always-on access"
    ],
    polarProductId: "burst-access"
  }
];

export const CREDIT_PACKS = [
  {
    id: "topup",
    name: "Wallet Top-Up",
    price: "$10",
    credits: "100",
    description: "Perfect for quick overages, credits never expire.",
    polarProductId: "873e9805-d7ea-4f1d-a344-832896cf0ac9"
  },
  {
    id: "pack-starter",
    name: "Starter Pack",
    price: "$9",
    credits: "500",
    description: "Great value pack to keep running for weeks.",
    polarProductId: "28aef4c4-4cf3-4128-8d61-8212c9057afd"
  },
  {
    id: "pack-pro",
    name: "Pro Pack",
    price: "$29",
    credits: "2,000",
    description: "Heavy usage option for active bloggers.",
    polarProductId: "a758d371-2b37-4f12-9c10-4a9402995b0e"
  }
];

export const INITIAL_WP_STATE: MockWPState = {
  posts: [
    { id: 1, title: "Hello World!", status: "publish", author: "admin" },
    { id: 2, title: "10 Best Plugins for Speed", status: "publish", author: "admin" },
    { id: 3, title: "Product Launch Announcement", status: "draft", author: "admin" }
  ],
  plugins: [
    { name: "Yoast SEO", slug: "wordpress-seo", active: false, version: "21.0" },
    { name: "WooCommerce", slug: "woocommerce", active: true, version: "8.4.0" },
    { name: "Elementor Page Builder", slug: "elementor", active: true, version: "3.18.0" },
    { name: "Classic Editor", slug: "classic-editor", active: false, version: "1.6.3" }
  ],
  orders: [
    { id: 2056, customer: "John Doe", total: "$89.00", status: "completed" },
    { id: 2055, customer: "Jane Smith", total: "$145.00", status: "processing" },
    { id: 2054, customer: "Mark Wilson", total: "$24.99", status: "pending" }
  ],
  media: [
    { id: 101, filename: "hero-bg.jpg", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80", uploadedAt: "2026-07-10" },
    { id: 102, filename: "logo-dark.png", url: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=150&q=80", uploadedAt: "2026-07-12" }
  ],
  siteHealth: {
    wpVersion: "6.5.2",
    phpVersion: "8.1.26",
    sslActive: true,
    activePlugins: 2,
    securityScore: 92
  },
  elementorHeroPrice: "$499"
};


export const SELF_HOST_PLANS: SelfHostPlan[] = [
  {
    id: "diy",
    name: "DIY Install",
    setupFee: "Free",
    monthlyFee: "$0/mo",
    description: "BYO VPS. Free install script. Community support only.",
    features: [
      "One-command install script",
      "Comprehensive docs & guides",
      "Community support via Telegram",
      "Full AGPL-3.0 open-source access"
    ],
    ctaLabel: "View docs",
    ctaHref: "https://github.com/DigitalHustlerX-Labs/GodseyeHQ#quick-start-local-dev"
  },
  {
    id: "white-glove",
    name: "White-Glove Setup",
    setupFee: "$299 setup",
    monthlyFee: "$49/mo managed",
    description: "We provision your VPS, install Godseye, configure your WP sites, hand over keys. You own your data.",
    features: [
      "Full VPS provisioning & hardening",
      "Godseye installation & configuration",
      "WordPress site connections setup",
      "Ongoing updates, backups & monitoring",
      "Email support (4h SLA)"
    ],
    ctaLabel: "Book a setup call",
    ctaHref: "mailto:selfhost@godseye.shop?subject=White-Glove%20Setup",
    isPopular: true
  },
  {
    id: "migration",
    name: "Migration Package",
    setupFee: "$599 one-time",
    monthlyFee: "",
    description: "We move your existing WP sites from cPanel/Bluehost/HostGator to a self-hosted Godseye VPS. Zero downtime.",
    features: [
      "cPanel / Plesk / DirectAdmin migration",
      "DNS & SSL configuration",
      "Database transfer & verification",
      "Godseye integration setup",
      "Zero-downtime cutover"
    ],
    ctaLabel: "Book a migration",
    ctaHref: "mailto:selfhost@godseye.shop?subject=Migration%20Package"
  },
  {
    id: "storage",
    name: "Storage Top-Ups",
    setupFee: "",
    monthlyFee: "$19 per 100GB/mo",
    description: "Scale storage as your media library grows. No caps, no throttling.",
    features: [
      "Additional 100GB SSD storage",
      "Auto-scalable — no downtime",
      "Daily encrypted backups",
      "Retention up to 30 days"
    ],
    ctaLabel: "Add storage",
    ctaHref: "mailto:selfhost@godseye.shop?subject=Storage%20Top-Up"
  },
  {
    id: "white-label",
    name: "White-Label (Agencies)",
    setupFee: "",
    monthlyFee: "$999/mo",
    description: "Run Godseye under your own brand for your clients. Powered by Godseye, branded as your agency.",
    features: [
      "Custom branding & domain",
      "Multi-tenant client management",
      "Billing & usage dashboards",
      "Priority Slack support",
      "API access for custom integrations"
    ],
    ctaLabel: "Book a discovery call",
    ctaHref: "mailto:selfhost@godseye.shop?subject=White-Label%20Agency"
  },
  {
    id: "enterprise",
    name: "Enterprise Self-Host",
    setupFee: "$2,999 setup",
    monthlyFee: "$499/mo",
    description: "Multi-tenant, SSO, dedicated support SLA, custom integrations. For agencies running 50+ WP sites.",
    features: [
      "Multi-region high-availability deployment",
      "SSO (SAML/OIDC) integration",
      "Dedicated support SLA (1h response)",
      "Custom integrations & plugins",
      "Audit logs & compliance reports"
    ],
    ctaLabel: "Talk to sales",
    ctaHref: "mailto:selfhost@godseye.shop?subject=Enterprise%20Self-Host"
  }
];
export const SAMPLE_COMMANDS = [
  "Create draft post 'AI Revolution'",
  "Activate Yoast SEO plugin",
  "Update Elementor pricing to $599",
  "Show me my latest WooCommerce orders",
  "Check site health"
];
