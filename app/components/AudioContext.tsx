"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { AudioPanel, AudioTrack } from "./AudioPanel";
import { Volume2, VolumeX } from "lucide-react";

const AUDIO_TRACKS: AudioTrack[] = [
  {
    src: "/audio/Poltava Reflections.wav",
    title: "Nigun of Poltava",
    subtitle: "The trembling of the soul",
    image: "/images/song_poltava.png",
    description: "A raw, unfiltered outpouring of the soul. Born in the depths of Poltava, this melody demands absolute vulnerability, stripping away the armor of daily life to reach the quiet, trembling truth within.\n\nIt is a slow, methodical ascent—not just a song, but an inward journey of soul-pouring, known as Hishtapchus Hanefesh. The demands of the outer world simply fade away, leaving only closeness with the Divine."
  },
  {
    src: "/audio/Nigun Rozhin (Meditative Piano).wav",
    title: "Nigun Ruzhin",
    subtitle: "Majesty and concealed longing",
    image: "/images/song_ruzhin.png",
    description: "The pure sound of paradox. The Ruzhiner Rebbe walked paths of worldly majesty, yet his heart harbored a devastating, unquenchable thirst for the Divine.\n\nThis melody captures that tension perfectly—an aristocratic, regal cadence infused with a delicate, almost breathless yearning. True majesty is found not in what is possessed, but in who the soul hopelessly longs for in its quietest moments."
  },
  {
    src: "/audio/Meditative Piano Nigun.wav",
    title: "Tzemach Tzedek",
    subtitle: "The spiritual antechamber",
    image: "/images/song_tzemach.png",
    description: "Before a single word of prayer was uttered, there was this melody. The Chassidim of the Tzemach Tzedek used this profound tune as a spiritual antechamber—a deliberate, cleansing breath sweeping away the noise of the world.\n\nIt forms a bridge between the physical ground and the soaring expanse of the spirit. Its gentle, steadily building flow acts as a silent preparation, effortlessly opening the doors of perception."
  },
  {
    src: "/audio/Shamil (Meditative Piano Arrangement).wav",
    title: "Nigun Shamil",
    subtitle: "The soul's exile and yearning",
    image: "/images/song_shamil.png",
    description: "The ultimate voice of the soul's exile. Shamil, a captive warrior in the Caucasus mountains, sang this wordless lament as he gazed upon the unreachable peaks of his home.\n\nIt is the echo of our own spiritual exile—the soul trapped in the gravity of the physical world, forever soaring on the relentless hope of return. The melody descends into profound sorrow only to rise again in blazing, defiant hope."
  },
  {
    src: "/audio/Besht Nigun (Meditative Piano Journey).wav",
    title: "Nigun of the Baal Shem Tov",
    subtitle: "Redeeming the melody",
    image: "/images/song_baal_shem.png",
    description: "A melody redeemed from the earth itself. The Baal Shem Tov taught that holy songs are sometimes trapped in mundane forms, waiting to be liberated by a listening heart with pure intention.\n\nThis transcendent tune is one of sheer, boundless elevation. It instantly shatters the walls of the finite, awakening the soul's untainted essence. To hear it is an act of spiritual liberation."
  }
];

interface AudioContextType {
  isPlaying: boolean;
  isPanelOpen: boolean;
  currentTrack: AudioTrack;
  togglePlay: () => void;
  togglePanel: () => void;
  playAndOpenPanel: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = AUDIO_TRACKS[currentIndex];

  const handleAudioEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => console.warn("Playback restricted"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const playAndOpenPanel = () => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => console.warn("Playback restricted"));
      setIsPlaying(true);
    }
    setIsPanelOpen(true);
  };

  const handleNextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
  };

  const handlePrevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, isPanelOpen, currentTrack, togglePlay, togglePanel, playAndOpenPanel }}>
      {children}
      
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={handleAudioEnded} 
        autoPlay={isPlaying} 
      />

      <AudioPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

export function GlobalAudioButton() {
  const { isPlaying, playAndOpenPanel } = useAudio();

  return (
    <button 
      onClick={playAndOpenPanel} 
      className="global-audio-toggle" 
      aria-label="Audio player"
    >
      {isPlaying ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
      <style jsx>{`
        .global-audio-toggle {
          color: var(--text-tertiary);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: transparent;
          cursor: pointer;
          flex-shrink: 0;
        }
        
        .global-audio-toggle:hover {
          color: var(--text-primary);
          background: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </button>
  );
}
