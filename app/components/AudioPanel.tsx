"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // All animation state lives in refs to avoid re-renders during gestures
  const baseOffsetPx = useRef(0);
  const isDragging = useRef(false);
  const dragStartClientY = useRef(0);
  const dragStartPanelY = useRef(0);
  const currentPanelY = useRef(0);
  const isClosingRef = useRef(false);

  const setPanelY = useCallback((y: number, animated: boolean) => {
    currentPanelY.current = y;
    if (!panelRef.current) return;
    panelRef.current.style.transition = animated
      ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
      : 'none';
    panelRef.current.style.transform = `translateX(-50%) translateY(${y}px)`;

    if (overlayRef.current) {
      overlayRef.current.style.opacity = String(Math.max(0, 1 - y / 500));
    }
  }, []);

  // Open lifecycle
  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      baseOffsetPx.current = window.innerHeight * 0.11;
      setIsVisible(true);
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        setPanelY(window.innerHeight, false);
        requestAnimationFrame(() => {
          setPanelY(baseOffsetPx.current, true);
        });
      });
    }
  }, [isOpen, setPanelY]);

  // Reset when closed externally
  useEffect(() => {
    if (!isOpen && isVisible) {
      setIsVisible(false);
      document.body.style.overflow = '';
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  }, [isOpen, isVisible]);

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setPanelY(window.innerHeight, true);
    if (overlayRef.current) {
      overlayRef.current.style.transition = 'opacity 0.45s ease';
      overlayRef.current.style.opacity = '0';
    }
    setTimeout(() => {
      setIsVisible(false);
      isClosingRef.current = false;
      if (contentRef.current) contentRef.current.scrollTop = 0;
      document.body.style.overflow = '';
      onClose();
    }, 480);
  }, [onClose, setPanelY]);

  // Scroll-driven expansion: panel follows scroll position smoothly
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging.current || isClosingRef.current) return;
    const st = e.currentTarget.scrollTop;
    const y = Math.max(0, baseOffsetPx.current - st);
    setPanelY(y, false); // NO transition — sticks to scroll exactly
  }, [setPanelY]);

  // Touch drag for dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      if (contentRef.current.scrollTop > 0) return;
    }
    isDragging.current = true;
    dragStartClientY.current = e.touches[0].clientY;
    dragStartPanelY.current = currentPanelY.current;
    if (panelRef.current) panelRef.current.style.transition = 'none';
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - dragStartClientY.current;

    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      if (delta < 0) { isDragging.current = false; return; }
      if (contentRef.current.scrollTop > 0) { isDragging.current = false; return; }
    }

    let newY = dragStartPanelY.current + delta;
    if (newY < 0) newY = newY * 0.12; // rubber band
    setPanelY(newY, false);
  }, [setPanelY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (currentPanelY.current > 150) {
      close();
    } else {
      // Snap to scroll-derived position
      const scrollTop = contentRef.current?.scrollTop || 0;
      const targetY = Math.max(0, baseOffsetPx.current - scrollTop);
      setPanelY(targetY, true);
    }
  }, [close, setPanelY]);

  if (!isVisible || !track) return null;

  return (
    <>
      <div ref={overlayRef} className="overlay" onClick={close} />
      <div
        ref={panelRef}
        className="panel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drag-indicator">
          <div className="drag-bar" />
        </div>
        <header className="panel-header">
          <div className="header-actions">
            <div className="header-left">
              <button className="icon-btn" onClick={close} aria-label="Close panel">
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
          transition: opacity 0.4s ease;
        }

        .panel {
          position: fixed;
          bottom: 0;
          left: 50%;
          width: 100%;
          height: 96dvh;
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
          will-change: transform;
          transform: translateX(-50%) translateY(100%);
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
          width: 40px;
          height: 40px;
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
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: none;
        }

        .track-hero {
          text-align: center;
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
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
          justify-content: center;
          width: 100%;
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
            border-top-left-radius: 1.5rem;
            border-top-right-radius: 1.5rem;
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
