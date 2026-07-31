import { Link } from "react-router-dom";
import { Download, Terminal } from "lucide-react";

export default function DocsPage() {
  const installSteps = [
    { num: "01", title: "Upload Plugin", body: "Plugins > Add New, upload the ZIP." },
    { num: "02", title: "Activate", body: "Click Activate Plugin." },
    { num: "03", title: "Generate App Password", body: 'Users > Profile > Application Passwords > enter "GodsEye Agent" > Generate.' },
    { num: "04", title: "Open Telegram", body: "Search @GodseyeXbot, tap Start." },
    { num: "05", title: "Connect", body: "Send /connect, paste your site URL, username, and Application Password." },
    { num: "06", title: "Start Managing", body: 'Try "Check site health" or "Show latest orders".' },
  ];

  const commandGroups = [
    {
      category: "Content",
      commands: [
        "Write a blog post about [topic]",
        "Publish my latest draft",
        "Show all draft posts",
      ],
    },
    {
      category: "Store",
      commands: [
        "Show todays orders",
        "Update product price for [name] to $X",
        "Create a 20% off coupon",
      ],
    },
    {
      category: "Security",
      commands: [
        "Check site health",
        "List active plugins",
        "Any broken pages?",
      ],
    },
    {
      category: "Media",
      commands: [
        "Upload this image",
        "Show my media library",
      ],
    },
  ];

  const mcpConfig = `// claude_desktop_config.json
{
  "mcpServers": {
    "godseye-wordpress": {
      "command": "node",
      "args": ["/path/to/godseye-mcp.js", "--url", "https://mysite.com", "--user", "admin", "--pass", "xxxx-xxxx"]
    }
  }
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-20">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#C4A484]/30 rounded-full text-[10px] uppercase tracking-widest text-[#C4A484] font-medium font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4A484] animate-pulse"></span>
            Documentation
          </div>
        </div>
        <h1
          className="text-4xl md:text-6xl font-light tracking-tighter text-[#F2F2F2] leading-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Guides &amp; <span className="italic text-[#C4A484]">References.</span>
        </h1>
        <p className="text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
          Everything you need to get the most out of GodsEye.
        </p>
      </div>

      {/* INSTALLATION GUIDE */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-[#C4A484]" />
          <h2 className="text-2xl md:text-3xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Installation Guide
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {installSteps.map((step) => (
            <div
              key={step.num}
              className="bg-[#121212] border border-white/10 rounded-2xl p-5 md:p-6 flex gap-4"
            >
              <span className="text-[10px] uppercase tracking-widest text-[#C4A484] font-mono shrink-0 mt-1">
                {step.num}
              </span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-[#F2F2F2]">{step.title}</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMANDS REFERENCE */}
      <section className="space-y-8">
        <h2 className="text-2xl md:text-3xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
          Commands You Can Use
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {commandGroups.map((group) => (
            <div
              key={group.category}
              className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-[10px] uppercase tracking-widest text-[#C4A484] font-bold font-mono">
                {group.category}
              </h3>
              <div className="space-y-2.5">
                {group.commands.map((cmd) => (
                  <div
                    key={cmd}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-[#C4A484]"
                  >
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MCP SETUP */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#C4A484]" />
          <h2 className="text-2xl md:text-3xl font-light text-[#F2F2F2]" style={{ fontFamily: "'Georgia', serif" }}>
            Model Context Protocol (MCP)
          </h2>
        </div>
        <p className="text-sm text-white/70 font-light leading-relaxed max-w-3xl">
          For developers and power-users, GodsEye turns your WordPress site into
          an MCP Server. Connect it directly to Claude Desktop, Cursor, or
          ChatGPT.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-2xl p-5 md:p-6 overflow-x-auto text-[12px] leading-relaxed font-mono text-[#C4A484]">
          <code>{mcpConfig}</code>
        </pre>
      </section>

      {/* CTA */}
      <div className="text-center space-y-4 border-t border-white/5 pt-12">
        <p className="text-sm text-white/50 font-light">Ready to start?</p>
        <Link
          to="/start"
          className="inline-flex items-center gap-2 bg-[#C4A484] hover:bg-[#b59574] text-black font-bold px-6 py-3 rounded-full text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}
