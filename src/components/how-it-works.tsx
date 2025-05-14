"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageModal } from "./image-modal";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function HowItWorks() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"EN" | "PL" | "ES" | "IT">("EN");

  // Define type for translations
  type TranslationContent = {
    title: string;
    subtitle: string;
    selectNative: string;
    chooseTarget: string;
    pickDifficulty: string;
    describeWhatToLearn: string;
    example1: string;
    example2: string;
    example3: string;
    proTip: string;
    clickToChange: string;
    // Step 2 translations
    step2Title: string;
    step2Subtitle: string;
    multipleChoice: string;
    checkTranslations: string;
    listenPronunciation: string;
    addMoreCards: string;
    filterByLanguage: string;
    trackProgress: string;
    nativeSpeaker: string;
    smartLearning: string;
    contextExamples: string;
    filterDescription: string;
    // Step 3 translations
    step3Title: string;
    step3Subtitle: string;
    seeMastered: string;
    setTargets: string;
    viewCharts: string;
    smartRepetition: string;
    progressAnalytics: string;
    customStudyPlans: string;
    crossDeviceSync: string;
  };
  
  type Translations = {
    EN: TranslationContent;
    PL: TranslationContent;
    ES: TranslationContent;
    IT: TranslationContent;
  };

  // Translation content for different languages
  const translations: Translations = {
    EN: {
      title: "Step 1: Choose & Create",
      subtitle: "Start your language journey in seconds.",
      selectNative: "Select your native language from the left dropdown.",
      chooseTarget: "Choose target language from the right dropdown.",
      pickDifficulty: "Pick flashcard difficulty level.",
      describeWhatToLearn: "Describe what you want to learn - be as specific as you need:",
      example1: "I have a job interview for a software developer position next week",
      example2: "Going to Barcelona, need help ordering food and buying museum tickets",
      example3: "Business meeting phrases for my trip to London",
      proTip: "The more details you provide about your situation, the more personalized and useful your flashcards will be!",
      clickToChange: "Click a language to change the interface language",
      // Step 2 translations
      step2Title: "Step 2: Practice & Learn",
      step2Subtitle: "Master new vocabulary through interactive exercises.",
      multipleChoice: "View your flashcard with 4 multiple-choice options and track your progress.",
      checkTranslations: "Select answers and flip cards to check translations. See your progress for each answer.",
      listenPronunciation: "Listen to correct pronunciation of words and example sentences in both languages.",
      addMoreCards: "Add more flashcards to any existing category with a single click.",
      filterByLanguage: "Filter flashcards by language to focus on what you want to learn.",
      trackProgress: "Track your learning progress with categories for 'Learning' and 'Mastered' items.",
      nativeSpeaker: "Native speaker audio",
      smartLearning: "Smart learning system",
      contextExamples: "Context examples",
      filterDescription: "Filter your flashcards by language or progress status to focus your learning:",
      // Step 3 translations
      step3Title: "Step 3: Track & Improve",
      step3Subtitle: "Monitor your progress and reach your goals faster.",
      seeMastered: "See what you've mastered and what's left to learn.",
      setTargets: "Set daily learning targets that work for you.",
      viewCharts: "View visual progress charts to stay motivated.",
      smartRepetition: "Benefit from smart repetition that adapts to your learning.",
      progressAnalytics: "Progress analytics",
      customStudyPlans: "Custom study plans",
      crossDeviceSync: "Cross-device sync"
    },
    PL: {
      title: "Krok 1: Wybierz i Utwórz",
      subtitle: "Rozpocznij naukę języka w kilka sekund.",
      selectNative: "Wybierz swój język ojczysty z lewej listy rozwijanej.",
      chooseTarget: "Wybierz język docelowy z prawej listy rozwijanej.",
      pickDifficulty: "Wybierz poziom trudności fiszek.",
      describeWhatToLearn: "Opisz, czego chcesz się nauczyć - bądź tak szczegółowy, jak potrzebujesz:",
      example1: "Mam rozmowę kwalifikacyjną na stanowisko programisty w przyszłym tygodniu",
      example2: "Jadę do Barcelony, potrzebuję pomocy przy zamawianiu jedzenia i kupowaniu biletów do muzeum",
      example3: "Zwroty na spotkania biznesowe podczas mojej podróży do Londynu",
      proTip: "Im więcej szczegółów podasz o swojej sytuacji, tym bardziej spersonalizowane i przydatne będą Twoje fiszki!",
      clickToChange: "Kliknij język, aby zmienić język interfejsu",
      // Step 2 translations
      step2Title: "Krok 2: Ćwicz i Ucz się",
      step2Subtitle: "Opanuj nowe słownictwo poprzez interaktywne ćwiczenia.",
      multipleChoice: "Zobacz swoją fiszkę z 4 opcjami wielokrotnego wyboru i śledź swoje postępy.",
      checkTranslations: "Wybieraj odpowiedzi i odwracaj karty, aby sprawdzić tłumaczenia. Zobacz swoje postępy dla każdej odpowiedzi.",
      listenPronunciation: "Posłuchaj poprawnej wymowy słów i przykładowych zdań w obu językach.",
      addMoreCards: "Dodaj więcej fiszek do istniejącej kategorii jednym kliknięciem.",
      filterByLanguage: "Filtruj fiszki według języka, aby skupić się na tym, czego chcesz się nauczyć.",
      trackProgress: "Śledź swoje postępy w nauce z kategoriami 'Uczę się' i 'Opanowane'.",
      nativeSpeaker: "Audio rodzimego mówcy",
      smartLearning: "Inteligentny system nauki",
      contextExamples: "Przykłady kontekstowe",
      filterDescription: "Filtruj fiszki według języka lub postępu nauki, aby skupić się na swojej nauce:",
      // Step 3 translations
      step3Title: "Krok 3: Śledź i Doskonalij",
      step3Subtitle: "Monitoruj swoje postępy i osiągaj cele szybciej.",
      seeMastered: "Zobacz, co już opanowałeś i czego jeszcze musisz się nauczyć.",
      setTargets: "Ustal dzienne cele nauki, które odpowiadają Twoim potrzebom.",
      viewCharts: "Przeglądaj wizualne wykresy postępów, aby zachować motywację.",
      smartRepetition: "Korzystaj z inteligentnego systemu powtórek, który dostosowuje się do Twojej nauki.",
      progressAnalytics: "Analityka postępów",
      customStudyPlans: "Spersonalizowane plany nauki",
      crossDeviceSync: "Synchronizacja między urządzeniami"
    },
    ES: {
      title: "Paso 1: Elige y Crea",
      subtitle: "Comienza tu viaje lingüístico en segundos.",
      selectNative: "Selecciona tu idioma nativo del menú desplegable izquierdo.",
      chooseTarget: "Elige el idioma objetivo del menú desplegable derecho.",
      pickDifficulty: "Selecciona el nivel de dificultad de las tarjetas.",
      describeWhatToLearn: "Describe lo que quieres aprender - sé tan específico como necesites:",
      example1: "Tengo una entrevista de trabajo para un puesto de desarrollador de software la próxima semana",
      example2: "Voy a Barcelona, necesito ayuda para pedir comida y comprar entradas para museos",
      example3: "Frases para reuniones de negocios para mi viaje a Londres",
      proTip: "¡Cuantos más detalles proporciones sobre tu situación, más personalizadas y útiles serán tus tarjetas!",
      clickToChange: "Haz clic en un idioma para cambiar el idioma de la interfaz",
      // Step 2 translations
      step2Title: "Paso 2: Practica y Aprende",
      step2Subtitle: "Domina nuevo vocabulario a través de ejercicios interactivos.",
      multipleChoice: "Visualiza tu tarjeta con 4 opciones de selección múltiple y sigue tu progreso.",
      checkTranslations: "Selecciona respuestas y voltea las tarjetas para verificar traducciones. Observa tu progreso para cada respuesta.",
      listenPronunciation: "Escucha la pronunciación correcta de palabras y oraciones de ejemplo en ambos idiomas.",
      addMoreCards: "Añade más tarjetas a cualquier categoría existente con un solo clic.",
      filterByLanguage: "Filtra las tarjetas por idioma para centrarte en lo que quieres aprender.",
      trackProgress: "Sigue tu progreso de aprendizaje con categorías para elementos 'Aprendiendo' y 'Dominados'.",
      nativeSpeaker: "Audio de hablante nativo",
      smartLearning: "Sistema de aprendizaje inteligente",
      contextExamples: "Ejemplos contextuales",
      filterDescription: "Filtra tus tarjetas por idioma o estado de progreso para concentrarte en tu aprendizaje:",
      // Step 3 translations
      step3Title: "Paso 3: Seguimiento y Mejora",
      step3Subtitle: "Monitoriza tu progreso y alcanza tus objetivos más rápido.",
      seeMastered: "Observa lo que has dominado y lo que te queda por aprender.",
      setTargets: "Establece objetivos diarios de aprendizaje que funcionen para ti.",
      viewCharts: "Visualiza gráficos de progreso para mantenerte motivado.",
      smartRepetition: "Benefíciate de la repetición inteligente que se adapta a tu aprendizaje.",
      progressAnalytics: "Análisis de progreso",
      customStudyPlans: "Planes de estudio personalizados",
      crossDeviceSync: "Sincronización multidispositivo"
    },
    IT: {
      title: "Passo 1: Scegli e Crea",
      subtitle: "Inizia il tuo percorso linguistico in pochi secondi.",
      selectNative: "Seleziona la tua lingua madre dal menu a discesa a sinistra.",
      chooseTarget: "Scegli la lingua di destinazione dal menu a discesa a destra.",
      pickDifficulty: "Scegli il livello di difficoltà delle flashcard.",
      describeWhatToLearn: "Descrivi cosa vuoi imparare - sii specifico quanto necessario:",
      example1: "Ho un colloquio di lavoro per una posizione da sviluppatore software la prossima settimana",
      example2: "Vado a Barcellona, ho bisogno di aiuto per ordinare cibo e comprare biglietti per i musei",
      example3: "Frasi per riunioni d'affari per il mio viaggio a Londra",
      proTip: "Più dettagli fornisci sulla tua situazione, più personalizzate e utili saranno le tue flashcard!",
      clickToChange: "Clicca su una lingua per cambiare la lingua dell'interfaccia",
      // Step 2 translations
      step2Title: "Passo 2: Pratica e Impara",
      step2Subtitle: "Padroneggia nuovo vocabolario attraverso esercizi interattivi.",
      multipleChoice: "Visualizza la tua flashcard con 4 opzioni a scelta multipla e tieni traccia dei tuoi progressi.",
      checkTranslations: "Seleziona le risposte e gira le carte per verificare le traduzioni. Vedi i tuoi progressi per ogni risposta.",
      listenPronunciation: "Ascolta la corretta pronuncia delle parole e frasi di esempio in entrambe le lingue.",
      addMoreCards: "Aggiungi più flashcard a qualsiasi categoria esistente con un solo clic.",
      filterByLanguage: "Filtra le flashcard per lingua per concentrarti su ciò che vuoi imparare.",
      trackProgress: "Tieni traccia dei tuoi progressi di apprendimento con categorie per elementi 'In apprendimento' e 'Padroneggiati'.",
      nativeSpeaker: "Audio di madrelingua",
      smartLearning: "Sistema di apprendimento intelligente",
      contextExamples: "Esempi contestuali",
      filterDescription: "Filtra le tue flashcard per lingua o stato di avanzamento per concentrarti sul tuo apprendimento:",
      // Step 3 translations
      step3Title: "Passo 3: Monitora e Migliora",
      step3Subtitle: "Tieni traccia dei tuoi progressi e raggiungi i tuoi obiettivi più velocemente.",
      seeMastered: "Vedi ciò che hai padroneggiato e ciò che devi ancora imparare.",
      setTargets: "Imposta obiettivi di apprendimento giornalieri adatti a te.",
      viewCharts: "Visualizza grafici di avanzamento per rimanere motivato.",
      smartRepetition: "Approfitta della ripetizione intelligente che si adatta al tuo apprendimento.",
      progressAnalytics: "Analisi dei progressi",
      customStudyPlans: "Piani di studio personalizzati",
      crossDeviceSync: "Sincronizzazione tra dispositivi"
    }
  };

  useEffect(() => {
    // Simple scroll handler that shows button after scrolling down 300px
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLanguageChange = (lang: "EN" | "PL" | "ES" | "IT") => {
    setSelectedLanguage(lang);
  };

  // Get the current language content
  const content = translations[selectedLanguage];

  return (
    <div id="how-it-works" className="relative min-h-screen w-full py-20">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Works
            </span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Learn any language in three simple steps.
          </p>
        </motion.div>

        {/* Step 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 relative"
        >
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500">
                {content.title}
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              {content.subtitle}
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>{content.selectNative}</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>{content.chooseTarget}</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>{content.pickDifficulty}</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  {content.describeWhatToLearn}
                </span>
                <ul className="ml-6 mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2 text-sm">→</span>
                    <span className="italic">
                      &ldquo;{content.example1}&rdquo;
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2 text-sm">→</span>
                    <span className="italic">
                      &ldquo;{content.example2}&rdquo;
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2 text-sm">→</span>
                    <span className="italic">
                      &ldquo;{content.example3}&rdquo;
                    </span>
                  </li>
                </ul>
              </li>
            </ul>

            <div className="mt-8 p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
              <p className="text-purple-200 text-sm">
                <span className="font-semibold">Pro tip:</span> {content.proTip}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => handleLanguageChange("EN")}
                className={`inline-flex items-center px-6 py-2.5 rounded-full transition-all duration-300 ${
                  selectedLanguage === "EN"
                    ? "bg-purple-600 border border-purple-400 text-white shadow-lg shadow-purple-700/30"
                    : "bg-black border border-purple-600 text-white hover:bg-purple-900/30"
                }`}
                title="Switch to English"
                aria-label="Switch to English"
              >
                <span className="font-bold mr-2">EN</span> English
                {selectedLanguage === "EN" && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => handleLanguageChange("PL")}
                className={`inline-flex items-center px-6 py-2.5 rounded-full transition-all duration-300 ${
                  selectedLanguage === "PL"
                    ? "bg-purple-600 border border-purple-400 text-white shadow-lg shadow-purple-700/30"
                    : "bg-black border border-purple-600 text-white hover:bg-purple-900/30"
                }`}
                title="Switch to Polish"
                aria-label="Switch to Polish"
              >
                <span className="font-bold mr-2">PL</span> Polish
                {selectedLanguage === "PL" && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => handleLanguageChange("ES")}
                className={`inline-flex items-center px-6 py-2.5 rounded-full transition-all duration-300 ${
                  selectedLanguage === "ES"
                    ? "bg-purple-600 border border-purple-400 text-white shadow-lg shadow-purple-700/30"
                    : "bg-black border border-purple-600 text-white hover:bg-purple-900/30"
                }`}
                title="Switch to Spanish"
                aria-label="Switch to Spanish"
              >
                <span className="font-bold mr-2">ES</span> Spanish
                {selectedLanguage === "ES" && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => handleLanguageChange("IT")}
                className={`inline-flex items-center px-6 py-2.5 rounded-full transition-all duration-300 ${
                  selectedLanguage === "IT"
                    ? "bg-purple-600 border border-purple-400 text-white shadow-lg shadow-purple-700/30"
                    : "bg-black border border-purple-600 text-white hover:bg-purple-900/30"
                }`}
                title="Switch to Italian"
                aria-label="Switch to Italian"
              >
                <span className="font-bold mr-2">IT</span> Italian
                {selectedLanguage === "IT" && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-purple-400/70">
              {content.clickToChange}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="group inline-block rounded-xl border border-purple-600/40 shadow-lg shadow-purple-900/20 bg-black/40 p-[3px] group-hover:border-purple-500/70 group-hover:shadow-purple-700/30 transition-all duration-300">
              <ImageModal
                src="/step1.png"
                alt="Language Selection"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 relative"
        >
          <div className="flex flex-col items-center justify-center order-2 md:order-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="group inline-block rounded-xl border border-pink-600/40 shadow-lg shadow-pink-900/20 bg-black/40 p-[3px] group-hover:border-pink-500/70 group-hover:shadow-pink-700/30 transition-all duration-300">
                <ImageModal
                  src="/flashcard.png"
                  alt="Flashcard Interaction"
                  className="rounded-lg"
                />
              </div>
              
              <div className="text-center mb-3">
                <p className="text-gray-300 text-sm italic">{content.filterDescription}</p>
              </div>
              
              <div className="flex gap-4">
                <div className="group inline-block w-1/2 rounded-xl border border-pink-600/40 shadow-lg shadow-pink-900/20 bg-black/40 p-[3px] group-hover:border-pink-500/70 group-hover:shadow-pink-700/30 transition-all duration-300">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src="/lang.png" 
                      alt="Language Filter" 
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="group inline-block w-1/2 rounded-xl border border-pink-600/40 shadow-lg shadow-pink-900/20 bg-black/40 p-[3px] group-hover:border-pink-500/70 group-hover:shadow-pink-700/30 transition-all duration-300">
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src="/learn.png" 
                      alt="Progress Filter" 
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-left order-1 md:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-500">
                {content.step2Title}
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              {content.step2Subtitle}
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>{content.multipleChoice}</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>
                  {content.checkTranslations}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>
                  {content.listenPronunciation}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>{content.addMoreCards}</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>{content.filterByLanguage}</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-2 text-xl">•</span>
                <span>{content.trackProgress}</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                {content.nativeSpeaker}
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                {content.smartLearning}
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-pink-600 text-white">
                {content.contextExamples}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16"
        >
          <div className="text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {content.step3Title}
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              {content.step3Subtitle}
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  {content.seeMastered}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>{content.setTargets}</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>{content.viewCharts}</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-xl">•</span>
                <span>
                  {content.smartRepetition}
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                {content.progressAnalytics}
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                {content.customStudyPlans}
              </div>
              <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-black border border-purple-600 text-white">
                {content.crossDeviceSync}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="group inline-block rounded-xl border border-purple-600/40 shadow-lg shadow-purple-900/20 bg-black/40 p-[3px] group-hover:border-purple-500/70 group-hover:shadow-purple-700/30 transition-all duration-300">
              <ImageModal
                src="/progress.png"
                alt="Progress Tracking"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            style={{ bottom: 'calc(15vh)', zIndex: 999 }}
            className="fixed right-6 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 border border-white/10 hover:border-white/20 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
