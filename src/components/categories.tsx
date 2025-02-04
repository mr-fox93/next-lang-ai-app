"use client";

import { motion } from "framer-motion";
import { Briefcase, Plane, Utensils, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    icon: Plane,
    label: "Travel",
  },
  {
    icon: Briefcase,
    label: "Job Interview",
  },
  {
    icon: Utensils,
    label: "Ordering Food",
  },
  {
    icon: Building2,
    label: "Booking Hotel",
  },
];

export function Categories() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap gap-2 justify-center mb-6"
    >
      {categories.map((category) => (
        <Button
          key={category.label}
          variant="ghost"
          className="h-12 px-6 bg-white/[0.08] hover:bg-white/[0.12] border-2 border-white/10 rounded-lg group transition-all duration-300"
        >
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <category.icon className="w-4 h-4 text-purple-400" />
            <span className="text-white group-hover:text-purple-400 transition-colors">
              {category.label}
            </span>
          </motion.div>
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10 blur-sm" />
        </Button>
      ))}
    </motion.div>
  );
}
