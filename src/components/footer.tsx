"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 border-t border-white/10 bg-black/40">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm">
            © {currentYear} Flashcards AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="https://linkedin.com/in/kamillisiecki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <Linkedin size={16} />
              <span>Contact</span>
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
