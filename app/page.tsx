import { Chat } from './components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 flex flex-col items-center w-full max-w-4xl space-y-12 py-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Diamonds Alley <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI Concierge</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Experience the future of boutique luxury hosting. Our intelligent assistant knows everything about your stay in Tzfat.
          </p>
        </div>

        <Chat />
      </div>
    </div>
  );
}
