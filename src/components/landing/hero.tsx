"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Modern headline font with character
const headlineFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Monospace for technical feel
const accentFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Integration Logos
const integrationLogos = [
  "https://cdn.simpleicons.org/github/FFFFFF",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/628f567b2e485aad67d93fb60e74b1cdabd543e8?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/2a800b31805310aa7e66a69e5418fa00690c8447?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/d63f85ba4135dced28843a0b237ce4cbe013537b?placeholderIfAbsent=true",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/10815a12b7490498be53c31b79b84eaf776fcc3f?placeholderIfAbsent=true",
];

export const IntegrationsMarquee = () => {
  return (
    <section className="bg-black py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className={`text-sm font-medium text-green-400/80 tracking-wide uppercase ${accentFont.className}`}>
            // Integrations
          </div>
          <div className={`text-2xl font-semibold text-white mt-2 ${headlineFont.className}`}>
            Connects with your entire workflow
          </div>
        </motion.div>

        {/* Fixed Animated marquee */}
        <div className="overflow-hidden whitespace-nowrap relative w-full">
          <div className="flex animate-marquee">
            {[...integrationLogos, ...integrationLogos, ...integrationLogos].map(
              (src, index) => (
                <motion.img
                  key={index}
                  src={src}
                  alt={`Integration Logo ${(index % integrationLogos.length) + 1}`}
                  className="object-contain shrink-0 h-8 md:h-10 mx-12 opacity-60"
                  whileHover={{ 
                    scale: 1.2, 
                    opacity: 1,
                    transition: { duration: 0.2 }
                  }}
                  loading="lazy"
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
};

export const Hero = () => {
  const [email, setEmail] = useState("");

  const handleGetStartedClick = () => {
    console.log("Get started clicked");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      <main className="px-6 py-4 max-md:px-4 relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="relative rounded-2xl overflow-hidden mx-auto max-w-[98vw]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

          {/* Hero Content */}
          <div className="relative z-10 px-16 pt-20 pb-12 text-center max-md:px-8 max-md:pt-16 max-md:pb-8">
            
            {/* Status Badge - Tech Style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-8"
            >
              <div className={`text-sm font-medium text-green-400/80 tracking-wide ${accentFont.className}`}>
                // Currently in beta
              </div>
            </motion.div>
            
            {/* Headline - Fixed staggered animation */}
            <div className="overflow-visible mb-8">
              <motion.h1
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-white ${headlineFont.className}`}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="block"
                >
                  <span className="text-white">Never Walk Into</span>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="block bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent"
                  style={{ 
                    background: "linear-gradient(135deg, #10b981, #34d399, #6ee7b7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  A Meeting Unprepared
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="block text-white"
                >
                  Again
                </motion.span>
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="mb-12"
            >
              <p className={`${headlineFont.className} text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-medium`}>
                Your AI Chief of Staff researches attendees, builds agendas, and delivers 
                <span className="text-green-400 font-semibold"> pre-meeting intelligence </span>
                from GitHub, Slack, Notion & more.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <div className="flex w-full sm:w-auto max-w-md group">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-black/50 border-white/20 text-white placeholder:text-gray-400 focus:border-green-500 focus:bg-black/70 rounded-r-none transition-all duration-300 ${accentFont.className}`}
                />
                <Button
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-black hover:from-green-400 hover:to-emerald-500 rounded-l-none px-6 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  Get Started
                </Button>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`text-xs text-gray-500 ${accentFont.className}`}
              >
                Free trial • No credit card required
              </motion.p>
            </motion.div>

            {/* Demo Image with Enhanced Glow */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative mx-auto"
            >
              <div className="relative group">
                {/* Multi-layer glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3] 
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-4 bg-gradient-to-r from-green-400/30 via-emerald-500/40 to-green-600/30 blur-2xl rounded-3xl"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.3, 0.1] 
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -inset-8 bg-gradient-to-br from-green-300/20 via-emerald-400/30 to-green-500/20 blur-3xl rounded-3xl"
                />

                <img
                  src="/demo.png"
                  alt="Product Demo"
                  className="relative z-10 rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(34,197,94,0.3)] transition-all duration-700 group-hover:shadow-[0_0_120px_rgba(34,197,94,0.4)] group-hover:scale-[1.02]"
                />
                
                {/* Scanning line effect */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-75 rounded-2xl overflow-hidden"
                  animate={{ y: [0, 400] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatDelay: 2 
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <IntegrationsMarquee />
    </div>
  );
};