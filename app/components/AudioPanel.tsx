"use client";

import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, SkipForward, SkipBack } from "lucide-react";

export interface AudioTrack {
  src: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
}

interface AudioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  track: AudioTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export function AudioPanel({ isOpen, onClose, track, isPlaying, onTogglePlay, onPrevTrack, onNextTrack }: AudioPanelProps) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setHasDragged(false);
      setIsDragging(false);
      setIsExpanded(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      if (contentRef.current.scrollTop > 0) return;
    }
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setHasDragged(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    if (deltaY < -30 && !isExpanded) {
      setIsExpanded(true);
    }
    
    // Smooth drag down, slight resistance drag up
    setDragY(deltaY > 0 ? deltaY : Math.max(deltaY * 0.2, -20));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (touchStartY === null) return;
    
    // Threshold to close
    if (dragY > 100) {
      onClose();
      setTimeout(() => {
        setDragY(0);
        setIsExpanded(false);
      }, 300);
    } else {
      setDragY(0);
      if (dragY > 40 && isExpanded) {
        setIsExpanded(false);
      }
    }
    setTouchStartY(null);
  };

  const handleScroll = () => {
    if (!isExpanded && contentRef.current && contentRef.current.scrollTop > 10) {
      setIsExpanded(true);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <>
      <div className="overlay animate-fade-in" onClick={onClose} />
      <div 
        className={`panel ${!hasDragged ? 'animate-slide-up' : ''} ${isExpanded ? 'expanded' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={hasDragged ? { 
          transform: `translateX(-50%) translateY(${dragY}px)`,
          transition: isDragging ? 'height 0.4s cubic-bezier(0.32, 0.72, 0, 1)' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), height 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
        } : undefined}
      >
        <div className="drag-indicator">
          <div className="drag-bar" />
        </div>
        <header className="panel-header">
          <div className="header-actions">
            <div className="header-left">
              <button onClick={onClose} className="icon-btn" aria-label="Close audio panel">
                <X size={20} strokeWidth={1} />
              </button>
            </div>
            <div className="header-center">
              <span className="lens-indicator">Meditative Piano</span>
            </div>
            <div className="right-actions" />
          </div>
        </header>

        <div className="audio-content" ref={contentRef} onScroll={handleScroll}>
          <div className="track-hero">
            {track.image && (
              <div className="song-image-container">
                <img key={track.image} src={track.image} alt={track.title} className="song-image" />
              </div>
            )}
            <h2 className="track-title">{track.title}</h2>
            <p className="track-subtitle">{track.subtitle}</p>
          </div>

          <div className="audio-controls-main">
            <button onClick={onPrevTrack} className="control-btn prev-btn" aria-label="Previous track">
              <SkipBack size={24} strokeWidth={1} />
            </button>
            <button onClick={onTogglePlay} className="control-btn play-btn" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={28} strokeWidth={1} /> : <Play size={28} strokeWidth={1} className="play-icon-offset" />}
            </button>
            <button onClick={onNextTrack} className="control-btn next-btn" aria-label="Next track">
              <SkipForward size={24} strokeWidth={1} />
            </button>
          </div>

          <div className="track-description">
            {track.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
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
          height: 85dvh;
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
          transition: height 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        .panel.expanded {
          height: 96dvh;
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
          justify-self: end;
          width: 40px;
        }
        
        .icon-btn {
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        .icon-btn:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        
        .lens-indicator {
          font-weight: 200;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          text-align: center;
        }

        .audio-content {
          padding: 1rem 4rem 6rem;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .track-hero {
          text-align: center;
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .song-image-container {
          width: 100%;
          max-width: 250px;
          aspect-ratio: 1;
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          mix-blend-mode: multiply;
        }

        .song-image {
          width: 100%;
          height: 100%;
          mix-blend-mode: multiply;
          object-fit: contain;
          opacity: 0.85;
          filter: grayscale(100%);
          color: transparent;
        }

        .track-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 200;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .track-subtitle {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        .audio-controls-main {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 5rem;
        }

        .control-btn {
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .control-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-tertiary);
          transform: scale(1.05);
        }

        .play-btn {
          width: 80px;
          height: 80px;
        }

        .next-btn, .prev-btn {
          width: 50px;
          height: 50px;
        }

        .play-icon-offset {
           transform: translateX(2px);
        }

        .track-description {
          text-align: center;
          max-width: 80%;
        }



        .track-description p {
          font-size: 1.15rem;
          line-height: 2;
          color: var(--text-primary);
          font-weight: 300;
          letter-spacing: 0.01em;
          margin-bottom: 1.5rem;
        }

        .track-description p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .panel {
            height: 85dvh;
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
          }
          .panel.expanded {
            height: 96dvh;
          }
          .audio-content {
            padding: 1.5rem 2rem 4rem;
          }
          .track-description {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
