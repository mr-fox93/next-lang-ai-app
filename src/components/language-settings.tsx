"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Globe, ArrowRightLeft, GraduationCap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ErrorMessage } from "@/shared/ui/error-message";

// Available languages
const LANGUAGES = [
  { code: "pl", name: "Polish" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
] as const;

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Expert" },
] as const;

export type LanguageSettings = {
  sourceLanguage: string;
  targetLanguage: string;
  difficultyLevel: string;
};

type LanguageSettingsProps = {
  onChange?: (settings: LanguageSettings) => void;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  defaultDifficultyLevel?: string;
};

export function LanguageSettings({
  onChange,
  defaultSourceLanguage = "pl",
  defaultTargetLanguage = "en",
  defaultDifficultyLevel = "easy",
}: LanguageSettingsProps) {
  const [sourceLanguage, setSourceLanguage] = useState(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [difficultyLevel, setDifficultyLevel] = useState(defaultDifficultyLevel);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sprawdza, czy języki są takie same i ustawia błąd
  useEffect(() => {
    if (sourceLanguage === targetLanguage) {
      setErrorMessage("Source and target languages cannot be the same");
    } else {
      setErrorMessage(null);
    }
  }, [sourceLanguage, targetLanguage]);

  const handleSourceLanguageChange = (value: string) => {
    setSourceLanguage(value);
    if (value === targetLanguage) {
      setErrorMessage("Source and target languages cannot be the same");
    } else {
      setErrorMessage(null);
      triggerOnChange(value, targetLanguage, difficultyLevel);
    }
  };

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
    if (value === sourceLanguage) {
      setErrorMessage("Source and target languages cannot be the same");
    } else {
      setErrorMessage(null);
      triggerOnChange(sourceLanguage, value, difficultyLevel);
    }
  };

  const handleDifficultyLevelChange = (value: string) => {
    setDifficultyLevel(value);
    if (!errorMessage) {
      triggerOnChange(sourceLanguage, targetLanguage, value);
    }
  };

  const triggerOnChange = (source: string, target: string, level: string) => {
    if (onChange && source !== target) {
      onChange({
        sourceLanguage: source,
        targetLanguage: target,
        difficultyLevel: level,
      });
    }
  };

  // Znajdź wybrany poziom i języki
  const selectedLevel = DIFFICULTY_LEVELS.find(level => level.value === difficultyLevel);
  const sourceLang = LANGUAGES.find(lang => lang.code === sourceLanguage);
  const targetLang = LANGUAGES.find(lang => lang.code === targetLanguage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col gap-3 max-w-2xl mx-auto w-full px-4 md:px-0 mb-6"
    >
      {errorMessage && (
        <ErrorMessage 
          message={errorMessage} 
          onClose={() => setErrorMessage(null)} 
        />
      )}
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Select
            value={sourceLanguage}
            onValueChange={handleSourceLanguageChange}
          >
            <SelectTrigger className={`h-12 bg-black/90 border-[1px] md:border-2 ${errorMessage ? 'border-red-500' : 'border-purple-600'} text-white rounded-md`}>
              <div className="flex items-center justify-center w-full">
                <Globe className={`h-4 w-4 ${errorMessage ? 'text-red-400' : 'text-purple-400'} mr-2`} />
                <span>{sourceLang?.name || "Select source language"}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-black border-[1px] md:border-2 border-purple-600 text-white rounded-md">
              {LANGUAGES.map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.code} 
                  className="hover:bg-purple-900/30 focus:bg-purple-900/30 text-center"
                >
                  <div className="w-full text-center">
                    {language.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRightLeft className={`h-5 w-5 ${errorMessage ? 'text-red-400' : 'text-gray-400'} flex-shrink-0`} />

        <div className="flex-1">
          <Select
            value={targetLanguage}
            onValueChange={handleTargetLanguageChange}
          >
            <SelectTrigger className={`h-12 bg-black/90 border-[1px] md:border-2 ${errorMessage ? 'border-red-500' : 'border-pink-600'} text-white rounded-md`}>
              <div className="flex items-center justify-center w-full">
                <Globe className={`h-4 w-4 ${errorMessage ? 'text-red-400' : 'text-pink-400'} mr-2`} />
                <span>{targetLang?.name || "Select target language"}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-black border-[1px] md:border-2 border-pink-600 text-white rounded-md">
              {LANGUAGES.map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.code} 
                  className="hover:bg-pink-900/30 focus:bg-pink-900/30 text-center"
                >
                  <div className="w-full text-center">
                    {language.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Select
          value={difficultyLevel}
          onValueChange={handleDifficultyLevelChange}
        >
          <SelectTrigger className="h-12 w-full bg-black/90 border-[1px] md:border-2 border-purple-600 text-white rounded-md">
            <div className="flex items-center justify-center w-full">
              <GraduationCap className="h-4 w-4 text-purple-400 mr-1.5" />
              <span className="font-medium">{selectedLevel?.label || "Select difficulty level"}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-black border-[1px] md:border-2 border-purple-600 text-white rounded-md">
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem 
                key={level.value} 
                value={level.value} 
                className="hover:bg-purple-900/30 focus:bg-purple-900/30 py-3 flex items-center justify-center text-center"
              >
                <div className="flex items-center justify-center w-full">
                  <GraduationCap className="h-4 w-4 text-purple-400 mr-1.5" />
                  <span className="font-medium">{level.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
} 