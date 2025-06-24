"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useContactModal } from "@/shared/contact-modal-context";

export function AnimatedAssistant() {
  const [isHovered, setIsHovered] = useState(false);
  const [eyeState, setEyeState] = useState('open');
  const [mouthState, setMouthState] = useState<'happy' | 'talking' | 'excited'>('happy');
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right' | 'up'>('center');
  const { openContactModal } = useContactModal();

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeState('closed');
      setTimeout(() => setEyeState('open'), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Eye movement animation
  useEffect(() => {
    const eyeMoveInterval = setInterval(() => {
      const directions: ('center' | 'left' | 'right' | 'up')[] = ['center', 'left', 'right', 'up'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setEyeDirection(randomDirection);
      setTimeout(() => setEyeDirection('center'), 1000);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(eyeMoveInterval);
  }, []);

  // Mouth animation
  useEffect(() => {
    const mouthInterval = setInterval(() => {
      setMouthState('talking');
      setTimeout(() => setMouthState('happy'), 600);
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(mouthInterval);
  }, []);



  const handleClick = () => {
    setMouthState('excited');
    setTimeout(() => setMouthState('happy'), 800);
    openContactModal();
  };

  const getEyePosition = (direction: 'center' | 'left' | 'right' | 'up') => {
    switch (direction) {
      case 'left': return { x: -2, y: 0 };
      case 'right': return { x: 2, y: 0 };
      case 'up': return { x: 0, y: -2 };
      default: return { x: 0, y: 0 };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-10">
        {/* Main assistant container */}
      <motion.div
        className="relative cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ perspective: '800px' }}
      >
        {/* Glowing aura */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-20 blur-xl"
          animate={{
            scale: isHovered ? [1, 1.3, 1] : [1, 1.15, 1],
            opacity: isHovered ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* 3D Flashcard container */}
        <motion.div
          className="relative [transform-style:preserve-3d]"
          animate={{
            y: isHovered ? 0 : [0, -8, 0],
            rotateY: isHovered ? [0, 12, -12, 0] : [0, -8, 8, 0],
            rotateX: isHovered ? [0, -6, 6, 0] : [0, -3, 3, 0],
          }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, repeatType: "reverse" },
            rotateY: { duration: 8, repeat: Infinity, repeatType: "reverse" },
            rotateX: { duration: 8, repeat: Infinity, repeatType: "reverse" },
          }}
        >
          {/* Main flashcard (front face) */}
          <motion.div
            className="relative w-20 h-28 rounded-xl shadow-2xl overflow-hidden"
            style={{ 
              transform: 'translateZ(8px)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #c084fc 50%, #d946ef 75%, #e879f9 100%)',
            }}
          >
            {/* Card shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
              animate={{
                opacity: isHovered ? [0.2, 0.4, 0.2] : [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />

            {/* Eyes container */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3">
              {[0, 1].map((idx) => (
                <div key={idx} className="relative">
                  {/* White eyeball */}
                  <div className="w-5 h-5 bg-white rounded-full shadow-inner flex items-center justify-center border border-gray-200">
                    {/* Black pupil */}
                    <motion.div
                      className="w-2 h-2 bg-black rounded-full relative"
                      animate={getEyePosition(eyeDirection)}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {/* Eye shine */}
                      <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
                    </motion.div>
                  </div>
                  
                  {/* Eyelid for blinking */}
                  <motion.div
                    className="absolute top-0 left-0 w-5 h-5 bg-purple-600 rounded-full"
                    animate={{ 
                      scaleY: eyeState === 'closed' ? 1 : 0,
                      originY: 0.5 
                    }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced mouth */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <motion.div
                className="relative"
                animate={{
                  scale: mouthState === 'excited' ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {mouthState === 'happy' && (
                  <div className="w-8 h-4 border-b-2 border-black rounded-b-full" />
                )}
                
                {mouthState === 'talking' && (
                  <motion.div
                    className="w-6 h-3 bg-black rounded-full"
                    animate={{ scaleY: [1, 0.4, 1] }}
                    transition={{ duration: 0.4, repeat: 2, repeatType: 'mirror' }}
                  />
                )}
                
                {mouthState === 'excited' && (
                  <div className="w-10 h-6 border-b-3 border-black rounded-b-full relative">
                    <div className="absolute bottom-0 left-2 w-1 h-1 bg-black rounded-full" />
                    <div className="absolute bottom-0 right-2 w-1 h-1 bg-black rounded-full" />
                  </div>
                )}
              </motion.div>
            </div>


          </motion.div>


        </motion.div>

        {/* Chat icon indicator */}
        <motion.div
          className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          animate={{
            scale: isHovered ? [1, 1.3, 1] : [1, 1.15, 1],
            rotate: isHovered ? [0, 10, -10, 0] : 0,
          }}
          transition={{
            scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
            rotate: { duration: 2, repeat: Infinity, repeatType: "reverse" },
          }}
        >
          <MessageCircle size={14} className="text-white" />
        </motion.div>


      </motion.div>
    </div>
  );
} 