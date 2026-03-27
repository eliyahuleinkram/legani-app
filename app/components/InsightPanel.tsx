"use client";

import { X, Bookmark, BookmarkCheck, Share, MoreVertical } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";

interface InsightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verseId: string;
  verseTextHebrew: string;
  verseTextEnglish: string;
  dividerImageUrl?: string;
}

export function InsightPanel({ isOpen, onClose, verseId, verseTextHebrew, verseTextEnglish, dividerImageUrl }: InsightPanelProps) {
  const [nusach, setNusach] = useState("");
  const [chassidus, setChassidus] = useState("");
  const [language, setLanguage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNusach(localStorage.getItem("legani_nusach") || "General");
    setChassidus(localStorage.getItem("legani_chassidus") || "None");
    setLanguage(localStorage.getItem("legani_language") || "English");
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (isOpen && verseId && !hasStarted) {
      setHasStarted(true);
      
      const loadInsight = async () => {
        setIsLoading(true);
        try {
          const snapshotId = searchParams.get("snapshot");
          if (snapshotId) {
            const res = await fetch(`/api/snapshots?id=${snapshotId}`);
            if (res.ok) {
              const data = await res.json();
              setMessages([{ role: 'assistant', content: data.content }]);
              setIsLoading(false);
              return;
            }
          }

          const cacheKey = `legani_insight_${verseId}_${chassidus}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setMessages([{ role: 'assistant', content: cached }]);
            setIsLoading(false);
            return;
          }

          await generateFreshInsight();
        } catch (e) {
          console.error(e);
          setIsLoading(false);
        }
      };
      
      loadInsight();
    }
  }, [isOpen, verseId, verseTextHebrew, verseTextEnglish, hasStarted, nusach, chassidus, language, searchParams]);

  const generateFreshInsight = async () => {
    setIsLoading(true);
    setMessages([]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { nusach, chassidus, language, verse: verseTextEnglish },
          messages: [{ role: 'user', content: `I am meditating on this verse: "${verseTextHebrew}" - "${verseTextEnglish}". Teach me its deeper meaning according to my lens.` }]
        })
      });
      
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";
      
      setMessages([{ role: 'assistant', content: "" }]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setMessages([{ role: 'assistant', content: text }]);
        }
      }
      
      // Cache completed stream
      localStorage.setItem(`legani_insight_${verseId}_${chassidus}`, text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setIsBookmarked(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/bookmarks").then(res => res.json()).then(bms => {
        setIsBookmarked(bms.some((b: any) => b.id === verseId));
      }).catch(console.error);
    }
  }, [isOpen, verseId]);

  const toggleBookmark = async () => {
    if (isBookmarked) {
      setIsBookmarked(false);
      try {
        await fetch(`/api/bookmarks?id=${verseId}`, { method: 'DELETE' });
      } catch (e) { console.error(e); }
    } else {
      setIsBookmarked(true);
      try {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: verseId, hebrew: verseTextHebrew, english: verseTextEnglish })
        });
      } catch (e) { console.error(e); }
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleShare = async () => {
    try {
      const content = messages.find((m: any) => m.role === 'assistant')?.content;
      if (!content) return;
      
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, verseId })
      });
      const data = await res.json();
      
      const url = `${window.location.origin}${window.location.pathname}?v=${verseId}&snapshot=${data.id}`;
      const text = `"${verseTextEnglish}"\n\nExperience this meditation in Legani:`;
      
      if (navigator.share) {
        await navigator.share({ title: "Legani | Pen of the Heart", text, url });
      } else {
        navigator.clipboard.writeText(`${text} ${url}`);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      console.log("Share skipped", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay animate-fade-in" onClick={onClose} />
      <div className="panel animate-slide-up">
        <header className="panel-header">
          <div className="header-actions">
            <div className="header-left">
              <button onClick={onClose} className="icon-btn" aria-label="Close insight panel">
                <X size={20} strokeWidth={1} />
              </button>
            </div>
            <p className="lens-indicator">
              {chassidus !== "None" ? chassidus : "Wisdom"}
            </p>
            <div className="right-actions" style={{ position: 'relative' }}>
              <button 
                onClick={toggleBookmark} 
                className="icon-btn" 
                aria-label="Bookmark this insight"
              >
                {isBookmarked ? <BookmarkCheck size={20} strokeWidth={1} color="var(--text-primary)" /> : <Bookmark size={20} strokeWidth={1} />}
              </button>
              <button 
                onClick={handleMenuClick} 
                className="icon-btn" 
                aria-label="More options"
              >
                <MoreVertical size={20} strokeWidth={1} />
              </button>

              {showMenu && (
                <div className="dropdown-menu animate-fade-in">
                  <button onClick={() => { handleShare(); setShowMenu(false); }} className="dropdown-item">
                    <Share size={16} strokeWidth={1.5} />
                    <span>Share Snapshot</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="chat-content" ref={scrollRef}>
          <div className="verse-context">
            <p className="hebrew-text">{verseTextHebrew}</p>
            <p className="english-text">"{verseTextEnglish}"</p>
            {dividerImageUrl ? (
              <div className="insight-image-divider">
                <img src={dividerImageUrl} alt="divider" />
              </div>
            ) : (
              <div className="insight-divider">
                <span>✧</span>
              </div>
            )}
          </div>

          <div className="messages">
            {messages.filter((m: any) => m.role === 'assistant').map((m: any, idx: number) => (
              <div key={idx} className="insight-message">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ))}
            {isLoading && (!messages.length || messages[0].content === "") && (
              <div className="skeleton-wrapper animate-fade-in">
                <div className="skeleton-line w-full" style={{ animationDelay: '0ms' }}></div>
                <div className="skeleton-line w-11-12" style={{ animationDelay: '150ms' }}></div>
                <div className="skeleton-line w-4-5" style={{ animationDelay: '300ms' }}></div>
                <div className="skeleton-line w-full mt-4" style={{ animationDelay: '450ms' }}></div>
                <div className="skeleton-line w-3-4" style={{ animationDelay: '600ms' }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 100;
        }
        
        .panel {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) translateY(100%);
          width: 100%;
          height: 90vh;
          max-width: 800px;
          border-top-left-radius: 2rem;
          border-top-right-radius: 2rem;
          z-index: 101;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-primary);
          box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border-light);
          border-bottom: none;
        }
        
        .animate-slide-up {
          animation: slideUp var(--transition-normal) forwards;
        }
        
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        .panel-header {
          padding: 2rem 2.5rem 1rem;
        }
        
        .header-actions {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }

        .header-left {
          justify-self: start;
        }

        .right-actions {
          display: flex;
          align-items: center;
          justify-self: end;
          gap: 0.5rem;
        }
        
        .icon-btn {
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 50%;
        }
        
        .icon-btn:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 180px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 0.85rem;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color var(--transition-fast);
        }

        .dropdown-item:hover {
          background-color: var(--bg-secondary);
        }
        
        .lens-indicator {
          font-weight: 200;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          text-align: center;
        }
        
        .chat-content {
          padding: 2rem 4rem 6rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .verse-context {
          margin-bottom: 3.5rem;
          text-align: center;
          position: relative;
        }
        
        .insight-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85%;
          margin: 3rem auto 0;
          opacity: 0.5;
        }

        .insight-divider::before,
        .insight-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--text-tertiary) 80%);
        }

        .insight-divider::after {
          background: linear-gradient(270deg, transparent, var(--text-tertiary) 80%);
        }

        .insight-divider span {
          margin: 0 1.5rem;
          color: var(--text-tertiary);
          font-size: 0.85rem;
        }
        
        .insight-image-divider {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 3rem auto 0;
          opacity: 0.6;
        }

        .insight-image-divider img {
          width: 90%;
          max-width: 400px;
          height: auto;
          aspect-ratio: 4.5 / 1;
          object-fit: cover;
          object-position: center;
        }
        
        .hebrew-text {
          color: var(--text-primary);
          font-family: var(--font-hebrew);
          font-size: var(--text-hebrew-lg);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .english-text {
          font-size: 1.15rem;
          color: var(--text-secondary);
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.015em;
          max-width: 80%;
          margin: 0 auto;
        }
        
        .messages {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .insight-message {
          font-size: 1.15rem;
          line-height: 2;
          color: var(--text-primary);
          font-weight: 300;
          letter-spacing: 0.01em;
        }
        
        .insight-message :global(p) {
          margin-bottom: 1.5rem;
        }
        
        .insight-message :global(p:last-child) {
          margin-bottom: 0;
        }
        
        .insight-message :global(strong) {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .insight-message :global(em) {
          font-style: italic;
          color: var(--text-secondary);
        }
        
        .skeleton-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
          width: 100%;
        }
        
        .skeleton-line {
          height: 1.15rem;
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.06) 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: skeleton-pulse 1.5s infinite linear;
          opacity: 0.9;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
        }
        
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .w-full { width: 100%; }
        .w-11-12 { width: 92%; }
        .w-4-5 { width: 80%; }
        .w-3-4 { width: 75%; }
        .mt-4 { margin-top: 1.5rem; }

        @media (max-width: 768px) {
          .panel {
            height: 95vh;
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
          }
          .chat-content {
            padding: 1.5rem 2rem 4rem;
          }
          .english-text {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
