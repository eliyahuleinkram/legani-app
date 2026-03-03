import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Zap, Smartphone, ExternalLink, Send } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    id: 1,
    title: 'Claim Your AI Concierge',
    description: 'Tell us about your property, amenities, and typical guest inquiries. We handle all the complex configuration.',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Get Your Number',
    description: "We provide a dedicated WhatsApp business number, or we can instantly plug into your existing one. Zero coding required.",
    icon: Smartphone,
  },
  {
    id: 3,
    title: 'Welcome Guests',
    description: 'Share your new WhatsApp number. Your Legani concierge is now ready to handle inquiries 24/7, flawlessly.',
    icon: MessageCircle,
  },
];

export function WhatsAppSteps() {
  return (
    <section className="w-full py-24 bg-black relative z-10 border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-normal tracking-[0.15em] text-white uppercase"
          >
            WhatsApp Integration
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base font-light"
          >
            Zero technical setup required. Give your guests an instant, intelligent response system while you focus on hospitality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

          {/* Left Column: Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all hover:bg-zinc-900/50"
                >
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-all duration-300">
                      <Icon className="w-5 h-5 text-zinc-300 group-hover:text-emerald-400" />
                    </div>
                    <div className="space-y-2 pt-0.5">
                      <h3 className="text-base font-medium text-white tracking-wide flex items-center gap-2">
                        <span className="text-zinc-600 text-xs font-mono">0{step.id}</span>
                        {step.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed font-light">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Live Demonstration Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 via-transparent to-emerald-500/5 rounded-[2.5rem] blur-xl opacity-50" />
            <div className="relative rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]">

              {/* WhatsApp App Header Mock */}
              <div className="px-6 py-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-inner">
                      <span className="text-white font-medium text-sm">L</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium tracking-wide text-sm">Legani Concierge</h4>
                    <p className="text-emerald-400 text-xs font-light tracking-wider">online</p>
                  </div>
                </div>
                <div className="flex gap-3 text-zinc-500">
                  <PhoneIcon className="w-5 h-5" />
                  <VideoIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Chat Area Mock */}
              {/* Background using an elegant dark minimal pattern commonly used for WA mockups */}
              <div
                className="flex-1 p-6 space-y-4 overflow-y-auto bg-black flex flex-col justify-start"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2318181b' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-zinc-900/80 backdrop-blur-md rounded-xl text-[10px] text-zinc-500 border border-white/5 inline-block">Today</span>
                </div>

                {/* Simulated Messages */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="self-end max-w-[80%]"
                >
                  <div className="bg-emerald-900/60 backdrop-blur-md text-emerald-50 px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm border border-emerald-800/30 text-[13px] relative">
                    Hi! Do you have any availability for a 2-bedroom next weekend in Manhattan?
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[9px] text-emerald-400/80">10:42 AM</span>
                      <DoubleCheckIcon className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.5 }}
                  className="self-start max-w-[85%]"
                >
                  <div className="bg-zinc-900/80 backdrop-blur-md text-zinc-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-white/5 text-[13px] leading-relaxed space-y-2 relative">
                    <p>Hello! I'm your Legani AI concierge ✨</p>
                    <p>Yes, we currently have our <span className="font-medium text-white">Tribeca Loft</span> (2 bed, 2 bath) available next weekend.</p>
                    <p>Would you like me to send you the booking link or share some photos?</p>
                    <div className="flex justify-end items-center mt-1">
                      <span className="text-[9px] text-zinc-500">10:42 AM</span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Chat Input Mock */}
              <div className="px-4 py-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 h-11 bg-zinc-800/50 border border-white/5 rounded-full flex items-center px-4 text-[13px] text-zinc-500 font-light">
                  Type a message...
                </div>
                <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
                  <Send className="w-4 h-4 ml-1" />
                </div>
              </div>

            </div>

            {/* Live Test CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="https://wa.me/972522592515?text=Hi!%20I'm%20testing%20the%20Legani%20bot!"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-6 py-3.5 rounded-full overflow-hidden border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-400 flex items-center gap-3 w-full sm:w-auto justify-center hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors relative z-10" />
                <span className="relative z-10 text-xs tracking-widest uppercase font-medium text-emerald-100 group-hover:text-white transition-colors">
                  Test Live on WhatsApp
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400/50 group-hover:text-emerald-300 relative z-10 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-zinc-500 text-[11px] font-light text-center uppercase tracking-wider">
                Click above to test via WhatsApp
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Simple Icon placeholders for aesthetics
function PhoneIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
function VideoIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>;
}
function PlusIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function DoubleCheckIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="18 6 11 13 8 10" /><polyline points="22 6 15 13 14 12" /></svg>;
}
