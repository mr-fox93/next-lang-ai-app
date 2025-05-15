"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { useRouter, Link } from '@/i18n/navigation';
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function TermsOfService() {
  const router = useRouter();
  const t = useTranslations('Terms');
  const [formattedDate, setFormattedDate] = useState("");
  
  // Ustawiamy datę tylko po stronie klienta, aby uniknąć błędu hydratacji
  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
  }, []);
  
  const goBack = () => {
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 pl-0 text-gray-400 hover:text-white"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('backHome')}
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              {t('title')}
            </h1>
            
            <div className="space-y-8 text-gray-300">
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('intro.title')}</h2>
                <p>{t('intro.content')}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('accounts.title')}</h2>
                <p>{t('accounts.content')}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('allowedUse.title')}</h2>
                <p>{t('allowedUse.content')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('allowedUse.item1')}</li>
                  <li>{t('allowedUse.item2')}</li>
                  <li>{t('allowedUse.item3')}</li>
                </ul>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('userContent.title')}</h2>
                <p>{t('userContent.content')}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('changes.title')}</h2>
                <p>{t('changes.content')}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t('contact.title')}</h2>
                <p>{t('contact.content')}</p>
                <p>
                  {t('contact.email')}: <Link href="mailto:contact@flashcardsai.com" className="text-purple-400 hover:text-purple-300">contact@flashcardsai.com</Link>
                </p>
              </section>
              
              <section className="pt-4">
                <p className="text-sm text-gray-500">
                  {t('lastUpdate')}: {formattedDate}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 