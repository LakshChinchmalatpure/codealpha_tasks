import React, { useState, useEffect, useRef } from "react";
import { 
  Languages, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  ArrowLeftRight, 
  Trash2, 
  Star, 
  BookOpen, 
  Globe, 
  Sparkles, 
  RotateCcw, 
  Search, 
  CheckCheck, 
  Database, 
  TrendingUp,
  Palette,
  Sun,
  Moon,
  Leaf
} from "lucide-react";
import { TranslationResponse, TranslationHistoryItem, Language } from "./types";
import { SOURCE_LANG_OPTIONS, TARGET_LANG_OPTIONS, getSpeechLangCode } from "./languages";

type Theme = "slate-dark" | "nordic-light" | "forest-sage";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("hi");
  
  // Theme Engine state
  const [theme, setTheme] = useState<Theme>("slate-dark");

  // Translation output States
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clipboard copy state feedback
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Speaking state
  const [isSpeakingSource, setIsSpeakingSource] = useState(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState(false);

  // VoiceDictation (Microphone) state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // History state & Stats Analytics state
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyOnlyStarred, setHistoryOnlyStarred] = useState(false);

  // Load history & analytics stats on mount and state changes
  const fetchHistoryFromServer = async () => {
    try {
      const q = `?search=${encodeURIComponent(historySearch)}&onlyStarred=${historyOnlyStarred}`;
      const res = await fetch(`/api/history${q}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to load history from database", e);
    }
  };

  const fetchStatsFromServer = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to pull stats from database", e);
    }
  };

  useEffect(() => {
    fetchHistoryFromServer();
    fetchStatsFromServer();
  }, [historySearch, historyOnlyStarred]);

  // Handle Translate execution
  const handleTranslate = async (textToTranslate = inputText) => {
    const textClean = textToTranslate.trim();
    if (!textClean) {
      setTranslationResult(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textClean,
          sourceLang,
          targetLang,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Translation API request failed.");
      }

      const data = await res.json();
      setTranslationResult(data);

      // Instantly trigger a refresh of history lists and statistics
      fetchHistoryFromServer();
      fetchStatsFromServer();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while calling the translation engine.");
    } finally {
      setIsLoading(false);
    }
  };

  // Implement Global Keyboard Shortcuts helper hook
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd && e.key === "Enter") {
        if (inputText.trim() && !isLoading) {
          e.preventDefault();
          handleTranslate();
        }
      }

      if (isCtrlOrCmd && e.shiftKey && (e.key === "c" || e.key === "C")) {
        if (translationResult?.translatedText) {
          e.preventDefault();
          copyToClipboard(translationResult.translatedText, false);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => {
      window.removeEventListener("keydown", handleGlobalShortcuts);
    };
  }, [inputText, isLoading, translationResult, sourceLang, targetLang]);

  // Keep a small character count helper
  const maxCharCount = 2000;

  // Swap Source & Target Languages
  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
      const detectedCode = translationResult 
        ? TARGET_LANG_OPTIONS.find(l => l.name.toLowerCase() === translationResult.detectedSourceLanguage.toLowerCase())?.code || "en"
        : "en";
      setSourceLang(targetLang);
      setTargetLang(detectedCode);
    } else {
      const tempSrc = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempSrc);
    }

    if (translationResult?.translatedText) {
      const tempText = inputText;
      setInputText(translationResult.translatedText);
      handleTranslate(translationResult.translatedText);
    }
  };

  // Text to Speech
  const speakText = (text: string, langCode: string, isSource: boolean) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSource) {
      if (isSpeakingSource) {
        window.speechSynthesis.cancel();
        setIsSpeakingSource(false);
        return;
      }
      setIsSpeakingSource(true);
      if (isSpeakingTarget) {
        window.speechSynthesis.cancel();
        setIsSpeakingTarget(false);
      }
    } else {
      if (isSpeakingTarget) {
        window.speechSynthesis.cancel();
        setIsSpeakingTarget(false);
        return;
      }
      setIsSpeakingTarget(true);
      if (isSpeakingSource) {
        window.speechSynthesis.cancel();
        setIsSpeakingSource(false);
      }
    }

    const cleanLang = langCode === "auto" && translationResult
      ? TARGET_LANG_OPTIONS.find(l => l.name.toLowerCase() === translationResult.detectedSourceLanguage.toLowerCase())?.code || "en"
      : langCode;

    const speechCode = getSpeechLangCode(cleanLang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;

    utterance.onend = () => {
      if (isSource) setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    utterance.onerror = () => {
      if (isSource) setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Dictation)
  const toggleSpeechRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser. Please try using Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const currentLangCode = sourceLang === "auto" ? "en" : sourceLang;
    recognition.lang = getSpeechLangCode(currentLangCode);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Clipboard Copier helper
  const copyToClipboard = (text: string, isSource: boolean) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      if (isSource) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    }).catch(err => {
      console.warn("Clipboard access failed, using fallback alert", err);
    });
  };

  // Handle Stars toggles on History Items (Persistent Backend Update)
  const toggleStarHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/history/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchHistoryFromServer();
        fetchStatsFromServer();
      }
    } catch (err) {
      console.error("Failed to toggle starred record status:", err);
    }
  };

  // Remove individual history Item (Persistent Backend Delete)
  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchHistoryFromServer();
        fetchStatsFromServer();
      }
    } catch (err) {
      console.error("Failed to remove historical logging:", err);
    }
  };

  // Clear all history logs completely (Persistent Backend Wipe)
  const clearAllHistory = async () => {
    if (confirm("Are you sure you want to clear your persistent translation history? This cannot be undone.")) {
      try {
        const res = await fetch("/api/history", {
          method: "DELETE",
        });
        if (res.ok) {
          fetchHistoryFromServer();
          fetchStatsFromServer();
        }
      } catch (err) {
        console.error("Failed to wipe persistent history logs:", err);
      }
    }
  };

  // Load a historic item into current translate view
  const loadHistoryItem = (item: TranslationHistoryItem) => {
    setInputText(item.text);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setTranslationResult(item.response);
    setError(null);
  };

  // Quick select common language pills helpers
  const quickSourceLanguages = ["auto", "en", "es", "hi", "mr"];
  const quickTargetLanguages = ["hi", "ta", "mr", "en", "es"];

  // Helper theme classes mapping
  const themeClassMap = {
    "slate-dark": {
      outerBg: "bg-[#0A0A0B]",
      sidebarBg: "bg-[#111114] border-[#1F1F24]",
      sidebarText: "text-gray-400",
      sidebarActive: "bg-indigo-505/10 text-indigo-400 border-indigo-500/20",
      mainText: "text-gray-300",
      titleText: "text-white",
      cardBg: "bg-[#111114]",
      cardBorder: "border-white/5",
      btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15",
      btnSecondary: "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10",
      btnSecondaryActive: "bg-indigo-600 text-white",
      outputPanelBg: "bg-white/[0.02]",
      inputText: "text-white placeholder-gray-500",
      statsCardBg: "bg-[#111114] border-white/5",
      headerBg: "bg-[#0C0C0E]/90 border-white/5",
      subHeadText: "text-gray-400"
    },
    "nordic-light": {
      outerBg: "bg-[#F3F4F6]",
      sidebarBg: "bg-white border-gray-250",
      sidebarText: "text-gray-600",
      sidebarActive: "bg-blue-50 text-blue-600 border-blue-200",
      mainText: "text-gray-600",
      titleText: "text-gray-900 border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200 shadow-sm",
      btnPrimary: "bg-blue-600 hover:bg-blue-505 text-white shadow-sm hover:bg-blue-700",
      btnSecondary: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
      btnSecondaryActive: "bg-blue-600 text-white",
      outputPanelBg: "bg-gray-50",
      inputText: "text-gray-900 placeholder-gray-400",
      statsCardBg: "bg-white border-gray-200 shadow-xs",
      headerBg: "bg-white/95 border-gray-200 shadow-xs",
      subHeadText: "text-gray-600"
    },
    "forest-sage": {
      outerBg: "bg-[#ECEFEA]",
      sidebarBg: "bg-[#1F2C23] border-[#2C3F32]",
      sidebarText: "text-stone-300",
      sidebarActive: "bg-emerald-800/20 text-emerald-300 border-emerald-500/20",
      mainText: "text-[#223528]",
      titleText: "text-[#122318]",
      cardBg: "bg-white",
      cardBorder: "border-[#C9D3C5] shadow-xs",
      btnPrimary: "bg-[#2E5A44] hover:bg-[#1E3E2E] text-white shadow-[#1E3E2E]/10",
      btnSecondary: "bg-[#DFE5DD] text-[#223528] border-stone-300 hover:bg-[#D3DCD0]",
      btnSecondaryActive: "bg-[#2E5A44] text-white",
      outputPanelBg: "bg-[#F5F7F4]",
      inputText: "text-[#102416] placeholder-emerald-800/40",
      statsCardBg: "bg-white border-[#C9D3C5] shadow-xs",
      headerBg: "bg-[#E3E8E1]/90 border-[#C9D4C4]",
      subHeadText: "text-emerald-950/80"
    }
  };

  const currentThemeClasses = themeClassMap[theme];

  return (
    <div className={`min-h-screen ${currentThemeClasses.outerBg} ${currentThemeClasses.mainText} font-sans flex overflow-hidden transition-all duration-300`} id="translation-app-container">
      
      {/* 1. Left Sidebar Panels */}
      <aside className={`w-64 ${currentThemeClasses.sidebarBg} border-r flex flex-col shrink-0 hidden lg:flex transition-all duration-300`} id="workspace-sidebar">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
              L
            </div>
            <span className={`font-bold tracking-wider uppercase text-xs ${theme === 'nordic-light' ? 'text-gray-900' : 'text-white'}`}>Translation Tool</span>
          </div>
          
          <nav className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 opacity-80">Supported Systems</p>
              
              <div className={`flex items-center gap-3 p-2.5 rounded-lg border shadow-xs ${currentThemeClasses.sidebarActive}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">Dynamic Translation</span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 text-gray-400 opacity-50 cursor-not-allowed">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">Offline Language Packs</span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 text-gray-400 opacity-50 cursor-not-allowed">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">Document Translation</span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 text-gray-400 opacity-50 cursor-not-allowed">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">Speech Interpreter</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 opacity-80">Regional Scope</p>
              <div className="text-xs font-medium px-2 py-1 flex items-center gap-2">
                <span>🇮🇳</span> All Indian Script Codes
              </div>
              <div className="text-xs font-medium px-2 py-1 flex items-center gap-2">
                <span>🌐</span> Global Standard ISO Map
              </div>
            </div>
          </nav>
        </div>

        {/* Lead Contributor personalization at footer of sidebar */}
        <div className="mt-auto p-6 border-t border-gray-200/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold leading-none select-none">
              LC
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-semibold truncate w-32 ${theme === 'nordic-light' ? 'text-gray-900' : 'text-white'}`} title="Laksh Chinchmalatpure">
                Laksh Chinchmalatpure
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Lead Developer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main content viewport workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto" id="main-scroll-viewport">
        
        {/* Workspace Brand Top Header */}
        <header className={`h-20 px-6 md:px-10 border-b ${currentThemeClasses.headerBg} backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-40 transition-all duration-300`} id="workspace-header">
          <div className="flex flex-col min-w-0">
            <h1 className={`text-base md:text-lg font-medium ${currentThemeClasses.titleText} flex items-center gap-2`}>
              <Languages className="w-5 h-5 text-emerald-500 shrink-0 animate-spin-slow" />
              Language Translation Tool
            </h1>
            <p className={`text-[11px] ${currentThemeClasses.subHeadText} font-medium`}>A real-world high-precision translation engine supporting global & Scheduled Indian languages</p>
          </div>
          
          <div className="flex items-center gap-3">
            
            {/* 3 Themes Switcher controls explicitly requested */}
            <div className="flex items-center gap-1 bg-gray-500/10 p-1.5 rounded-xl border border-gray-400/10 shadow-xs" id="theme-selector-group">
              <Palette className={`w-3.5 h-3.5 mx-1.5 ${theme === 'nordic-light' ? 'text-gray-600' : 'text-gray-400'}`} title="Select Real-World Visual Theme" />
              
              <button 
                onClick={() => setTheme("slate-dark")} 
                title="Obsidian Dark Slate Theme"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'slate-dark' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setTheme("nordic-light")} 
                title="Nordic Snowy Light Theme"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'nordic-light' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => setTheme("forest-sage")} 
                title="Forest Sage Neutral Theme"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'forest-sage' ? 'bg-emerald-800 text-white' : 'text-gray-500 hover:text-emerald-950'}`}
              >
                <Leaf className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-400/20 hidden sm:block"></div>
            <div className={`hidden sm:block text-[11px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full`}>
              AI-Powered Engine
            </div>
          </div>
        </header>

        {/* Scrollable Work bench container */}
        <div className="flex-1 p-4 md:p-8 space-y-8 max-w-6xl w-full mx-auto" id="dashboard-deck">
          
          {/* Project Objective and Details Row */}
          <section className={`border ${currentThemeClasses.cardBg} ${currentThemeClasses.cardBorder} p-6 rounded-2xl relative overflow-hidden transition-all duration-300`} id="task-objective-card">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Resilient Multiple Language Service
            </h2>
            <p className="text-sm leading-relaxed max-w-4xl font-normal">
              Empower global and Indian localized dialects. This enterprise translator leverages unauthenticated <strong>Google Translation API</strong> backbones natively, allowing instant executions locally or on cloud environments without requiring custom credentials. For non-Latin texts, phonetic spelling prompts are auto-assisted.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className={`rounded-xl p-3 border border-gray-400/10 bg-gray-500/[0.03]`}>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Status</p>
                <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  Ready &amp; Fully Synced Localized
                </p>
              </div>
              <div className={`rounded-xl p-3 border border-gray-400/10 bg-gray-500/[0.03]`}>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Supported Languages Map</p>
                <p className={`text-xs font-semibold truncate ${theme === 'nordic-light' ? 'text-gray-900' : 'text-gray-100'}`}>All Indian Scheduled Codes</p>
              </div>
              <div className={`rounded-xl p-3 border border-gray-400/10 bg-gray-500/[0.03]`}>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Backbone RPC API</p>
                <p className={`text-xs font-semibold ${theme === 'nordic-light' ? 'text-gray-900' : 'text-gray-100'}`}>Google Translation API Client</p>
              </div>
              <div className={`rounded-xl p-3 border border-gray-400/10 bg-gray-500/[0.03]`}>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Developer Assigned</p>
                <p className={`text-xs font-semibold truncate ${theme === 'nordic-light' ? 'text-gray-900' : 'text-gray-100'}`} title="Laksh Chinchmalatpure">Laksh Chinchmalatpure</p>
              </div>
            </div>
          </section>

          {/* AI DevOps Analytics stats representation */}
          {stats && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="ai-devops-analytics-desk">
              
              <div className={`${currentThemeClasses.statsCardBg} border p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300`}>
                <div className="space-y-1 z-10">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Total Translation Volume</span>
                  <p className={`text-2xl font-bold font-mono ${theme === 'nordic-light' ? 'text-gray-900' : 'text-white'}`}>{stats.totalTranslations}</p>
                  <p className="text-[10px] text-gray-500">Persistent log records stored</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              <div className={`${currentThemeClasses.statsCardBg} border p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300`}>
                <div className="space-y-1 z-10">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">User Active Work Streak</span>
                  <p className="text-2xl font-bold text-emerald-500 font-mono">
                    {stats.activeStreak} {stats.activeStreak === 1 ? "Day" : "Days"}
                  </p>
                  <p className="text-[10px] text-gray-500">Consecutive usage streak</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className={`${currentThemeClasses.statsCardBg} border p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300`}>
                <div className="space-y-1 z-10">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Linguistic Footprint</span>
                  <p className={`text-2xl font-bold text-cyan-500 font-mono`}>{stats.activeLanguagesCount}</p>
                  <p className="text-[10px] text-gray-500">Active languages parsed in session</p>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className={`${currentThemeClasses.statsCardBg} border p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-[#10B981]/50 transition-all duration-300 md:col-span-2 lg:col-span-1`}>
                <div className="space-y-1 z-10 min-w-0">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-bold">Lexical Highlights</span>
                  <p className={`text-xs font-semibold text-amber-500 font-mono truncate max-w-[180px]`} title={stats.mostTranslatedWords.join(", ")}>
                    {stats.mostTranslatedWords.length > 0 ? stats.mostTranslatedWords.join(", ") : "Reading vocabulary..."}
                  </p>
                  <p className="text-[10px] text-gray-500">Top processed terms in logs</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

            </section>
          )}

          {/* Core Interactive Translation Panel Area */}
          <section className={`${currentThemeClasses.cardBg} border ${currentThemeClasses.cardBorder} rounded-2xl shadow-2xl overflow-hidden transition-all duration-300`} id="workspace-section">
            
            {/* Toolbar Area */}
            <div className={`px-6 py-4 border-b ${currentThemeClasses.cardBorder} bg-gray-500/[0.02] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4`}>
              
              {/* Left Selector (Source Lang) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mr-2">From:</span>
                <div className="flex gap-1 flex-wrap">
                  {quickSourceLanguages.map(code => {
                    const lang = SOURCE_LANG_OPTIONS.find(l => l.code === code);
                    if (!lang) return null;
                    const isSelected = sourceLang === code;
                    return (
                      <button
                        key={code}
                        onClick={() => setSourceLang(code)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          isSelected 
                            ? currentThemeClasses.btnSecondaryActive
                            : currentThemeClasses.btnSecondary
                        }`}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    );
                  })}
                </div>

                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className={`ml-auto md:ml-2 border ${currentThemeClasses.cardBorder} text-xs font-medium rounded-lg px-2.5 py-1 text-gray-650 bg-stone-500/[0.05] focus:outline-hidden focus:ring-1 focus:ring-emerald-500`}
                >
                  <option value="" disabled>Other Options</option>
                  {SOURCE_LANG_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-black">
                      {lang.flag} {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interchange Switch Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapLanguages}
                  disabled={sourceLang === "auto"}
                  title={sourceLang === "auto" ? "Select a direct source language first to exchange" : "Exchange source & target"}
                  className={`p-2.5 rounded-xl border transition-all ${
                    sourceLang === "auto" 
                      ? "bg-transparent text-gray-400 opacity-30 cursor-not-allowed" 
                      : "bg-gray-500/10 text-emerald-500 hover:scale-105 active:scale-95 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                  }`}
                  id="swap-languages-btn"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right Selector (Target Lang) */}
              <div className="flex items-center gap-2 flex-wrap justify-between md:justify-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mr-2">To:</span>
                  <div className="flex gap-1 flex-wrap">
                    {quickTargetLanguages.map(code => {
                      const lang = TARGET_LANG_OPTIONS.find(l => l.code === code);
                      if (!lang) return null;
                      const isSelected = targetLang === code;
                      return (
                        <button
                          key={code}
                          onClick={() => setTargetLang(code)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            isSelected 
                              ? currentThemeClasses.btnSecondaryActive
                              : currentThemeClasses.btnSecondary
                          }`}
                        >
                          {lang.flag} {lang.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className={`ml-auto border ${currentThemeClasses.cardBorder} text-xs font-medium rounded-lg px-2.5 py-1 text-gray-650 bg-stone-500/[0.05] focus:outline-hidden focus:ring-1 focus:ring-emerald-500`}
                >
                  {TARGET_LANG_OPTIONS.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-black">
                      {lang.flag} {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Panel Grids for Input and Output */}
            <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${currentThemeClasses.cardBorder}`}>
              
              {/* Input Component Grid Box */}
              <div className="p-6 flex flex-col justify-between min-h-[340px]">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, maxCharCount))}
                    placeholder="Type or paste context text here. Press 'Translate' to query standard translate systems..."
                    className={`w-full min-h-[230px] border-0 outline-hidden resize-none bg-transparent font-sans text-base leading-relaxed focus:ring-0 focus:outline-hidden ${currentThemeClasses.inputText}`}
                    id="translation-input-textarea"
                  />
                  
                  {inputText && (
                    <button
                      onClick={() => setInputText("")}
                      className="absolute top-0 right-0 p-1.5 rounded-full bg-gray-500/10 text-gray-400 hover:text-red-500 transition-all"
                      title="Clear content"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Left Panel Actions Bottom Footer */}
                <div className="flex items-center justify-between border-t border-gray-400/10 pt-4 mt-4">
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    
                    {/* Speech Recognition Toggle Dictation */}
                    <button
                      onClick={toggleSpeechRecognition}
                      title={isListening ? "Dictation active... click to save recording" : "Dictate speech via microphone"}
                      className={`p-2.5 rounded-xl transition-all border ${
                        isListening
                          ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse"
                          : "bg-gray-500/5 text-emerald-600 border-gray-400/10 hover:bg-gray-500/10"
                      }`}
                      id="mic-dictate-btn"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Speech Synthesis Audio original input text */}
                    <button
                      onClick={() => speakText(inputText, sourceLang, true)}
                      disabled={!inputText.trim()}
                      title="TTS: Read source text on speech synthesizer"
                      className={`p-2.5 rounded-xl transition-all border ${
                        isSpeakingSource
                          ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                          : "bg-gray-500/5 text-gray-500 border-gray-400/10 disabled:opacity-30 hover:bg-gray-500/10 disabled:cursor-not-allowed"
                      }`}
                      id="speak-source-btn"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Direct Clipboard Copy helper with instant feedback label */}
                    <button
                      onClick={() => copyToClipboard(inputText, true)}
                      disabled={!inputText.trim()}
                      title="Copy contents to clipboard"
                      className="p-2.5 rounded-xl bg-gray-500/5 text-gray-500 border border-gray-400/10 disabled:opacity-35 hover:bg-gray-500/10 transition-all disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {copiedInput ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-500 animate-slide-in">Copied!</span>
                        </>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {isListening && (
                      <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase animate-pulse ml-1.5">
                        Listening...
                      </span>
                    )}
                  </div>

                  {/* Character stats & Trigger buttons */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-mono">
                      {inputText.length}/{maxCharCount}
                    </span>
                    
                    <button
                      onClick={() => handleTranslate()}
                      disabled={isLoading || !inputText.trim()}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${currentThemeClasses.btnPrimary}`}
                      id="trigger-translate-btn"
                    >
                      {isLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Translate
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Component Grid Box */}
              <div className={`p-6 flex flex-col justify-between min-h-[340px] ${currentThemeClasses.outputPanelBg}`}>
                
                <div className="relative h-full flex flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse flex-1 py-2" id="skeleton-loader">
                      <div className="h-4 bg-gray-400/10 rounded w-3/4" />
                      <div className="h-4 bg-gray-400/10 rounded w-5/6" />
                      <div className="h-4 bg-gray-400/10 rounded w-1/2" />
                      <div className="pt-4 space-y-2">
                        <div className="h-3 bg-gray-400/10 rounded w-2/3" />
                        <div className="h-3 bg-gray-400/10 rounded w-1/2" />
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 my-2 text-xs flex-1">
                      <h4 className="font-bold mb-1 uppercase tracking-wider">Translation Error</h4>
                      <p className="leading-relaxed opacity-95">{error}</p>
                      <button
                        onClick={() => handleTranslate()}
                        className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-650 text-[10px] font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-red-500/10"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry Translate
                      </button>
                    </div>
                  ) : translationResult ? (
                    <div className="space-y-4 flex-1 animate-fade-in">
                      
                      {/* Language Auto-detect tag indicator */}
                      {sourceLang === "auto" && translationResult.detectedSourceLanguage && (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                          <Globe className="w-3 h-3" />
                          Detected language: {translationResult.detectedSourceLanguage}
                        </div>
                      )}

                      {/* Prime Translation display text output container */}
                      <div className={`text-base leading-relaxed font-normal select-text whitespace-pre-line outline-hidden ${theme === 'nordic-light' ? 'text-gray-900' : 'text-white'}`}>
                        {translationResult.translatedText}
                      </div>

                      {/* Phonetic spelling romanization helpful indicator */}
                      {translationResult.pronunciationSpelling && (
                        <div className="bg-gray-500/[0.04] rounded-xl p-3 border border-gray-400/10">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-450 block mb-1">Speaker Pronunciation Key:</span>
                          <p className="text-xs text-indigo-500 font-mono italic">
                            {translationResult.pronunciationSpelling}
                          </p>
                        </div>
                      )}

                      {/* Nuance & Cultural grammar tip note represent */}
                      {translationResult.culturalTipOrGrammarNote && (
                        <div className="bg-emerald-550/[0.04] border border-emerald-555/10 rounded-xl p-3 text-xs text-emerald-800 flex gap-2.5">
                          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold uppercase text-[9px] tracking-wider text-emerald-600 block mb-0.5">Grammatical Context Usage Note</span>
                            <span className="leading-normal opacity-90">{translationResult.culturalTipOrGrammarNote}</span>
                          </div>
                        </div>
                      )}

                      {/* Alternate phrasing representations if present */}
                      {translationResult.alternativePhrasings && translationResult.alternativePhrasings.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-450 block mb-2">Alternative Phrasings:</span>
                          <div className="flex flex-col gap-1.5">
                            {translationResult.alternativePhrasings.map((phrase, i) => (
                              <div 
                                key={i} 
                                onClick={() => {
                                  setInputText(phrase);
                                  setTranslationResult({
                                    ...translationResult,
                                    translatedText: phrase
                                  });
                                }}
                                title="Click to load this alternative phrasing as active" 
                                className="group text-xs bg-gray-500/[0.03] border border-gray-400/10 rounded-xl py-1.5 px-3 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-between cursor-pointer"
                              >
                                <span className="font-medium italic text-gray-500 group-hover:text-emerald-800 transition-colors">"{phrase}"</span>
                                <span className="text-[9px] font-bold text-gray-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Use Phrasing</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 flex-1 text-gray-400" id="empty-state">
                      <Languages className="w-12 h-12 text-gray-500 opacity-20 mb-3 stroke-1" />
                      <p className="text-xs font-semibold">Output workspace waiting for request</p>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-[280px]">Input text on the left and submit to view immediate translations rendered via secure Google Translation API.</p>
                    </div>
                  )}

                  {/* Output Bottom Actions Panel toolbar */}
                  <div className="flex items-center justify-between border-t border-gray-400/10 pt-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      
                      {/* Speak target translated text audio TTS */}
                      <button
                        onClick={() => speakText(translationResult?.translatedText || "", targetLang, false)}
                        disabled={!translationResult}
                        title="TTS: Speak target language translation aloud"
                        className={`p-2.5 rounded-xl transition-all border ${
                          isSpeakingTarget
                            ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                            : "bg-gray-500/5 text-gray-500 border-gray-400/10 disabled:opacity-30 hover:bg-gray-500/10 disabled:cursor-not-allowed"
                        }`}
                        id="speak-target-btn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Copy output translation with immediate check tags */}
                      <button
                        onClick={() => copyToClipboard(translationResult?.translatedText || "", false)}
                        disabled={!translationResult}
                        title="Copy translated output text"
                        className="p-2.5 rounded-xl bg-gray-500/5 text-gray-500 border border-gray-400/10 disabled:opacity-35 hover:bg-gray-500/10 transition-all disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {copiedOutput ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 animate-slide-in">Copied!</span>
                          </>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <span className="text-[10px] text-gray-400 font-mono tracking-widest font-semibold uppercase">
                      100% Reliable Mode
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* Historical Logs List Shelf */}
          <section className={`${currentThemeClasses.cardBg} border ${currentThemeClasses.cardBorder} rounded-2xl shadow-xl p-6 transition-all duration-300`} id="history-section">
            
            {/* Historical Logs Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-400/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                  <CheckCheck className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Active Workspace Translation History</h3>
                  <p className="text-[11px] text-gray-500">History memories processed by you</p>
                </div>
              </div>

              {/* Clear logs Button */}
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
            </div>

            {/* Logs search and favorites section if items exist */}
            {history.length > 0 && (
              <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3" id="history-filter-shelf">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search past translations..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className={`w-full text-xs border ${currentThemeClasses.cardBorder} rounded-xl pl-9 pr-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${currentThemeClasses.inputText}`}
                  />
                  {historySearch && (
                    <button 
                      onClick={() => setHistorySearch("")}
                      className="text-[9px] font-bold bg-gray-500/20 text-gray-650 rounded-full px-2 py-0.5 absolute right-3 top-2.5 uppercase tracking-wide"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setHistoryOnlyStarred(!historyOnlyStarred)}
                    className={`w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      historyOnlyStarred
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                        : "bg-gray-500/5 border-gray-400/10 text-gray-500 hover:bg-gray-500/10"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${historyOnlyStarred ? "fill-amber-500 text-amber-500" : ""}`} />
                    {historyOnlyStarred ? "Showing Starred Only" : "Show Starred Only"}
                  </button>
                </div>
              </div>
            )}

            {/* List memory cards */}
            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" id="history-items-grid">
                {history.map((item) => {
                  const srcDetails = SOURCE_LANG_OPTIONS.find(l => l.code === item.sourceLang);
                  const targetDetails = TARGET_LANG_OPTIONS.find(l => l.code === item.targetLang);

                  return (
                    <div
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="group border border-gray-400/10 hover:border-emerald-500/30 bg-gray-500/[0.02] hover:bg-emerald-500/[0.02] p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between hover:shadow-md duration-200"
                    >
                      <div>
                        {/* Memory pill indicators */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 bg-gray-500/5 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-500 border border-gray-400/10">
                            <span>{srcDetails?.flag || "🌐"} {srcDetails?.name || "Auto"}</span>
                            <span className="text-gray-400">➔</span>
                            <span>{targetDetails?.flag || "🌐"} {targetDetails?.name}</span>
                          </div>
                          
                          {/* Log card Actions */}
                          <div className="flex items-center gap-1 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Star Toggle */}
                            <button
                              onClick={(e) => toggleStarHistoryItem(item.id, e)}
                              className={`p-1.5 rounded-md transition-colors ${
                                item.starred 
                                  ? "text-amber-500 hover:bg-amber-500/15" 
                                  : "text-gray-400 hover:text-amber-500 hover:bg-gray-500/5"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${item.starred ? "fill-amber-500" : ""}`} />
                            </button>

                            {/* Delete single index item */}
                            <button
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Text values */}
                        <p className={`text-xs font-semibold truncate line-clamp-1 mb-1 ${theme === 'nordic-light' ? 'text-gray-700' : 'text-gray-200'}`}>
                          "{item.text}"
                        </p>
                        <p className="text-xs text-emerald-500 font-bold tracking-tight line-clamp-2 leading-relaxed">
                          {item.response.translatedText}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-400/10 pt-2 mt-3">
                        <span className="text-[9px] text-gray-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] text-emerald-500 font-bold scale-90 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-wider">
                          Restore to Workbench ➔
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-400/10 rounded-xl" id="history-empty block">
                <p className="text-xs font-semibold">Translation logs empty</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Your submitted queries will record securely in local data files.</p>
              </div>
            )}

          </section>

        </div>

        {/* Global Footer info */}
        <footer className="mt-auto py-8 text-center text-[11px] text-gray-500 border-t border-gray-200/10" id="app-footer">
          <p className="font-bold uppercase tracking-widest text-[9px] mb-1">Language Translation Tool v2.0.0</p>
          <p>Created exclusively by <span className="font-semibold text-gray-400">Laksh Chinchmalatpure</span></p>
          <p className="opacity-85 mt-0.5">Powered by local speech synthesis and high-precision secure Google Translation APIs.</p>
        </footer>

      </main>

    </div>
  );
}
