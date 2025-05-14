"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { useLanguage } from "@/shared/language-context";

export default function PrivacyPolicy() {
  const { language, translations } = useLanguage();
  const t = translations.privacyPolicy[language];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 pl-0 text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t.backHome}
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              {t.title}
            </h1>
            
            <div className="space-y-8 text-gray-300">
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.intro.title}</h2>
                <p>{t.intro.content}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.dataCollection.title}</h2>
                <p>{t.dataCollection.content}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium text-purple-300">{t.dataCollection.accountData}:</span> {t.dataCollection.accountDataDesc}
                  </li>
                  <li>
                    <span className="font-medium text-purple-300">{t.dataCollection.userContent}:</span> {t.dataCollection.userContentDesc}
                  </li>
                  <li>
                    <span className="font-medium text-purple-300">{t.dataCollection.tempData}:</span> {t.dataCollection.tempDataDesc}
                  </li>
                </ul>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.cookies.title}</h2>
                <p>{t.cookies.content}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium text-purple-300">{t.cookies.necessaryCookies}:</span> {t.cookies.necessaryCookiesDesc}
                  </li>
                  <li>
                    <span className="font-medium text-purple-300">{t.cookies.localStorageTitle}:</span> {t.cookies.localStorageDesc}
                  </li>
                </ul>
                <p>{t.cookies.noCookies}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.externalServices.title}</h2>
                <p>{t.externalServices.content}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-medium text-purple-300">{t.externalServices.clerk}:</span> {t.externalServices.clerkDesc}
                  </li>
                  <li>
                    <span className="font-medium text-purple-300">{t.externalServices.openai}:</span> {t.externalServices.openaiDesc}
                  </li>
                  <li>
                    <span className="font-medium text-purple-300">{t.externalServices.vercel}:</span> {t.externalServices.vercelDesc}
                  </li>
                </ul>
                <p>{t.externalServices.policy}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.dataStorage.title}</h2>
                <p>{t.dataStorage.accountData}</p>
                <p>{t.dataStorage.guestData}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.changes.title}</h2>
                <p>{t.changes.content}</p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{t.contact.title}</h2>
                <p>{t.contact.content}</p>
                <p>
                  {t.contact.email}: <Link href="mailto:contact@flashcardsai.com" className="text-purple-400 hover:text-purple-300">contact@flashcardsai.com</Link>
                </p>
              </section>
              
              <section className="pt-4">
                <p className="text-sm text-gray-500">
                  {t.lastUpdate}: {new Date().toLocaleDateString()}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 