# FDE Video Analysis — Strategic Brief for DigitalHustlerX

> **Source:** "FDE: The $1M/Year AI Job Explained" — Greg Isenberg × Voss (Veric Agents)
> **Duration:** 51:34 | **Date analysed:** 2026-08-18

---

## 1. What FDE Actually Is

**Forward Deployed Engineer** = the person who bridges business context and AI deployment.

- Every company can now buy the same intelligence (GPT, Claude, Gemini, etc.)
- Intelligence is commoditised — **deployment** is where the moat lives
- FDE = the person who decides *where, how, and why* AI is applied inside a specific company

**Palantir popularised it:** Their FDEs go on-site, learn workflows, build custom dashboards/agents on top of Palantir's ontology. The platform is the tool; the FDE is the value.

**Key insight:** "The edge is no longer who has the intelligence. It's where, how, and why they use it."

---

## 2. The Three-Stage FDE Framework

| Stage | What It Means | Time Spent |
|-------|---------------|------------|
| **1. Business Reality** | Understand how work *actually* happens (not the documented SOP) | Bulk of time |
| **2. FDE Judgment** | Decide where intelligence belongs and where it doesn't | Critical thinking |
| **3. Build & Deploy** | Write code / spin up agents / integrate with existing systems | Execution |

### Stage 1: Business Reality
- Go on-site (or deep virtual immersion)
- Interview people, watch them work, access their ERPs/CRMs
- The documented process is **rarely** the real process
- Exception handling lives in one person's head
- Communication + analytical ability is critical here

### Stage 2: FDE Judgment
- Not every workflow needs AI (too risky, low ROI, already automated)
- Of a 10-step workflow, maybe only 3 steps need LLM judgment
- The rest can be solved with if/else statements and API calls
- "Where does intelligence belong and where does it not?"

### Stage 3: Build & Deploy
- Varies wildly: some FDEs write production code, some chat-to-build on platforms
- Must integrate with **existing** systems (don't force migrations)
- "Build on top of Netsuite" > "move off Netsuite"
- Human-in-the-loop approval → then automation

---

## 3. The Two Skill Halves (Venn Diagram)

| Left Side (Consulting) | Right Side (Engineering) |
|------------------------|--------------------------|
| Workflows, cost, incentives | Models, systems, APIs |
| Risk, adoption, business value | Data, code, reliability |
| Company politics | Eval, guardrails, harnesses |
| Communication | Post-training, fine-tuning |

**The million-dollar FDE is the BEST of both — not the average.**

McKinsey consultants are strong on the left. Software engineers are strong on the right. The FDE who can do both is rare and extremely valuable.

**Comp range:** $150K base + equity → up to $1M/year for the best.

---

## 4. The Audit Is the Product (Entry Point)

This is the most actionable insight for positioning:

- **Every engagement starts with an audit** (also called a "sprint" — people allergic to "audit")
- The audit maps all workflows, identifies automation opportunities, produces an ROI matrix
- Clients say the audit is worth **10x what they paid**
- Better than McKinsey because it's AI-native and actionable
- **Do the first few audits for free** to build portfolio and trust
- "Your first few customers are worth more to you than you are to them"

**Audit → Eval → Deployment → loop repeats across the organisation**

---

## 5. The 30-Day FDE Playbook

### Week 1: Build an Agent That Completes a Real Loop
- Pick one enterprise workflow (finance, HR, procurement, sales)
- Build: agent looping → tool usage → guardrails → context/memory → audit trail
- Checkpoint: working agent with tools, guardrails, memory, and audit trail for one task

### Week 2: Turn Demo Into a System That Can Recover
- Defined JSON schema (not freeform text)
- Schema validation
- Failure modes and exception handling
- "There's one way something can go right, 1,000 ways it can go wrong"
- Build for the unhappy paths

### Week 3: Make It Measurable and Economically Viable
- Retry logic
- Golden dataset for evals
- Test cheaper models for subtasks (Gemini Flash, MiniMax, etc.)
- Measure across 3 buckets: **revenue uplift, risk mitigation, cost savings**
- Checkpoint: evaluated agent with known failure modes, measured costs, golden dataset

### Week 4: Defend the System Like an FDE
- Document pain points, architecture decisions, iterations
- Show accuracy improvement (70% → 95%)
- Economics: time saved, errors reduced, risk/revenue/cost
- **Rehearse as an engineer** (architecture, decisions)
- **Rehearse as a VP** (problem, outcome, evidence, risk)
- Pitch to businesses for feedback

**"Do the job before you have the title."**

---

## 6. What You're Already Doing (Mapping to DV's Stack)

| FDE Concept | What You Already Have |
|-------------|----------------------|
| Business audit / sprint | GodsEye audits WP sites, maps workflows |
| On-site (virtual) immersion | Telegram-first — you're IN their communication layer |
| Exception handling mapping | You handle edge cases in WP automation |
| Agent building | GodsEye bot + backend + LLM wiring |
| Human-in-the-loop | Approval flow before execution |
| Audit trail | You log agent actions |
| Model agnosticism | Multi-LLM routing (NVIDIA NIM, DeepSeek, etc.) |
| Deploy on existing systems | WP plugin approach — build on top, don't replace |
| Eval frameworks | Partial — could formalise |
| ROI measurement | Not yet structured |

**You're doing ~70% of the FDE playbook already.** The gap is in packaging and positioning.

---

## 7. Service Structure Recommendation

### Tier 1: AI Audit / Sprint (Entry Point)
- Map all workflows in a department
- Produce operating map + ROI matrix
- Show where AI belongs and where it doesn't
- **Price:** £2,500–5,000 or free for first 3 clients
- **Deliverable:** Workflow audit report + prioritised automation roadmap

### Tier 2: Agent Build + Deployment (Core Service)
- Build 1-3 agents for highest-ROI workflows
- Integrate with existing stack (WP, CRM, etc.)
- Human-in-the-loop → shadow mode → production
- **Price:** £5,000–15,000 one-time or £2,000–5,000/month retainer
- **Deliverable:** Working agents + monitoring + eval reports

### Tier 3: Ongoing FDE Retainer (Long-term)
- Continuous improvement across departments
- New workflow identification and deployment
- Model optimisation and cost reduction
- **Price:** £3,000–10,000/month
- **Deliverable:** Monthly optimization reports + new deployments

---

## 8. Positioning for DigitalHustlerX Bio Page

### Headline Options
- "AI Deployment for Service Businesses — From Audit to Agent"
- "Forward-Deployed AI for Companies That Need It Working, Not Just Talked About"
- "Your AI Systems, Built and Running in Weeks — Not Months"

### Key Messages
1. **I don't sell AI theory. I deploy it into your actual workflows.**
2. **The audit shows you exactly where AI saves money — before you spend a penny.**
3. **I build on what you already use. No forced migrations. No disruption.**
4. **Every agent has a human approval step. You stay in control.**
5. **Measured results: revenue uplift, risk reduction, cost savings.**

### Social Proof Angle
- "I've already deployed AI agents that handle [specific workflow] for [type of business]"
- "The audit alone typically pays for itself 10x in identified savings"

---

## 9. Key Quotes to Internalise

> "Intelligence is becoming commoditised. The same foundational capability is available to anybody who can pay for it."

> "The edge is no longer who has the intelligence. It's where, how, and why they use it."

> "There's one way something can go right, but there's a thousand ways something can go wrong. If you're only building for the way it goes right, you're worth nothing."

> "Do the audit for free. Get your foot in the door. Prove value. Then only get paid when you prove measurable value."

> "Your job is to help them get promoted. How do you help them get promoted? By driving value cost effectively."

> "Build on top of their systems. You have an edge if you can build on top of what they already use."

> "The audit was worth 10x what they paid for. It's better than McKinsey because it's so telling."

---

## 10. Immediate Next Steps

1. **Formalise the audit/sprint as a named product** on your bio page
2. **Create a one-page audit template** (workflow map + ROI matrix)
3. **Offer 2-3 free audits** to build case studies and testimonials
4. **Structure your pricing** around the 3-tier model above
5. **Update bio page** with FDE positioning language
6. **Build 1 showcase agent** you can demo to prospects
