import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { MockWPState, ActiveView } from "../types";
import { 
  LayoutDashboard, 
  FileText, 
  Blocks, 
  ShoppingBag, 
  HeartPulse, 
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Lock,
  Globe,
  X,
  Eye,
  ArrowUpRight
} from "lucide-react";

interface WordPressDashboardProps {
  wpState: MockWPState;
  setWpState: Dispatch<SetStateAction<MockWPState>>;
  lastActionType: string | null;
  setLastActionType: (val: string | null) => void;
}

export default function WordPressDashboard({
  wpState,
  setWpState,
  lastActionType,
  setLastActionType
}: WordPressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'plugins' | 'orders' | 'health' | 'media'>('dashboard');
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState<any | null>(null);

  // Automatically switch tab based on the action executed in the playground!
  useEffect(() => {
    if (!lastActionType) return;

    if (lastActionType.includes("POST")) {
      setActiveTab("posts");
      setHighlightedItem("post-new");
    } else if (lastActionType.includes("PLUGIN")) {
      setActiveTab("plugins");
      setHighlightedItem("plugin-toggle");
    } else if (lastActionType.includes("ORDER") || lastActionType.includes("WOOCOMMERCE")) {
      setActiveTab("orders");
      setHighlightedItem("order-list");
    } else if (lastActionType.includes("HEALTH") || lastActionType.includes("SITE_HEALTH")) {
      setActiveTab("health");
      setHighlightedItem("health-box");
    } else if (lastActionType.includes("EDIT") || lastActionType.includes("ELEMENTOR")) {
      setActiveTab("dashboard");
      setHighlightedItem("elementor-price");
    } else if (lastActionType.includes("MEDIA")) {
      setActiveTab("media");
      setHighlightedItem("media-new");
    }

    const timer = setTimeout(() => {
      setHighlightedItem(null);
      setLastActionType(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [lastActionType, setLastActionType]);

  const togglePluginLocal = (slug: string) => {
    setWpState(prev => {
      const updatedPlugins = prev.plugins.map(p => {
        if (p.slug === slug) {
          const newState = !p.active;
          return { ...p, active: newState };
        }
        return p;
      });
      const activeCount = updatedPlugins.filter(p => p.active).length;
      return {
        ...prev,
        plugins: updatedPlugins,
        siteHealth: {
          ...prev.siteHealth,
          activePlugins: activeCount
        }
      };
    });
  };

  return (
    <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Top Bar */}
      <div className="bg-[#080808] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C4A484]" />
          <span className="text-xs font-mono text-white/50">mysite.com/wp-admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-medium text-white/80">Connected to GodsEye</span>
          </div>
          <span className="text-xs text-white/50 font-medium">admin</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left menu column */}
        <div className="w-36 bg-[#0B0B0B] border-r border-white/10 flex flex-col py-3 select-none">
          <button 
            id="nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'dashboard' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button 
            id="nav-posts"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'posts' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Posts & Pages
          </button>
          <button 
            id="nav-plugins"
            onClick={() => setActiveTab('plugins')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'plugins' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <Blocks className="w-3.5 h-3.5" />
            Plugins
          </button>
          <button 
            id="nav-orders"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'orders' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            WooCommerce
          </button>
          <button 
            id="nav-health"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'health' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Site Health
          </button>
          <button 
            id="nav-media"
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${activeTab === 'media' ? 'text-[#C4A484] bg-white/5 border-l-2 border-[#C4A484] font-semibold' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Media
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-[#121212] p-4 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Site Performance & Elementor Blocks</h3>
                <span className="text-[10px] font-mono text-white/40">At a Glance</span>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-white/40 text-[10px] uppercase tracking-wider">Total Pages / Posts</div>
                  <div className="text-xl font-bold text-[#C4A484] mt-1">{wpState.posts.length}</div>
                </div>
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-white/40 text-[10px] uppercase tracking-wider">Active Plugins</div>
                  <div className="text-xl font-bold text-green-400 mt-1">{wpState.siteHealth.activePlugins} / {wpState.plugins.length}</div>
                </div>
              </div>

              {/* Elementor Price box */}
              <div className={`p-4 rounded-lg border transition-all duration-500 ${highlightedItem === 'elementor-price' ? 'bg-white/5 border-[#C4A484] shadow-lg scale-[1.02]' : 'bg-[#161616] border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C4A484]"></span>
                    <span className="text-xs font-semibold text-white/80">Elementor: Hero Pricing Block</span>
                  </div>
                  <span className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/10 font-mono">Live Widget</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-white/40">Dynamic Product Subscription Price</p>
                    <div className="text-2xl font-black text-[#F2F2F2] tracking-tight mt-1">{wpState.elementorHeroPrice}</div>
                  </div>
                  {highlightedItem === 'elementor-price' && (
                    <span className="text-[11px] text-green-400 font-medium animate-pulse">Updated via GodsEye!</span>
                  )}
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-[#161616] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400 font-mono text-xs font-bold">
                    {wpState.siteHealth.securityScore}%
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white/80">Site Security Audit</h4>
                    <p className="text-[10px] text-white/40">Application passwords and API firewalls configured.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Posts & Pages</h3>
                  <p className="text-[10px] text-white/50">Click any post to see its public live visual preview</p>
                </div>
                <span className="text-[10px] font-mono text-white/40">WP REST API</span>
              </div>

              <div className="space-y-2">
                {wpState.posts.map((post, i) => {
                  const isNew = i === 0 && highlightedItem === 'post-new';
                  return (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedPostForPreview(post)}
                      className={`p-3 rounded-lg border transition-all duration-300 hover:border-[#C4A484]/50 cursor-pointer group relative ${isNew ? 'bg-green-500/10 border-green-500 scale-[1.01]' : 'bg-[#161616] border-white/5'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white tracking-tight group-hover:text-[#C4A484] transition-colors">{post.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${post.status === 'publish' ? 'bg-green-950 text-green-400 border border-green-900/30' : 'bg-yellow-950 text-yellow-400 border border-yellow-900/30'}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] text-white/40 font-mono">
                        <span>ID: #{post.id}</span>
                        <span className="flex items-center gap-1 text-[#C4A484]/70 group-hover:text-[#C4A484] transition-colors">
                          <Eye className="w-3 h-3" /> Preview Page
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'plugins' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Installed Plugins</h3>
                <span className="text-[10px] font-mono text-white/40">Total: {wpState.plugins.length}</span>
              </div>

              <div className="space-y-2">
                {wpState.plugins.map((plugin) => (
                  <div key={plugin.slug} className="p-3 bg-[#161616] border border-white/5 rounded-lg flex items-center justify-between transition-all">
                    <div>
                      <div className="text-xs font-semibold text-white">{plugin.name}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">Version: {plugin.version}</div>
                    </div>
                    <button
                      onClick={() => togglePluginLocal(plugin.slug)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${plugin.active ? 'bg-[#C4A484]' : 'bg-white/10'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${plugin.active ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">WooCommerce Latest Orders</h3>
                <span className="text-[10px] text-[#C4A484] font-mono">v8.4 API Live</span>
              </div>

              <div className="space-y-2">
                {wpState.orders.map((order, i) => {
                  const isMatch = highlightedItem === 'order-list' && i === 0;
                  return (
                    <div 
                      key={order.id} 
                      className={`p-3 rounded-lg border transition-all duration-500 ${isMatch ? 'bg-[#C4A484]/10 border-[#C4A484] scale-[1.01]' : 'bg-[#161616] border-white/5'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Order #{order.id} — {order.customer}</span>
                        <span className="text-xs font-bold text-white/80">{order.total}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] font-mono">
                        <span className="text-white/40">Payment: Credit Card</span>
                        <span className={`px-1.5 py-0.5 rounded-sm font-medium ${order.status === 'completed' ? 'bg-green-950 text-green-300' : order.status === 'processing' ? 'bg-blue-950 text-blue-300' : 'bg-yellow-950 text-yellow-300'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Site Health Overview</h3>
                <span className="text-[10px] font-mono text-white/40">System State</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">WordPress Core</div>
                  <div className="text-sm font-semibold text-white mt-1">v{wpState.siteHealth.wpVersion}</div>
                </div>
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">PHP Version</div>
                  <div className="text-sm font-semibold text-white mt-1">{wpState.siteHealth.phpVersion}</div>
                </div>
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">SSL Certificate</div>
                  <div className="text-xs font-semibold text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Secure HTTPS
                  </div>
                </div>
                <div className="bg-[#161616] p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-white/40 uppercase">OpenClaw Gateway</div>
                  <div className="text-xs font-semibold text-[#C4A484] mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Port 18790 Live
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-950/20 border border-yellow-900/30 rounded-lg flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-yellow-400">2 Inactive Plugins Detected</h4>
                  <p className="text-[10px] text-white/70 mt-0.5">Classic Editor and Yoast SEO can be activated instantly via agent conversation.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90">Media Library</h3>
                <span className="text-[10px] font-mono text-white/40">Total uploads: {wpState.media.length}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {wpState.media.map((file, i) => {
                  const isNew = i === 0 && highlightedItem === 'media-new';
                  return (
                    <div 
                      key={file.id} 
                      className={`relative group rounded-lg overflow-hidden border aspect-video transition-all duration-500 ${isNew ? 'border-green-500 shadow-md ring-1 ring-green-500' : 'border-white/5'}`}
                    >
                      <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-100 p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-semibold text-white truncate">{file.filename}</span>
                        <span className="text-[8px] text-white/40 font-mono">{file.uploadedAt}</span>
                      </div>
                      {isNew && (
                        <div className="absolute top-1 right-1 bg-green-500 text-black font-semibold text-[8px] px-1 rounded animate-bounce">
                          NEW
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal Overlay inside the Dashboard Frame */}
      {selectedPostForPreview && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col animate-fadeIn">
          {/* Mock Browser Header */}
          <div className="bg-[#0D0D0D] border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
              <span className="text-[11px] font-mono text-white/50 ml-2 bg-white/5 px-3 py-1 rounded border border-white/5">
                mysite.com/blog/{selectedPostForPreview.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              </span>
            </div>
            <button 
              onClick={() => setSelectedPostForPreview(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Webpage Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            <div className="max-w-xl mx-auto space-y-6">
              {/* Breadcrumb & status indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#C4A484] uppercase">
                <span>Solopreneur Launch Series</span>
                <span className={`px-2 py-0.5 rounded font-bold ${selectedPostForPreview.status === 'publish' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {selectedPostForPreview.status === 'publish' ? '● Public Live' : '○ Draft Saved'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl font-light tracking-tight text-[#F2F2F2] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                {selectedPostForPreview.title}
              </h1>

              {/* Author & date metadata */}
              <div className="flex items-center gap-3 text-xs text-white/40 border-y border-white/5 py-3">
                <div className="w-6 h-6 rounded-full bg-[#C4A484]/10 border border-[#C4A484]/20 flex items-center justify-center text-[10px] text-[#C4A484]">
                  👤
                </div>
                <div>
                  <span className="font-medium text-white/70">Authored by {selectedPostForPreview.author}</span>
                  <span className="mx-2">&bull;</span>
                  <span>July 2026</span>
                </div>
              </div>

              {/* Simulated Rich Content blocks */}
              <div className="text-xs text-white/70 leading-relaxed space-y-4 font-light">
                <p>
                  As an independent creator, optimization isn't an optional task—it's your ultimate operational edge. Setting up custom channels, robust automated funnels, and optimized metadata is what allows you to scale cleanly without manual drag.
                </p>
                
                <blockquote className="border-l-2 border-[#C4A484] pl-4 italic text-white/90 my-4">
                  "If you spent more than three minutes organizing this publication manually in your core dashboards, you're losing valuable hours that should be spent on building."
                </blockquote>

                <p>
                  GodsEye drafts content, generates metadata, and validates configurations in seconds—allowing you to publish directly without typing a single line of dashboard configuration.
                </p>

                <p className="font-mono text-[10px] text-[#C4A484] pt-2">
                  &bull; AI Readiness Score: 98% &bull; Search Index Configured
                </p>
              </div>

              {/* CTA section */}
              <div className="bg-[#C4A484]/5 border border-[#C4A484]/20 rounded-xl p-4 mt-8 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Need updates on this?</h4>
                  <p className="text-[10px] text-white/50">Simply type "update the content on {selectedPostForPreview.title}" in Telegram!</p>
                </div>
                <button 
                  onClick={() => setSelectedPostForPreview(null)}
                  className="bg-[#C4A484] hover:bg-[#b59574] text-black font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
