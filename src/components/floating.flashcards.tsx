"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const sampleWords = [
  {
    front: "Sustainability",
    back: "The ability to maintain or support a process continuously over time",
  },
  {
    front: "Zrównoważony rozwój",
    back: "Możliwość ciągłego utrzymywania lub wspierania procesu w czasie",
  },
];

export function FloatingFlashcards() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const cardRefs = useRef([useAnimation(), useAnimation()]);
  const velocityRefs = useRef([
    { x: 0.7, y: 0.5 },
    { x: -0.5, y: 0.7 },
  ]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    const handleResize = () => {
      updateDimensions();
    };

    // Card dimensions
    const CARD_WIDTH = 256; // w-64
    const CARD_HEIGHT = 320; // h-80
    const PADDING = 50; // Safe space from boundaries
    const CONTENT_WIDTH = 896; // max-w-4xl = 64rem = 1024px, minus some padding

    // Define the bounds for left and right areas
    const leftBounds = {
      top: 100, // Below navigation
      bottom: dimensions.height - CARD_HEIGHT - PADDING,
      left: PADDING + 100, // Added 100px more padding
      right: (dimensions.width - CONTENT_WIDTH) / 2 - CARD_WIDTH - PADDING,
    };

    const rightBounds = {
      top: 100,
      bottom: dimensions.height - CARD_HEIGHT - PADDING,
      left: (dimensions.width + CONTENT_WIDTH) / 2 + PADDING,
      right: dimensions.width - CARD_WIDTH - PADDING,
    };

    const positions = [
      {
        x: leftBounds.left + 100,
        y: leftBounds.top + 100,
        bounds: leftBounds,
      },
      {
        x: rightBounds.left + 100,
        y: rightBounds.top + 100,
        bounds: rightBounds,
      },
    ];

    let animationFrameId: number;

    const animate = () => {
      positions.forEach((pos, index) => {
        // Update position based on velocity
        pos.x += velocityRefs.current[index].x;
        pos.y += velocityRefs.current[index].y;

        const bounds = pos.bounds;

        // Boundary checks with smoother bouncing
        if (pos.x <= bounds.left) {
          pos.x = bounds.left;
          velocityRefs.current[index].x = Math.abs(
            velocityRefs.current[index].x
          );
        }
        if (pos.x >= bounds.right) {
          pos.x = bounds.right;
          velocityRefs.current[index].x = -Math.abs(
            velocityRefs.current[index].x
          );
        }
        if (pos.y <= bounds.top) {
          pos.y = bounds.top;
          velocityRefs.current[index].y = Math.abs(
            velocityRefs.current[index].y
          );
        }
        if (pos.y >= bounds.bottom) {
          pos.y = bounds.bottom;
          velocityRefs.current[index].y = -Math.abs(
            velocityRefs.current[index].y
          );
        }

        // Smooth rotation based on movement direction
        const rotation = Math.sin(Date.now() / 2000) * 3; // Reduced rotation angle and slowed down

        // Apply position and rotation
        cardRefs.current[index].set({
          x: pos.x,
          y: pos.y,
          rotate: rotation,
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions.width, dimensions.height]);

  return (
    <div className="relative w-full h-full">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={cardRefs.current[i]}
          initial={{
            x: i === 0 ? 100 : dimensions.width - 400,
            y: 200,
          }}
          style={{
            width: 256,
            height: 320,
          }}
        >
          <motion.div
            className="relative w-64 h-80 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col items-center justify-center p-6 transform hover:scale-105 transition-transform cursor-pointer group"
            whileHover={{
              rotateY: 180,
              transition: { duration: 0.6 },
            }}
          >
            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-6 backface-hidden">
              <div className="text-center mt-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {sampleWords[i].front}
                </h3>
                <p className="text-gray-400 text-sm">{sampleWords[i].back}</p>
              </div>
              {/* Like/Dislike Buttons */}
              <div className="flex gap-4 mt-4">
                <motion.button
                  className="p-2 rounded-full bg-green-500/40 hover:bg-green-500/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ThumbsUp className="w-6 h-6 text-green-400" />
                </motion.button>
                <motion.button
                  className="p-2 rounded-full bg-red-500/40 hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ThumbsDown className="w-6 h-6 text-red-400" />
                </motion.button>
              </div>
            </div>

            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
