# GODSEYE — TELEGRAM BOT SPEC (for approval, NOT live)
> Complete command set + group-creation wizard. Blueprint for bot developer.

---

## 1. THE ONBOARDING WIZARD (guided group creation)

### Flow when user taps START or sends /start:

```
User: /start

Bot: 👁️ Welcome to Godseye.

I'm your agent. I can spin up a team that runs your business — your site, your content, your leads, your customers — all from this chat.

Before I start working, I need to set up a home for us.

What's your business about?
(Example: "I run an online jewelry store" or "I'm a lash tech who blogs")

User: [describes their business]

Bot: Got it. I'm setting up your workspace now.

→ [BOT CALLS: createTelegramGroup, setForumTopics, promoteAdmin]
→ [BOT CREATES GROUP: "{Business Name} · Godseye HQ"]
→ [BOT SETS UP FORUM TOPICS:]
   📋 Tasks & Work
   📊 Analytics & Reports
   💬 Customer Interactions
   🔧 Settings & Config
   📁 Files & Deliverables

Bot: ✅ Your workspace is ready.

📍 Group: "{Business Name} · Godseye HQ"
📍 I've set up 5 sections: Tasks, Analytics, Customers, Settings, Files.

I've deployed your first agent based on what you told me: [WP Operator / Assistant / Store Manager — based on their description].

You have 30 free minutes to test me. No card needed.

What should I work on first?
```

### Telegram Bot API calls needed:
1. `createChat` (supergroup, forum-enabled)
2. `setChatTitle` → "{BusinessName} · Godseye HQ"
3. `setChatPermissions` (members can post, bot is admin)
4. `promoteChatMember` (bot → admin with all rights)
5. For each forum topic: `createForumTopic` (5 topics above)
6. Pin a welcome message in the main topic

---

## 2. COMMAND REFERENCE

### /start
**Purpose:** Onboarding wizard (see above)
**Input:** None (first message) or restart wizard
**Output:** Guided conversation → group creation → first agent deployed

### /hire [mode]
**Purpose:** Spin up a new agent role
**Modes:** `store` | `content` | `leads` | `ads` | `assistant` | `wp`
**Example:** `/hire store`
**Flow:**
1. Bot confirms the hire
2. Asks 1-2 setup questions (e.g. "What's your WooCommerce URL?")
3. Deploys the agent
4. Posts in the Tasks topic: "🏪 Store Agent is now standing by."
**Cost:** Deducts from hour balance OR starts monthly billing if on a plan

### /work [hours] [task]
**Purpose:** Start a God Mode work loop
**Example:** `/work 2 "write 3 blog posts about summer skincare trends and schedule them"`
**Flow:**
1. Bot confirms: "Starting a 2-hour work session on: write 3 blog posts..."
2. Agent plans the task → executes → plans next → loops
3. Posts progress updates in the Tasks topic
4. Posts deliverables in the Files topic (links, documents, screenshots)
5. Stops when timer expires OR user says "stop"
**Steering:** User can type at any time: "make them shorter", "add more SEO keywords", "stop after this one"

### /buy [bundle]
**Purpose:** Purchase hours or upgrade plan — generates inline payment link
**Examples:**
- `/buy 10h` → 10-Hour Pack ($69)
- `/buy 50h` → 50-Hour Pack ($249)
- `/buy starter` → Starter monthly ($9/mo)
- `/buy pro` → Pro monthly ($29/mo)
**Flow:**
1. Bot generates a Polar checkout URL
2. Sends it as an inline button: "💳 Pay $69 →"
3. User clicks → pays in browser → webhook credits their account
4. Bot confirms: "✅ 10 hours added. You now have 12 hours remaining."
**No leaving Telegram for the decision — only for the payment page itself.**

### /status
**Purpose:** Show what's running and what's left
**Output:**
```
📊 Godseye Status

Active agents:
🏪 Store Agent — standing by
✍️ Content Agent — working (1h 20m left on current task)

Hours remaining: 7.5 hours
Plan: Pro ($29/mo) — renews Aug 28

Recent deliverables:
- 3 blog posts drafted (Tasks topic)
- 12 leads exported (Files topic)
```

### /agents
**Purpose:** List, add, or remove agents
**Example:** `/agents` → list all active agents with status
**Example:** `/agents add leads` → same as `/hire leads`
**Example:** `/agents remove ads` → stops the Ad Runner agent

### /connect [service]
**Purpose:** Connect an external service the agent can use
**Services:** `wordpress` | `meta` | `twitter` | `email` | `shopify`
**Example:** `/connect wordpress`
**Flow:**
1. Bot asks: "What's your WordPress site URL?"
2. User provides URL
3. Bot: "Generate an Application Password in WP Admin → Users → Profile. Paste it here."
4. User pastes password
5. Bot tests connection → confirms: "✅ Connected to yourstore.com"
6. Agent can now manage the site
**Monetization:** Each connection = more billable work the agent can do.

### /keys
**Purpose:** (VPS tier only) Manage bring-your-own-keys
**Flow:**
1. Bot shows current API keys configured
2. User can add/remove: OpenAI, Anthropic, DeepSeek, etc.
3. Bot routes future requests through user's keys instead of shared pool

### /help
**Purpose:** Full command reference
**Output:** All commands with examples, link to full docs

---

## 3. IN-CHAT STEERING (natural language, no command needed)

Users can always just type naturally to steer the agent:

- **"Stop"** → Agent pauses current work, waits for direction
- **"Change the tone to more casual"** → Agent adjusts and continues
- **"Do it faster, skip the details"** → Agent speeds up
- **"What did you just do?"** → Agent posts a summary of last action
- **"Send me the file"** → Agent posts the deliverable in chat
- **"How many hours do I have left?"** → Same as /status

**Rule:** Godseye stops waiting, not listening. If the user says something, the agent adjusts.

---

## 4. DELIVERABLE SYSTEM

When the agent completes work, it posts deliverables directly in Telegram:

| Deliverable type | How it's delivered |
|-----------------|-------------------|
| Text content (blog post, email) | Posted as a message in the Files topic |
| Files (CSV, images, documents) | Uploaded as Telegram file attachment |
| Site changes (WP edits) | Screenshot posted + confirmation message |
| Analytics/reports | Formatted message with key metrics |
| Lead lists | CSV file uploaded to Files topic |

---

## 5. AGENT LOOP ENGINE (God Mode)

The core work loop when `/work` is triggered:

```
1. PARSE the task description
2. PLAN: break into subtasks
3. EXECUTE first subtask
4. POST progress update in Tasks topic
5. CHECK: did user steer? (read recent messages)
   - If yes → adjust plan
   - If no → continue
6. PLAN next subtask
7. Repeat 3-6 until:
   - Timer expires, OR
   - User says "stop", OR
   - All subtasks done
8. POST final summary + deliverables
```

---

## 6. GROUP TOPIC STRUCTURE

Every client gets a group with these forum topics:

| Topic | Purpose |
|-------|---------|
| 📋 **Tasks & Work** | Active work, progress updates, steering |
| 📊 **Analytics & Reports** | Weekly summaries, site health, performance |
| 💬 **Customer Interactions** | Customer messages, support replies, outreach |
| 🔧 **Settings & Config** | Connections, billing, agent management |
| 📁 **Files & Deliverables** | All output files, exports, documents |

The main group chat (outside topics) = free-form conversation with the agent.

---

## 7. BILLING INTEGRATION

- Hour balance tracked per user (Postgres via OpenSaaS)
- `/buy` generates Polar checkout URL → webhook credits account
- Monthly plans auto-renew via Polar subscriptions
- Free trial: 30 minutes, no card
- Referral: both parties get 5 free hours
- Hours roll over (never expire)

---

*This spec is the blueprint. Implementation follows approval.*
