import { ProfileTemplate } from "./types";

// ── Niche Profile Templates ─────────────────────────────
// Each template is a pre-built agent profile. Picking one boots the agent
// already knowing your niche, your tools, and your work — then it asks a
// short set of onboarding questions to go specific before it starts.
//
// These are shared, open-source templates: anyone can fork / contribute
// their own niche so new users onboard in minute one instead of hour one.

export const TEMPLATES: ProfileTemplate[] = [
  {
    id: "solo-web-developer",
    title: "Solo Web Developer",
    tagline: "You build sites. The agent runs them 24/7.",
    icon: "🧑‍💻",
    description:
      "You sell websites, not support tickets. This template turns your agent into a quiet back-end teammate: it watches every site you've shipped, handles content updates, uptime checks, security, and the endless 'small change' requests — so you keep billing clients while it keeps them happy.",
    skills: [
      "Maintains every client site you connect — updates, health, uptime",
      "Responds to client content requests as the developer (no hand-off)",
      "Proactively flags security or performance issues before clients do",
      "Proposes and drafts small changes for approval — never ships unapproved",
      "Logs what it did so you can invoice for maintenance",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "WooCommerce" },
      { label: "Yoast / RankMath SEO" },
      { label: "Site Health" },
      { label: "Application Passwords" },
    ],
    onboarding: [
      {
        id: "stack",
        prompt: "What does your typical build stack look like? Any sites you want me to keep an eye on first?",
        placeholder: "e.g. WordPress + Elementor + WooCommerce, start with my main client site",
      },
      {
        id: "pricing",
        prompt: "Are these maintenance retainers or one-off builds? What's your default client price point?",
        placeholder: "e.g. $200/mo maintenance, $2k builds",
      },
      {
        id: "voice",
        prompt: "When I reply to a client as you, what tone should I use?",
        placeholder: "e.g. professional but friendly, short replies, first name",
      },
      {
        id: "auto",
        prompt: "What can I do without asking, and what always needs your OK first?",
        placeholder: "e.g. auto-run security checks; never publish a post without approval",
      },
    ],
  },
  {
    id: "freelance-marketer",
    title: "Freelance Marketer",
    tagline: "Content, SEO & funnels on autopilot for your clients.",
    icon: "📈",
    description:
      "You do the strategy; let the agent do the volume. This profile pre-loads your client WordPress sites with content drafting, on-page SEO fixes, blog scheduling, and funnel-page edits — with your brand voice and approval gates baked in from the start.",
    skills: [
      "Drafts on-brand blog posts, landing pages and email copy",
      "Audits and fixes on-page SEO (Yoast, RankMath, meta, alt text)",
      "Builds funnel landing pages in Elementor from your brief",
      "Schedules a content calendar you approve in one tap",
      "Pulls performance numbers so your reports write themselves",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "Yoast SEO" },
      { label: "Google Search Console" },
      { label: "RankMath" },
      { label: "Mailchimp" },
    ],
    onboarding: [
      {
        id: "services",
        prompt: "Which services do you sell — content, SEO, paid, email? Any niche you specialise in?",
        placeholder: "e.g. SEO + content for local service businesses",
      },
      {
        id: "voice",
        prompt: "Paste or describe your brand voice so everything I write matches it.",
        placeholder: "e.g. conversational, no jargon, confident",
      },
      {
        id: "clients",
        prompt: "How many client sites should I manage? Who's the priority this month?",
        placeholder: "e.g. 5 sites, prioritise Acme Co",
      },
      {
        id: "approval",
        prompt: "Do you want to approve every draft, or do I publish automatically on a schedule?",
        placeholder: "e.g. approve drafts; auto-publish only on Thursdays",
      },
    ],
  },
  {
    id: "local-business-owner",
    title: "Local Business Owner",
    tagline: "Your store's back office, in your pocket.",
    icon: "🏪",
    description:
      "You run the business — not your website. This template gives you a hands-off operator for your WordPress site and online store: update menus, hours, and offers on the fly, answer to reviews and enquiries, and keep your storefront current without calling a developer.",
    skills: [
      "Up-to-date your hours, menus, prices and 'what's on' fast",
      "Drafts and publishes announcements, offers and blog posts",
      "Keeps your store's products, stock and orders in check",
      "Pushes draft replies to reviews and enquiries for your OK",
      "Monitors uptime so your site is never down when it matters",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "WooCommerce" },
      { label: "Elementor" },
      { label: "Booking / Events" },
      { label: "Reviews" },
      { label: "Site Health" },
    ],
    onboarding: [
      {
        id: "business",
        prompt: "Tell me about your business — what do you sell, and what's your trading style?",
        placeholder: "e.g. a coffee shop; casual, friendly, community-focused",
      },
      {
        id: "hours",
        prompt: "What are your current opening hours and is there anything special coming up?",
        placeholder: "e.g. Mon–Sat 8am–6pm; summer menu launching soon",
      },
      {
        id: "voice",
        prompt: "How should I sound when I reply to customers for you?",
        placeholder: "e.g. warm, like a regular staff member",
      },
      {
        id: "approve",
        prompt: "Which updates can I just make, and which do you want to see first?",
        placeholder: "e.g. publish offers free; menu changes need your OK",
      },
    ],
  },
  {
    id: "course-creator",
    title: "Course Creator",
    tagline: "Turn your knowledge into a site that sells itself.",
    icon: "🎓",
    description:
      "You make the teaching; let the agent make everything else. Pre-loaded to build and keep your membership or course site running — sales pages, lesson content, student comms, and backend admin — so you stay in front of the camera, not buried in the CMS.",
    skills: [
      "Builds and updates sales pages and landing pages",
      "Drafts and schedules course content and lesson write-ups",
      "Manages member access, coupons and checkouts",
      "Sends helpful follow-ups to students and leads",
      "Tracks which lessons and offers actually convert",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "WooCommerce" },
      { label: "LearnDash / LifterLMS" },
      { label: "Membership" },
      { label: "Email / CRM" },
    ],
    onboarding: [
      {
        id: "topic",
        prompt: "What's your course about, and who is it for? What's the outcome they want?",
        placeholder: "e.g. 'Freelance on Upwork' for beginners who want their first client",
      },
      {
        id: "catalog",
        prompt: "What courses or offers do you have (and have yet to build)?",
        placeholder: "e.g. 1 flagship course live, 2 planned",
      },
      {
        id: "voice",
        prompt: "How do you talk to your students? Give me your teaching voice.",
        placeholder: "e.g. encouraging, direct, beginner-friendly",
      },
      {
        id: "launch",
        prompt: "Is there a launch or promo coming up I should get ready for?",
        placeholder: "e.g. cart open in 2 weeks — need a waitlist + emails",
      },
    ],
  },
  {
    id: "creator-blogger",
    title: "Creator Blogger",
    tagline: "Post more. Stress less.",
    icon: "✍️",
    description:
      "Your job is ideas; the agent is your editor and publisher. This profile keeps your blog pipeline full — outlines, drafts, images, SEO, scheduling and publishing — in your voice, on your schedule, so your content engine runs even when you're not at the keyboard.",
    skills: [
      "Turns your ideas into outlines and full drafts in your voice",
      "Sources or matches images and media for each post",
      "Fixes on-page SEO — titles, meta, alt text, internal links",
      "Schedules posts to publish on your cadence automatically",
      "Keeps your site fast, secure and up with no thought from you",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "Yoast SEO" },
      { label: "RankMath" },
      { label: "Media Library" },
      { label: "RSS / Newsletters" },
    ],
    onboarding: [
      {
        id: "niche",
        prompt: "What's your blog about, and what does your audience actually want?",
        placeholder: "e.g. personal finance for people in their 20s",
      },
      {
        id: "voice",
        prompt: "Share a recent post you loved writing so I can match the tone.",
        placeholder: "paste a link or a snippet",
      },
      {
        id: "cadence",
        prompt: "How often should I schedule posts, and what time works best?",
        placeholder: "e.g. 2x a week, Tuesdays & Thursdays 9am",
      },
      {
        id: "ideas",
        prompt: "Got a content idea pile I should start from first?",
        placeholder: "e.g. my list of 20 topics, start from the top",
      },
    ],
  },
  {
    id: "agency-operator",
    title: "Agency Operator",
    tagline: "One agent, every client site. Under your brand.",
    icon: "🏢",
    description:
      "You run the agency; the agent runs the deliverables. This profile is built for someone serving multiple clients — it keeps every connected site healthy, handles routine updates and content requests across all of them, and packages clean weekly status reports you can hand straight to clients.",
    skills: [
      "Manages every client site you connect from one conversation",
      "Runs routine maintenance, updates and security checks site-wide",
      "Turns client requests into done work with a paper trail",
      "Drafts per-client status reports you can forward as-is",
      "Flags escalations so only real fires reach you",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "WooCommerce" },
      { label: "Elementor" },
      { label: "Multi-site" },
      { label: "Yoast SEO" },
      { label: "Security" },
    ],
    onboarding: [
      {
        id: "clients",
        prompt: "How many client sites are you running, and what's your service mix?",
        placeholder: "e.g. 12 sites — care plans, builds and SEO",
      },
      {
        id: "branding",
        prompt: "When I communicate as your agency, what tone and branding should I use?",
        placeholder: "e.g. professional, on-brand, client's project manager",
      },
      {
        id: "billing",
        prompt: "What does each client's plan entitle them to, so I stay within scope?",
        placeholder: "e.g. care plan = updates + 2 content edits/mo",
      },
      {
        id: "reporting",
        prompt: "What should the client status reports include, and how often?",
        placeholder: "e.g. weekly, 1 page: work done, uptime, next steps",
      },
    ],
  },
  {
    id: "ecommerce-store",
    title: "E-commerce Store",
    tagline: "Your shop's co-manager. From stock to checkout.",
    icon: "🛒",
    description:
      "Your online store runs on WooCommerce — this template makes sure it never runs you ragged. It watches orders, stock levels and price changes, drafts product pages and promos, and keeps the store fast and secure, all from a Telegram chat.",
    skills: [
      "Keeps product pages, descriptions, prices and stock current",
      "Monitors orders, low-stock and abandoned carts",
      "Drafts promos, banners and product launches for approval",
      "Fixes slow or broken checkout / payment issues fast",
      "Runs daily health, backup and security checks",
    ],
    capabilities: [
      { label: "WooCommerce" },
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "Payments / Stripe" },
      { label: "Inventory" },
      { label: "Shipping" },
    ],
    onboarding: [
      {
        id: "store",
        prompt: "What do you sell, and what are your best-selling products?",
        placeholder: "e.g. handmade leather goods; belts and bags",
      },
      {
        id: "stock",
        prompt: "How should I handle stock alerts and reorder prompts?",
        placeholder: "e.g. ping me under 10 units and draft a reorder note",
      },
      {
        id: "promos",
        prompt: "Any active promos or seasonal events I should plan towards?",
        placeholder: "e.g. Black Friday bundle, sitewide 20% off",
      },
      {
        id: "voice",
        prompt: "What tone should product copy and customer replies use?",
        placeholder: "e.g. premium, warm, concise",
      },
    ],
  },
  {
    id: "real-estate-agent",
    title: "Real Estate Agent",
    tagline: "Every listing, every lead, handled.",
    icon: "🏠",
    description:
      "Selling property is a listing-and-follow-up game. This template keeps your site current with new listings and open-homes, drafts fast replies to enquiries, and centralises your follow-ups so no lead goes cold while you're out showing houses.",
    skills: [
      "Publishes and updates property listings with photos and details",
      "Drafts enquiry replies and lead follow-ups for your OK",
      "Keeps 'open home' times and availability current on site",
      "Tracks which listings and channels are pulling enquiries",
      "Keeps your site fast and your contact forms working",
    ],
    capabilities: [
      { label: "WordPress" },
      { label: "Elementor" },
      { label: "Property / IDX" },
      { label: "Contact Forms" },
      { label: "WooCommerce" },
      { label: "Site Health" },
    ],
    onboarding: [
      {
        id: "patch",
        prompt: "What area and property types do you cover?",
        placeholder: "e.g. Midtown — residential sales & rentals",
      },
      {
        id: "listings",
        prompt: "Where do listings come from — a feed, an IDX, or you pasting them?",
        placeholder: "e.g. I paste details + upload photos",
      },
      {
        id: "voice",
        prompt: "How should I reply to a buyer enquiry on your behalf?",
        placeholder: "e.g. friendly, fast, share the open-home time",
      },
      {
        id: "priorities",
        prompt: "Any listings to push or open-homes coming up?",
        placeholder: "e.g. pushing the 3-bed on Maple Street this weekend",
      },
    ],
  },
];
