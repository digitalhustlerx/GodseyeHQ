import { PricingPlan, MockWPState } from "./types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    credits: "50",
    sites: "1 WordPress Site",
    features: [
      "Manage Posts & Pages",
      "Plugin Status Toggles",
      "Basic Site Health Checks",
      "Telegram Bot Access",
      "Standard Response Time"
    ],
    polarProductId: "free-plan-placeholder"
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    credits: "500",
    sites: "1 WordPress Site",
    features: [
      "Everything in Free",
      "WooCommerce Orders & Products",
      "Elementor Price/Text Edits",
      "E-mail Support (24h)",
      "Unused Credits Carry Over",
      "5 competitor analysis reports per day",
      "Basic topic suggestions for your niche"
    ],
    polarProductId: "21f41008-1dbf-4d1a-8f1c-96ea518203b3",
    isPopular: true
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    credits: "2,000",
    sites: "3 WordPress Sites",
    features: [
      "Everything in Starter",
      "Multi-Site Management",
      "Media Upload Actions",
      "Priority Email Support (4h)",
      "Dedicated Gateway Access",
      "Unlimited competitor analysis & market research",
      "Advanced topic suggestions with content ideas",
      "Weekly content planning templates",
      "Automated daily draft scheduling"
    ],
    polarProductId: "ff6a89c7-6d4e-4748-a760-3c73179b7b44"
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    credits: "10,000",
    sites: "10 WordPress Sites",
    features: [
      "Everything in Pro",
      "Up to 10 Connected Sites",
      "Dedicated OpenClaw Node",
      "Dedicated Slack/Telegram Support",
      "Custom Workflow Automation",
      "All Pro features, unlimited usage",
      "Custom content workflows & automations",
      "Priority support"
    ],
    polarProductId: "2dadbaf0-24a2-4d45-abd1-5a6e11c4c741"
  }
];

export const CREDIT_PACKS = [
  {
    id: "topup",
    name: "Wallet Top-Up",
    price: "$10",
    credits: "100",
    description: "Perfect for quick overages, credits never expire.",
    polarProductId: "d3d4aea6-d6f1-4092-b815-675a52cbcee2"
  },
  {
    id: "pack-starter",
    name: "Starter Pack",
    price: "$9",
    credits: "500",
    description: "Great value pack to keep running for weeks.",
    polarProductId: "21f41008-1dbf-4d1a-8f1c-96ea518203b3"
  },
  {
    id: "pack-pro",
    name: "Pro Pack",
    price: "$29",
    credits: "2,000",
    description: "Heavy usage option for active bloggers.",
    polarProductId: "ff6a89c7-6d4e-4748-a760-3c73179b7b44"
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

export const SAMPLE_COMMANDS = [
  "Create draft post 'AI Revolution'",
  "Activate Yoast SEO plugin",
  "Update Elementor pricing to $599",
  "Show me my latest WooCommerce orders",
  "Check site health"
];
