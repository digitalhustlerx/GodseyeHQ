#!/usr/bin/env python3
"""
GodsEye Wrong-Answer Agent — weekly AI lie detector for the product.

Asks diverse external LLMs (NVIDIA NIM hosted models + opencode-go gateway)
the top GodsEye buyer questions, compares their answers against the canonical
truth (PRD.md / AGENTS.md), and reports contradictions: wrong pricing claims,
wrong positioning, wrong autonomy claims, wrong URLs, misidentification.

Usage:
  python3 wrong_answer_agent.py           # cron mode: print findings only (silent when clean)
  python3 wrong_answer_agent.py --report  # show full report (what was asked, what each model said, verdicts)
  python3 wrong_answer_agent.py --json    # machine-readable JSON

Keys are read from existing config files; nothing is printed, logged, or stored.
"""
import json
import re
import sys
import time
import urllib.request

# --------------------------------------------------------------------------
# 1. Canonical truth (source: /root/godseye-repo/PRD.md + AGENTS.md, 2026-08-15)
# --------------------------------------------------------------------------
QUESTIONS = [
    {
        "q": "What is GodsEye and what does it do?",
        "truth": (
            "GodsEye is a Telegram-first AI business operator. Canonical promise: "
            "'Your business, run by an AI agent.' It thinks ahead, handles useful work, "
            "and keeps the customer in control. WordPress is its first integration and "
            "activation path, not its whole identity."
        ),
        "flags": [
            (r"\$\s?\d", "specific price claim"),
            (r"(only|just|basically)\s+a?\s*wordpress", "positioned as WordPress-only"),
            (r"is\s+(indeed\s+|basically\s+|just\s+)?a\s+(wordpress|wp)?\s*plugin", "called a WordPress plugin"),
            (r"(gps|fleet\s*(tracking|management)|surveillance|location\s*tracking)", "misidentified as GPS/tracking product"),
        ],
    },
    {
        "q": "How much does GodsEye cost? What are its plans?",
        "truth": (
            "Pricing is not final and no specific prices are published as final. "
            "There is a free preview/workspace so users can try safe examples. "
            "Live execution on a customer's real business requires an active subscription."
        ),
        "flags": [
            (r"\$\s?\d+", "specific price claim"),
            (r"per\s+(month|day|hour|year)", "per-period price claim"),
            (r"credit", "credit/session pricing claim"),
            (r"\d+\s*(usd|dollars)", "specific price claim"),
            (r"free\s*(live|execution|unlimited)", "claims free live execution"),
        ],
    },
    {
        "q": "Is GodsEye a WordPress plugin?",
        "truth": (
            "No. GodsEye is a whole-business agent. WordPress is the first integration "
            "and activation path, but the product is Telegram-first and not limited to WordPress."
        ),
        "flags": [
            (r"^yes", "says it is a WordPress plugin"),
            (r"is\s+(indeed\s+|basically\s+|just\s+)?a\s+(wordpress|wp)?\s*plugin", "calls it a plugin"),
            (r"only\s+works", "limits it to WordPress"),
        ],
    },
    {
        "q": "Does GodsEye run fully on its own without any supervision?",
        "truth": (
            "No. The customer approves everything the agent ships. GodsEye does not promise "
            "zero supervision or unrestricted autonomous execution on a customer's real systems."
        ),
        "flags": [
            (r"(fully|completely|100%?)\s*autonom", "claims full autonomy"),
            (r"no\s+(supervision|oversight|approval)", "claims no supervision needed"),
            (r"without\s+(your|human)?\s*(approval|input)", "claims no approval needed"),
            (r"runs\s+itself", "claims it runs itself"),
        ],
    },
    {
        "q": "Is there a free trial or free plan for GodsEye?",
        "truth": (
            "Yes, a free workspace/sample preview exists. Live execution requires a paid "
            "subscription. The free preview does not include free live execution on a "
            "customer's real business."
        ),
        "flags": [
            (r"free\s*$", "implies fully free product"),
            (r"100%\s*free|totally\s*free|completely\s*free", "claims entirely free"),
            (r"no\s+free", "denies the free preview exists"),
        ],
    },
    {
        "q": "Where can I sign up for GodsEye or contact it?",
        "truth": (
            "Signup: https://app.digitalhustlerx.com/signup. Landing: "
            "https://godseye.digitalhustlerx.com/. Telegram bot: @GodseyeXbot."
        ),
        "flags": [
            (r"https?://[^\s\"]+", "URL claim (verify against canonical set)"),
        ],
    },
]

CANONICAL_DOMAINS = {
    "app.digitalhustlerx.com", "godseye.digitalhustlerx.com", "godseye.shop",
    "api.godseyes.digitalhustlerx.com", "x.com", "twitter.com", "t.me",
}

# --------------------------------------------------------------------------
# 2. Voices — read keys from existing config, never echo them
# --------------------------------------------------------------------------
def _read_key_sources():
    """Return list of (label, base_url, api_key, [models])."""
    voices = []

    def _oc_provider(name):
        try:
            d = json.load(open("/root/.config/opencode/opencode.json"))
            return d.get("provider", {}).get(name, {}).get("options", {})
        except Exception:
            return {}

    nv = _oc_provider("provider-nvidia")
    if nv.get("apiKey"):
        voices.append({
            "label": "NVIDIA DeepSeek",
            "base": nv.get("baseURL", "https://integrate.api.nvidia.com/v1"),
            "key": nv["apiKey"],
            "model": "deepseek-ai/deepseek-v4-flash-0731",
        })
        voices.append({
            "label": "NVIDIA Llama-3.3",
            "base": nv.get("baseURL", "https://integrate.api.nvidia.com/v1"),
            "key": nv["apiKey"],
            "model": "meta/llama-3.3-70b-instruct",
        })
        voices.append({
            "label": "NVIDIA Llama-3.1",
            "base": nv.get("baseURL", "https://integrate.api.nvidia.com/v1"),
            "key": nv["apiKey"],
            "model": "meta/llama-3.1-70b-instruct",
        })
        voices.append({
            "label": "NVIDIA MiniMax",
            "base": nv.get("baseURL", "https://integrate.api.nvidia.com/v1"),
            "key": nv["apiKey"],
            "model": "minimaxai/minimax-m3",
        })
        # NOTE: moonshotai/kimi-k2.6 and mistralai/mistral-large-2-instruct are
        # listed in /v1/models but return 404 on this account ("Function not
        # found") — replaced with models verified callable (2026-08-16).

    return voices


# --------------------------------------------------------------------------
# 3. Calls
# --------------------------------------------------------------------------
def _chat(base, key, model, messages, timeout=75, max_tokens=600, temp=0.3, retries=2):
    body = json.dumps({
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temp,
    }).encode()
    last_err = None
    for attempt in range(retries + 1):
        if attempt:
            time.sleep(5 * attempt)  # exponential backoff on failure
        try:
            req = urllib.request.Request(
                base.rstrip("/") + "/chat/completions",
                data=body,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=timeout) as r:
                d = json.loads(r.read().decode())
            return d["choices"][0]["message"]["content"]
        except Exception as e:
            last_err = e
    if last_err is not None:
        raise last_err
    raise RuntimeError("request failed with no recorded error")


def ask_voice(voice, question):
    """Ask one voice one question. Returns answer text or None on failure."""
    try:
        return _chat(voice["base"], voice["key"], voice["model"],
                     [{"role": "user", "content": question}]).strip()
    except Exception as e:
        return f"__VOICE_FAILED__: {type(e).__name__}"


def judge(voice, pairs):
    """One judge pass over all (question, truth, answer) triples for this voice."""
    sys_prompt = (
        "You audit what AI models say about a product. For each item you are given the "
        "buyer question, the CANONICAL TRUTH about the product, and a MODEL ANSWER. "
        'Classify the model answer with kind: "contradiction" = the model AFFIRMATIVELY '
        'states something false or distorted about the product (wrong pricing or any '
        "specific price, wrong positioning e.g. calling it a WordPress plugin when it is "
        "a whole-business agent, claiming full autonomy when the customer approves "
        "everything, wrong official URLs, wrong free/paid story, misidentifying it as a "
        'different product entirely); "gap" = the model says it has no information / no '
        'such product exists / cannot recall it (a knowledge or brand-footprint gap, NOT '
        'a false claim); "refusal" = the model refuses to answer on policy grounds; '
        '"ok" = consistent with the truth. Minor wording differences that do not change '
        "meaning are NOT contradictions. Return ONLY a JSON array, one object per item, "
        'in the same order: [{"index":0,"kind":"contradiction","issue":"short reason",'
        '"quote":"exact misleading phrase from the model answer"}]'
    )
    user_payload = json.dumps([
        {"question": p["q"], "truth": p["truth"], "model_answer": a}
        for p, a in pairs
    ], ensure_ascii=False)
    try:
        out = _chat(voice["base"], voice["key"], voice["model"],
                    [{"role": "system", "content": sys_prompt},
                     {"role": "user", "content": user_payload}],
                    max_tokens=1200, temp=0.1)
        m = re.search(r"\[.*\]", out, re.S)
        if not m:
            return None
        return json.loads(m.group(0))
    except Exception:
        return None


# --------------------------------------------------------------------------
# 4. Deterministic flag layer
# --------------------------------------------------------------------------
def deterministic_flags(qitem, answer):
    hits = []
    for pattern, label in qitem["flags"]:
        for m in re.finditer(pattern, answer, re.I | re.S):
            frag = answer[max(0, m.start() - 45):m.end() + 45].replace("\n", " ")
            hits.append({"label": label, "context": frag.strip()})
    # URL validation for the signup question
    for m in re.finditer(r"https?://([^\s\"'\)]+)", answer):
        host = m.group(1).split("/")[0].lower()
        if host and "digitalhustlerx" in host:
            ok = any(host == d or host.endswith("." + d) for d in CANONICAL_DOMAINS
                     if "digitalhustlerx" in d)
            if not ok:
                hits.append({"label": "unexpected digitalhustlerx host: " + host,
                             "context": answer[max(0, m.start() - 45):m.end() + 45]})
    return hits


# --------------------------------------------------------------------------
# 5. Main
# --------------------------------------------------------------------------
def main():
    mode = "cron"
    if "--report" in sys.argv:
        mode = "report"
    if "--json" in sys.argv:
        mode = "json"

    voices = _read_key_sources()
    if not voices:
        print("NO WORKING VOICES CONFIGURED (no API keys found in opencode.json)")
        sys.exit(1)

    results = []          # per voice: {voice, answers[], flags[], judge_claims[]}
    voice_failures = []

    for voice in voices:
        answers = []
        for qi, qitem in enumerate(QUESTIONS):
            a = ask_voice(voice, qitem["q"])
            if a and not a.startswith("__VOICE_FAILED__"):
                answers.append(a)
            else:
                voice_failures.append((voice["label"], a if a else "no response"))
                answers.append("")
            time.sleep(1.0)  # pace calls to respect free-tier rate limits
        pairs = [(qitem, answers[i]) for i, qitem in enumerate(QUESTIONS)
                 if answers[i]]
        claims = judge(voice, pairs) if pairs else None

        det = []
        for i, qitem in enumerate(QUESTIONS):
            if answers[i]:
                for h in deterministic_flags(qitem, answers[i]):
                    det.append({"q": qitem["q"][:60], "label": h["label"], "context": h["context"]})

        results.append({
            "voice": voice["label"],
            "model": voice["model"],
            "answers": answers,
            "det_flags": det,
            "judge": claims,
        })

    # ---- compile findings ----
    findings = []      # hard contradictions → alert
    gaps = []          # brand-footprint gaps / refusals → compact summary
    seen_det = set()
    for r in results:
        v = r["voice"]
        for f in r["det_flags"]:
            dedupe_key = (v, f["label"], f["q"])
            if dedupe_key in seen_det:
                continue
            seen_det.add(dedupe_key)
            findings.append(f"❌ {v}: {f['label']} — \"{f['context'][:140]}\"")
        if r["judge"]:
            for j in r["judge"]:
                if not isinstance(j, dict):
                    continue
                kind = j.get("kind", "contradiction" if j.get("contradiction") else "ok")
                if kind == "contradiction":
                    findings.append(
                        f"⚠️ {v} (Q{int(j.get('index', 0)) + 1}): {j.get('issue', '')} — \"{j.get('quote', '')[:120]}\"")
                elif kind in ("gap", "refusal"):
                    gaps.append((v, kind, j.get("issue", "")))

    if mode == "json":
        print(json.dumps({
            "voices_ok": [r["voice"] for r in results],
            "voices_failed": voice_failures,
            "findings": findings,
            "gaps": [{"voice": g[0], "kind": g[1], "issue": g[2]} for g in gaps],
            "clean": not findings,
        }, ensure_ascii=False, indent=2))
        return

    if findings:
        print("🧿 GodsEye Wrong-Answer Agent — CONTRADICTIONS FOUND")
        for f in findings:
            print(f)
        print(f"\nVoices checked: {', '.join(r['voice'] for r in results)}")
        return

    # no contradictions: gap summary (always in report/verbose, compact in cron)
    if gaps:
        seen_v = set()
        lines = []
        for v, kind, issue in gaps:
            if v in seen_v:
                continue
            seen_v.add(v)
            lines.append(f"  • {v}: {kind} — {issue[:110]}")
        print("🧿 GodsEye brand footprint gaps (models don't know the product yet):")
        print("\n".join(lines))
        return

    if mode == "report":
        print("✅ ALL CLEAR — no model contradicts canonical GodsEye truth.")
        print(f"Voices checked ({len(results)}):")
        for r in results:
            print(f"  • {r['voice']} ({r['model']})")
        for i, qitem in enumerate(QUESTIONS):
            print(f"\n— Q{i+1}: {qitem['q']}")
            for r in results:
                if r["answers"][i]:
                    print(f"  [{r['voice']}] {r['answers'][i][:220]}")
    # cron mode: silent when clean
    if voice_failures:
        print(f"⚠️ Voice failures: {len(voice_failures)} — {'; '.join(f'{v}: {e[:60]}' for v, e in voice_failures)}")


if __name__ == "__main__":
    main()