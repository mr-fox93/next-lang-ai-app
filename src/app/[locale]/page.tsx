import { setRequestLocale } from 'next-intl/server';
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Navbar from "@/components/navbar";
import { SparklesCore } from "@/components/sparkles";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-black antialiased relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-[5]">
        <Navbar />
        <div className="relative z-[1]">
          <Hero />
          <HowItWorks />
        </div>
      </div>
    </main>
  );
} 