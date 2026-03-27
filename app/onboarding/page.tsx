"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [nusach, setNusach] = useState("");
  const [chassidus, setChassidus] = useState("");
  const [language, setLanguage] = useState("");

  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/home";

  useEffect(() => {
    const existingName = localStorage.getItem("legani_name");
    const existingNusach = localStorage.getItem("legani_nusach");
    const existingChassidus = localStorage.getItem("legani_chassidus");
    const existingLanguage = localStorage.getItem("legani_language");

    if (existingName) setName(existingName);
    if (existingNusach) setNusach(existingNusach);
    if (existingChassidus) setChassidus(existingChassidus);
    if (existingLanguage) setLanguage(existingLanguage);
  }, []);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleFinish = () => {
    localStorage.setItem("legani_name", name.trim());
    localStorage.setItem("legani_nusach", nusach);
    localStorage.setItem("legani_chassidus", chassidus);
    localStorage.setItem("legani_language", language);
    router.push(nextRoute);
  };

  return (
    <main className="zen-container">
      {step > 1 && (
        <button className="zen-back-btn animate-fade-in" onClick={() => setStep(step - 1)} aria-label="Go back">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
      )}

      <div className="zen-content">
        <header className="zen-header animate-fade-in">
          <h1 className="zen-logo">Legani</h1>
        </header>

        <div className="zen-step-wrapper">
          {step === 1 && (
            <div className="zen-step animate-fade-in">
              <h2 className="zen-question">What is your name?</h2>
              <input 
                type="text"
                className="zen-input"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleNext() }}
                autoFocus
              />
              <button 
                className={`zen-continue ${name.trim() ? "visible" : ""}`}
                disabled={!name.trim()} 
                onClick={handleNext}
              >
                Continue <ArrowRight size={18} strokeWidth={1} className="arrow" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="zen-step animate-fade-in">
              <h2 className="zen-question">What is your Nusach?</h2>
              <div className="zen-options">
                {["Ashkenaz", "Sefard", "Ari", "Edot HaMizrach"].map(option => (
                  <button 
                    key={option}
                    className={`zen-option ${nusach === option ? "selected" : ""}`}
                    onClick={() => setNusach(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button 
                className={`zen-continue ${nusach ? "visible" : ""}`}
                disabled={!nusach} 
                onClick={handleNext}
              >
                Continue <ArrowRight size={18} strokeWidth={1} className="arrow" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="zen-step animate-fade-in">
              <h2 className="zen-question">Choose a spiritual lens.</h2>
              <div className="zen-options">
                {["Chabad", "Breslov", "General Chassidus", "Lita/Mussar", "None"].map(option => (
                  <button 
                    key={option}
                    className={`zen-option ${chassidus === option ? "selected" : ""}`}
                    onClick={() => setChassidus(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button 
                className={`zen-continue ${chassidus ? "visible" : ""}`}
                disabled={!chassidus} 
                onClick={handleNext}
              >
                Continue <ArrowRight size={18} strokeWidth={1} className="arrow" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="zen-step animate-fade-in">
              <h2 className="zen-question">Select your language.</h2>
              <div className="zen-options">
                {["English & Hebrew", "Spanish & Hebrew", "French & Hebrew", "Russian & Hebrew", "Portuguese & Hebrew", "Hebrew Only", "English Only"].map(option => (
                  <button 
                    key={option}
                    className={`zen-option ${language === option ? "selected" : ""}`}
                    onClick={() => setLanguage(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button 
                 className={`zen-continue ${language ? "visible" : ""}`}
                disabled={!language} 
                onClick={handleFinish}
              >
                Begin <ArrowRight size={18} strokeWidth={1} className="arrow" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .zen-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: var(--bg-primary);
          position: relative;
        }
        
        .zen-back-btn {
          position: absolute;
          top: 3rem;
          left: 3rem;
          color: var(--text-tertiary);
          transition: color var(--transition-fast);
        }
        
        .zen-back-btn:hover {
          color: var(--text-primary);
        }

        .zen-content {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6rem;
        }

        .zen-header {
          position: absolute;
          top: 3rem;
        }

        .zen-logo {
          font-family: var(--font-sans);
          font-weight: 200;
          font-size: 1.25rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }

        .zen-step-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 4rem;
        }

        .zen-step {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .zen-question {
          font-size: var(--text-3xl);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 5rem;
          letter-spacing: -0.02em;
        }
        
        .zen-input {
          font-family: inherit;
          font-size: var(--text-2xl);
          font-weight: 300;
          color: var(--text-primary);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-light);
          padding: 1rem 0;
          text-align: center;
          width: 100%;
          max-width: 300px;
          margin-bottom: 5rem;
          outline: none;
          transition: border-color var(--transition-normal);
        }
        
        .zen-input::placeholder {
          color: var(--border-light);
          font-weight: 200;
        }
        
        .zen-input:focus {
          border-color: var(--text-primary);
        }

        .zen-options {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 5rem;
          width: 100%;
          max-width: 400px;
        }

        .zen-option {
          font-size: var(--text-xl);
          color: var(--text-tertiary);
          font-weight: 300;
          padding: 1rem 0;
          border-bottom: 1px solid transparent;
          transition: all var(--transition-normal);
          position: relative;
        }

        .zen-option::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 1px;
          background-color: var(--text-primary);
          transition: width var(--transition-normal);
        }

        .zen-option:hover {
          color: var(--text-secondary);
        }

        .zen-option.selected {
          color: var(--text-primary);
        }
        
        .zen-option.selected::after {
          width: 100%;
        }

        .zen-continue {
          font-size: var(--text-lg);
          font-weight: 300;
          color: var(--text-primary);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(10px);
          transition: all var(--transition-normal);
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .zen-continue.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .zen-continue:hover .arrow {
          transform: translateX(5px);
        }

        .arrow {
          transition: transform var(--transition-fast);
        }

        @media (max-width: 768px) {
          .zen-back-btn {
            top: 2rem;
            left: 2rem;
          }
          .zen-header {
            top: 2rem;
          }
          .zen-question {
            font-size: var(--text-2xl);
            margin-bottom: 3rem;
          }
          .zen-options {
            margin-bottom: 4rem;
          }
        }
      `}</style>
    </main>
  );
}
