import { useEffect, useState } from "react";
import { Github, Loader2, AlertTriangle } from "lucide-react";

// Data-driven GitHub contributions widget.
//
// Renders the account's REAL contribution grid/history. The data comes from the
// server-side proxy at `/api/github/contributions` (see `server.ts`), which
// queries the GitHub GraphQL API with a fine-grained token that never reaches
// the browser. Matching the rest of the SPA, it uses the dark + gold design
// tokens (#121212 surfaces, white/10 borders, #C4A484 accents).

type ContributionDay = { date: string; count: number; level: number };
type ResponseData = {
  username: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
  totalContributions: number;
  weeks: ContributionDay[][];
};

interface GitHubContributionsProps {
  username?: string;
}

// GitHub level -> cell color. Keep it in the repo's visual language:
// dark base with gold scale, up to the bright gold accent.
const LEVEL_COLORS = [
  "bg-white/[0.06]", // 0  — no contributions
  "bg-[#C4A484]/25", // 1
  "bg-[#C4A484]/45", // 2
  "bg-[#C4A484]/70", // 3
  "bg-[#C4A484]", // 4  — peak
];

const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];

const monthName = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short" });

export default function GitHubContributions({ username }: GitHubContributionsProps) {
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const qs = username ? `?username=${encodeURIComponent(username)}` : "";
    fetch(`/api/github/contributions${qs}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body as ResponseData;
      })
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  const maxCount = Math.max(
    1,
    ...(data?.weeks.flat().map((d) => d.count) ?? [0])
  );

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C4A484]/10 border border-[#C4A484]/20 flex items-center justify-center">
            {data?.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Github className="w-4 h-4 text-[#C4A484]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F2F2F2] leading-tight">
              GitHub Contributions
            </h3>
            {data && (
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#C4A484]/80 hover:text-[#d9c4af] font-mono transition-colors"
              >
                @{data.username}
              </a>
            )}
          </div>
        </div>
        {data && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            {data.totalContributions} contributions
          </span>
        )}
      </div>

      {/* Body */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-14 text-white/50">
          <Loader2 className="w-5 h-5 text-[#C4A484] animate-spin" />
          <span className="text-xs font-light">Loading contribution graph…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-3 py-10 px-4 rounded-lg bg-white/[0.02] border border-white/5">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white/80 mb-1">
              Couldn't load GitHub contributions
            </p>
            <p className="text-[11px] text-white/50 font-light font-mono">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          {/* Grid */}
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex gap-1">
              {/* Weekday row */}
              <div className="flex flex-col justify-between pr-1 py-0.5 text-[9px] font-mono text-white/30">
                {WEEKDAY_LABELS.map((l) => (
                  <span key={l} className="h-2.5 leading-none">
                    {l}
                  </span>
                ))}
              </div>
              <div className="flex gap-[3px]">
                {data.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px] py-0.5">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                        className={`w-2.5 h-2.5 rounded-[3px] ${LEVEL_COLORS[Math.min(day.level, 4)]} transition-colors hover:ring-1 hover:ring-[#C4A484]`}
                      />
                    ))}
                    {week.length < 7 &&
                      Array.from({ length: 7 - week.length }).map((_, i) => (
                        <div key={`pad-${i}`} className="w-2.5 h-2.5" />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-white/40 font-mono">
              {maxCount} in a day · last {data.weeks.length} weeks
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-white/30 font-mono mr-1">Less</span>
              {LEVEL_COLORS.map((c, i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-[3px] ${c}`} />
              ))}
              <span className="text-[9px] text-white/30 font-mono ml-1">More</span>
            </div>
          </div>

          {/* Month labels */}
          <div className="mt-2 text-[9px] font-mono text-white/30 flex">
            {data.weeks.map((week, wi) => {
              const first = week[0];
              if (!first) return null;
              const show = wi === 0 || monthName(first.date) !== monthName(data.weeks[wi - 1][0]?.date ?? "");
              return show ? (
                <span key={wi} className="mr-[3px]">
                  {monthName(first.date)}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
