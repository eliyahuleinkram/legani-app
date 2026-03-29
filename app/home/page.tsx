"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InsightPanel } from "../components/InsightPanel";
import { GlobalAudioButton } from "../components/AudioContext";

import { HDate, Location, Zmanim, getHolidaysOnDate } from "@hebcal/core";


export default function HomeDashboard() {
  const router = useRouter();
  const [nusach, setNusach] = useState("");
  const [chassidus, setChassidus] = useState("");
  const [bookmarks, setBookmarks] = useState<{id: string, hebrew: string, english: string}[]>([]);
  const [activeBookmark, setActiveBookmark] = useState<{id: string, hebrew: string, english: string} | null>(null);
  const [greeting, setGreeting] = useState("Awaken Your Day");
  const [dateString, setDateString] = useState("");

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const savedNusach = localStorage.getItem("legani_nusach");
    const savedChassidus = localStorage.getItem("legani_chassidus");
    const savedName = localStorage.getItem("legani_name") || "";

    if (!savedNusach) {
      router.push("/");
    } else {
      setNusach(savedNusach);
      setChassidus(savedChassidus || "None");
      fetchBookmarks();
    }
    
    const setTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      let baseGreeting = "";
      if (hour >= 5 && hour < 12) baseGreeting = "Good Morning";
      else if (hour >= 12 && hour < 18) baseGreeting = "Good Afternoon";
      else if (hour >= 18 && hour < 22) baseGreeting = "Good Evening";
      else baseGreeting = "Good Night";

      setGreeting(savedName ? `${baseGreeting}, ${savedName}` : baseGreeting);
    };

    setTimeBasedGreeting();
    
    // Default to Jerusalem (Latitude 31.7683, Longitude 35.2137)
    updateDateDisplay(new Date(), 31.7683, 35.2137);
  }, [router]);

  const updateDateDisplay = (date: Date, lat?: number, lon?: number) => {
    let hd = new HDate(date);
    
    if (lat && lon) {
      const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const loc = new Location(lat, lon, false, tzid, "", "");
      const zmanim = new Zmanim(loc, date, false);
      const sunset = zmanim.sunset();
      if (sunset && date > sunset) {
        hd = hd.next();
      }
    }

    const hebrewMonthDay = hd.render('en').split(',')[0]; 
    
    // @ts-ignore - The underlying hebcal core safely accepts 2 parameters despite over-strict typing
    const events = getHolidaysOnDate(hd, false) || [];
    const omerEv = events.find((e: any) => typeof e.omer === "number");
    const omerDay = omerEv ? (omerEv as any).omer : null;

    const holidayNames = events.map((e: any) => e.render('en')).filter((n: string) => !n.match(/Candle|Havdalah|Omer/i));

    let display = "";
    if (omerDay) display += `OMER ${omerDay} — `;
    display += hebrewMonthDay;
    if (holidayNames.length > 0) display += ` — ${holidayNames.join(', ')}`;
    
    setDateString(display.toUpperCase());
  };

  return (
    <main className="zen-dashboard">
      <nav className="zen-nav animate-fade-in">
        <span className="zen-logo">Legani</span>
        <div className="nav-right">
          <div className="zen-prefs">
            <span>{nusach}</span>
            {chassidus !== "None" && (
              <>
                <span className="zen-separator">/</span>
                <span>{chassidus}</span>
              </>
            )}
          </div>
          <GlobalAudioButton />
        </div>
      </nav>

      <div className="zen-main-content">
        <header className="zen-hero animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="zen-date">{dateString}</p>
          <h1 className="zen-greeting">{greeting}</h1>
        </header>

        <section className="zen-prayers animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="zen-prayer-list">
            <Link href="/morning" className="zen-prayer-item group">
              <div className="prayer-info">
                <img src="/images/icon_morning.png" alt="Morning Icon" className="prayer-icon-drawing" />
                <h2 className="prayer-title">Morning</h2>
              </div>
              <div className="zen-arrow-ghost" style={{ width: 28, height: 28, flexShrink: 0 }} aria-hidden="true" />
            </Link>

            <Link href="/afternoon" className="zen-prayer-item group">
              <div className="prayer-info">
                <img src="/images/icon_afternoon.png" alt="Afternoon Icon" className="prayer-icon-drawing" />
                <h2 className="prayer-title">Afternoon</h2>
              </div>
              <div className="zen-arrow-ghost" style={{ width: 28, height: 28, flexShrink: 0 }} aria-hidden="true" />
            </Link>

            <Link href="/evening" className="zen-prayer-item group">
              <div className="prayer-info">
                <img src="/images/icon_evening.png" alt="Evening Icon" className="prayer-icon-drawing" />
                <h2 className="prayer-title">Evening</h2>
              </div>
              <div className="zen-arrow-ghost" style={{ width: 28, height: 28, flexShrink: 0 }} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {bookmarks.length > 0 && (
          <section className="zen-bookmarks animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="section-label">Collected Insights</div>
            <div className="bookmarks-list">
              {bookmarks.map((bm, index) => (
                <div key={bm.id} className="zen-verse-wrapper">
                  <div 
                    className="zen-verse-block group"
                    onClick={() => setActiveBookmark(bm)}
                  >
                    <div className="zen-verse-inner">
                      <p className="zen-hebrew">{bm.hebrew}</p>
                      <p className="zen-english">{bm.english}</p>
                    </div>
                  </div>
                  
                  {index < bookmarks.length - 1 && (
                    <div className="verse-separator">
                      <img src={`/images/verse_divider_${['wave', 'stream', 'horizon', 'mountain'][index % 4]}.png?v=fixed`} alt="divider" className="verse-divider-image" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}


      </div>

      <InsightPanel 
        isOpen={!!activeBookmark}
        onClose={() => {
          setActiveBookmark(null);
          // Wait briefly before fetching to let DELETE requests settle if unbookmarked
          setTimeout(fetchBookmarks, 500);
        }}
        verseId={activeBookmark?.id || ""}
        verseTextHebrew={activeBookmark?.hebrew || ""}
        verseTextEnglish={activeBookmark?.english || ""}
        dividerImageUrl={activeBookmark ? `/images/verse_divider_${['wave', 'stream', 'horizon', 'mountain'][Math.max(0, bookmarks.findIndex(b => b.id === activeBookmark.id)) % 4]}.png?v=fixed` : undefined}
      />

      <style jsx>{`
        .zen-dashboard {
          min-height: 100vh;
          background-color: var(--bg-primary);
          padding: 2rem 5vw 8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .zen-nav {
          width: 100%;
          max-width: 1000px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 0;
        }

        .zen-logo {
          font-weight: 200;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .zen-prefs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-primary);
        }

        .zen-separator {
          color: var(--text-tertiary);
          font-weight: 300;
          margin: 0 0.5rem;
        }

        .zen-main-content {
          width: 100%;
          max-width: 1000px;
          margin-top: 8rem;
          display: flex;
          flex-direction: column;
          gap: 10rem;
        }

        .zen-hero {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .zen-date {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-tertiary);
        }

        .zen-greeting {
          font-size: var(--text-3xl);
          font-weight: 300;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .zen-clock {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-tertiary);
          margin-top: 0.5rem;
        }

        .zen-prayer-list {
          display: flex;
          flex-direction: column;
        }

        .zen-prayer-item {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 3rem 0;
          border-bottom: 1px solid var(--border-light);
          transition: border-color var(--transition-normal);
          cursor: pointer;
        }

        .zen-prayer-item:first-child {
          border-top: 1px solid var(--border-light);
        }

        .zen-prayer-item:hover {
          border-color: var(--text-primary);
        }

        .prayer-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prayer-icon-drawing {
          height: 48px;
          width: auto;
          object-fit: contain;
          align-self: flex-start;
          margin-bottom: 0.5rem;
          margin-left: -5px; /* Slight offset to align the actual ink strokes, since PNG border may be padded */
        }

        .prayer-title {
          font-size: var(--text-2xl);
          font-weight: 300;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .zen-arrow {
          color: var(--text-tertiary);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }

        .zen-prayer-item:hover .zen-arrow {
          color: var(--text-primary);
          transform: translateX(8px);
        }

        .section-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-tertiary);
          margin-bottom: 3rem;
        }

        .bookmarks-list {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .zen-verse-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .zen-verse-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          padding: 1.5rem 0;
          transition: opacity var(--transition-normal);
        }

        .zen-verse-wrapper:first-child .zen-verse-block {
          padding-top: 0;
        }

        .zen-verse-wrapper:last-child .zen-verse-block {
          padding-bottom: 0;
        }

        .zen-verse-block:hover {
          opacity: 0.6;
        }

        .zen-verse-inner {
          text-align: center;
          transition: opacity var(--transition-normal);
        }

        .zen-hebrew {
          font-family: var(--font-hebrew);
          font-size: var(--text-hebrew-lg);
          margin-bottom: 2rem;
          color: var(--text-primary);
          line-height: 1.6;
          direction: rtl;
        }

        .zen-english {
          font-size: var(--text-lg);
          color: var(--text-primary);
          line-height: 1.8;
          font-weight: 300;
          max-width: 85%;
          margin: 0 auto;
        }

        .verse-separator {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 2.5rem 0;
          opacity: 0.4;
        }

        .verse-divider-image {
          width: 90%;
          max-width: 500px;
          height: auto;
          aspect-ratio: 4.5 / 1;
          object-fit: cover;
          object-position: center;
          opacity: 0.85;
        }

        .zen-inspiration {
          margin-top: 4rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .inspire-quote {
          font-size: var(--text-2xl);
          font-weight: 200;
          line-height: 1.4;
          color: var(--text-primary);
          max-width: 800px;
        }

        .inspire-source {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-tertiary);
        }

        @media (max-width: 768px) {
          .zen-nav {
            padding: 1.5rem 0;
            align-items: center;
          }
          .nav-right {
            gap: 1rem;
          }
          .zen-dashboard {
            padding: 1rem 1.5rem 6rem;
          }
          .zen-main-content {
            margin-top: 1.5rem;
            gap: 3.5rem;
          }
          .zen-hero {
            gap: 0.5rem;
          }
          .zen-greeting {
            font-size: var(--text-2xl);
            line-height: 1.1;
            letter-spacing: -0.01em;
          }
          .zen-prayer-item {
            padding: 1.5rem 0;
          }
          .prayer-title {
            font-size: var(--text-xl);
          }
          .section-label {
            margin-bottom: 2rem;
          }
          .zen-english {
            max-width: 100%;
          }
          .bookmarks-list {
            gap: 2.5rem;
          }
          .inspire-quote {
            font-size: var(--text-xl);
          }
        }
      `}</style>
    </main>
  );
}
