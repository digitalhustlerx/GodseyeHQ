import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { MockWPState, PlaygroundMessage, WordPressPost, WordPressPlugin } from "../types";
import { SAMPLE_COMMANDS } from "../mockData";
import { Send, User, Sparkles, MessageSquare } from "lucide-react";

interface LivePlaygroundProps {
  wpState: MockWPState;
  setWpState: Dispatch<SetStateAction<MockWPState>>;
  setLastActionType: (val: string | null) => void;
}

export default function LivePlayground({
  wpState,
  setWpState,
  setLastActionType
}: LivePlaygroundProps) {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([
    {
      id: "init",
      sender: "agent",
      text: "👁️ Welcome to GodsEye! I am your WordPress AI Agent. Let's manage your site together.\n\nType a command below or tap any of the quick-action cards to see me in action!",
      timestamp: "05:14 AM"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendCommand = async (commandText: string) => {
    if (!commandText.trim() || isTyping) return;

    const userMsgId = `user_${Date.now()}`;
    const userMessage: PlaygroundMessage = {
      id: userMsgId,
      sender: "user",
      text: commandText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with agent");
      }

      const data = await response.json();
      setIsTyping(false);

      // Add Bot Message
      const botMsgId = `bot_${Date.now()}`;
      const botMessage: PlaygroundMessage = {
        id: botMsgId,
        sender: "agent",
        text: data.telegramResponse || "👁️ Command received and processed successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);

      // Apply updates to the mock state based on the structured action
      if (data.wordpressAction) {
        const action = data.wordpressAction;
        const type = action.type;
        setLastActionType(type);

        if (type === "CREATE_POST") {
          const newPost: WordPressPost = {
            id: Math.floor(Math.random() * 1000) + 10,
            title: action.title || "New Draft Post",
            status: "draft",
            author: "GodsEye AI"
          };
          setWpState(prev => ({
            ...prev,
            posts: [newPost, ...prev.posts]
          }));
        } else if (type === "ACTIVATE_PLUGIN" || type === "DEACTIVATE_PLUGIN") {
          const pluginName = action.title || "Yoast SEO";
          setWpState(prev => {
            const updatedPlugins = prev.plugins.map(plugin => {
              if (plugin.name.toLowerCase().includes(pluginName.toLowerCase()) || plugin.slug.toLowerCase().includes(pluginName.toLowerCase())) {
                return { ...plugin, active: type === "ACTIVATE_PLUGIN" };
              }
              return plugin;
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
        } else if (type === "ELEMENTOR_EDIT") {
          const newPrice = action.title?.includes("$") ? action.title : `$${action.title || "599"}`;
          setWpState(prev => ({
            ...prev,
            elementorHeroPrice: newPrice
          }));
        } else if (type === "WOOCOMMERCE_ORDER") {
          // Just flash / highlight existing order, or append a mock order
          const randomOrder = {
            id: Math.floor(Math.random() * 9000) + 1000,
            customer: action.title || "Alice Roberts",
            total: "$59.90",
            status: "completed" as const
          };
          setWpState(prev => ({
            ...prev,
            orders: [randomOrder, ...prev.orders]
          }));
        } else if (type === "MEDIA_UPLOAD") {
          const newMedia = {
            id: Math.floor(Math.random() * 1000) + 200,
            filename: action.title || "uploaded-image.png",
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
            uploadedAt: "Just now"
          };
          setWpState(prev => ({
            ...prev,
            media: [newMedia, ...prev.media]
          }));
        } else if (type === "SITE_HEALTH") {
          // Boost score randomly as optimization
          setWpState(prev => ({
            ...prev,
            siteHealth: {
              ...prev.siteHealth,
              securityScore: Math.min(100, prev.siteHealth.securityScore + 2)
            }
          }));
        }
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "agent",
          text: "⚠️ Sorry, there was an issue processing that command through the OpenClaw gateway. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Bot Chat Header */}
      <div className="bg-[#080808] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-display text-lg shadow-inner">
            👁️
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              GodsEye AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-[#C4A484]" />
            </h3>
            <span className="text-[10px] text-green-400 font-medium">agent • online</span>
          </div>
        </div>
        <div className="text-[10px] text-white/40 font-mono">
          AI Assistant
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none bg-[#121212]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${msg.sender === "user" ? "bg-white/10 text-white rounded-br-none border border-white/5" : "bg-[#161616] text-[#F2F2F2] rounded-bl-none border border-white/5"}`}>
              <div className="whitespace-pre-line leading-relaxed font-light">{msg.text}</div>
              <div className="text-[9px] text-right mt-1.5 font-mono text-white/40">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#161616] text-white/50 rounded-2xl rounded-bl-none px-4 py-3 text-xs border border-white/5 flex items-center gap-2">
              <span>GodsEye is thinking</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Cards */}
      <div className="px-4 py-2.5 bg-[#080808] border-t border-white/10 overflow-x-auto whitespace-nowrap flex gap-2 select-none">
        {SAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleSendCommand(cmd)}
            disabled={isTyping}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[10px] text-white/80 px-3.5 py-2 rounded-full border border-white/10 hover:border-[#C4A484]/40 transition-all cursor-pointer font-medium disabled:opacity-40"
          >
            <MessageSquare className="w-3 h-3 text-[#C4A484]" />
            {cmd}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendCommand(inputValue);
        }}
        className="p-3 bg-[#080808] border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isTyping ? "Please wait..." : "Write a plain English WP command..."}
          disabled={isTyping}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C4A484]/40 transition-colors disabled:opacity-50 font-light"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="w-10 h-10 rounded-full bg-[#C4A484] hover:bg-[#b59574] active:scale-95 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
