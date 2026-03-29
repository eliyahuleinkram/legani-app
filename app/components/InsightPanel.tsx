"use client";

import { X, Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState, useRef, Suspense } from "react";
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

function InsightPanelContent({ isOpen, onClose, verseId, verseTextHebrew, verseTextEnglish, dividerImageUrl }: InsightPanelProps) {
  const [nusach, setNusach] = useState("");
  const [chassidus, setChassidus] = useState("");
  const [language, setLanguage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  
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

          const cacheKey = `legani_insight_v4_${verseId}_${chassidus}`;
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
    setMessages([{ role: 'assistant', content: "" }]);

    const generationId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
    
    let isPolling = true;

    try {
      // 1. Kick off generation via POST (non-blocking for UI polling)
      const chatPromise = fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId,
          data: { nusach, chassidus, language, verse: verseTextEnglish },
          messages: [{ role: 'user', content: `I am meditating on this verse: "${verseTextHebrew}" - "${verseTextEnglish}". Teach me its deeper meaning according to my lens.` }]
        })
      });

      // 2. Poll DynamoDB FAST to simulate native streaming speed
      const pollLoop = async () => {
        let currentText = "";
        while (isPolling) {
          await new Promise(r => setTimeout(r, 250)); // Poll every 250ms
          try {
            const res = await fetch(`/api/generations?id=${generationId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.content && data.content.length > currentText.length) {
                currentText = data.content;
                setMessages([{ role: 'assistant', content: currentText }]);
              }
              if (data.status === "completed" || data.status === "error") {
                isPolling = false;
                if (data.status === "error" && !currentText) {
                    setMessages([{ role: 'assistant', content: "An error occurred. Please try again later." }]);
                } else if (currentText) {
                  localStorage.setItem(`legani_insight_v4_${verseId}_${chassidus}`, currentText);
                }
                setIsLoading(false);
                break;
              }
            }
          } catch (e) {
            console.error("Polling error:", e);
          }
        }
      };

      pollLoop();

      // Ensure main request finishes
      const chatRes = await chatPromise;
      if (!chatRes.ok) {
        throw new Error("Chat request failed");
      }
    } catch (e) {
      console.error("Chat initiation error:", e);
      isPolling = false;
      setMessages([{ role: 'assistant', content: "An error occurred fetching the insight." }]);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (!isOpen) {
      setHasStarted(false);
      setIsBookmarked(false);
      setDragY(0);
      setHasDragged(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.contains(e.target as Node)) {
      if (scrollRef.current.scrollTop > 0) return;
    }
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setHasDragged(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    setDragY(deltaY > 0 ? deltaY : Math.max(deltaY * 0.2, -20));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (touchStartY === null) return;
    
    if (dragY > 100) {
      onClose();
      setTimeout(() => setDragY(0), 300);
    } else {
      setDragY(0);
    }
    setTouchStartY(null);
  };

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


  if (!isOpen) return null;

  return (
    <>
      <div className="overlay animate-fade-in" onClick={onClose} />
      <div 
        className={`panel ${!hasDragged ? 'animate-slide-up' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={hasDragged ? { 
          transform: `translateX(-50%) translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
        } : undefined}
      >
        <div className="drag-indicator">
          <div className="drag-bar" />
        </div>
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
            <div className="right-actions">

              <button 
                onClick={toggleBookmark} 
                className="icon-btn" 
                aria-label="Bookmark this insight"
              >
                {isBookmarked ? <BookmarkCheck size={20} strokeWidth={1} color="var(--text-primary)" /> : <Bookmark size={20} strokeWidth={1} />}
              </button>
            </div>
          </div>
        </header>

        <div className="chat-content" ref={scrollRef}>
          <div className="verse-context">
            <p className="hebrew-text">{verseTextHebrew}</p>
            <p className="english-text">"{verseTextEnglish}"</p>
            <div className="insight-image-divider">
              <img src={dividerImageUrl || "/images/verse_divider_wave.png?v=fixed"} alt="divider" />
            </div>
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
          height: 85vh;
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
          padding: 0.5rem 2.5rem 1rem;
        }

        .drag-indicator {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-top: 1rem;
          padding-bottom: 0.5rem;
          cursor: grab;
        }

        .drag-indicator:active {
          cursor: grabbing;
        }
        
        .drag-bar {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          background-color: var(--border-light);
          opacity: 0.8;
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
            height: 85vh;
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

export function InsightPanel({ isOpen, onClose, verseId, verseTextHebrew, verseTextEnglish, dividerImageUrl }: InsightPanelProps) {
  return (
    <Suspense fallback={null}>
      <InsightPanelContent 
        isOpen={isOpen}
        onClose={onClose}
        verseId={verseId}
        verseTextHebrew={verseTextHebrew}
        verseTextEnglish={verseTextEnglish}
        dividerImageUrl={dividerImageUrl}
      />
    </Suspense>
  );
}
