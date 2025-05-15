import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export function SacredLayout({ children }: { children: React.ReactNode }) {
  const [isPraying, setIsPraying] = useState(false);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Halo Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-gold-500/0 blur-3xl" />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-64 h-64 bg-gold-500/10 rounded-full blur-2xl animate-pulse" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </div>
      </div>

      {/* Prayer Button */}
      <motion.button
        onClick={() => setIsPraying(!isPraying)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300"
      >
        {isPraying ? "Praying..." : "Pray"}
      </motion.button>

      {/* Angelic Bot */}
      <motion.div
        className="absolute top-4 right-4 w-20 h-20"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/angel-bot.png"
          alt="Angelic AI Bot"
          width={80}
          height={80}
          className="animate-float"
        />
      </motion.div>
    </div>
  );
}
