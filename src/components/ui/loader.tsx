"use client";

import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "4px solid transparent",
            borderTopColor: "#A855F7", // purple-500
            borderRightColor: "#EC4899", // pink-500
            width: "60px",
            height: "60px",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner gradient glow */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
    </div>
  );
}
