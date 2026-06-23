import { useState, useMemo, useEffect } from 'react';
import { FAQTopic, FAQItem, Message } from './types';
import { PRESET_TOPICS } from './data';
import { TFIDFEngine, preprocessText } from './lib/nlp';
import { ChatbotUI } from './components/ChatbotUI';
import { NlpVisualizer } from './components/NlpVisualizer';
import { FaqManager } from './components/FaqManager';
import { MathDebugger } from './components/MathDebugger';
import { 
  Sparkles, 
  FlaskConical, 
  FileCode,
  BookOpen,
  ArrowRight,
  Activity,
  Bot,
  Database
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [activeTopic, setActiveTopic] = useState<FAQTopic>(PRESET_TOPICS[0]);
  const [customTopics, setCustomTopics] = useState<FAQTopic[]>([]);
  const [activeQueryText, setActiveQueryText] = useState('how to connect smart speaker speaker');
  const [messages, setMessages] = useState<Message[]>([]);

  // Load custom topics from localStorage on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nlp_chatbot_custom_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomTopics(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading custom topics', e);
    }
  }, []);

  // Save custom topics helper
  const handleAddCustomTopic = (newTopic: FAQTopic) => {
    const updated = [...customTopics, newTopic];
    setCustomTopics(updated);
    try {
      localStorage.setItem('nlp_chatbot_custom_topics', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving custom topics', e);
    }
  };

  // Seed initial welcome message on topic change
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Hi! I am your academic NLP assistant for the "${activeTopic.name}" domain. Send me a question and watch me process it in real-time. Or click on one of the quick cards! Try typing: "connect smart speaker" or "reset strip lock".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Seed a standard initial query representing the topic for neat startup math visualizers
    if (activeTopic.faqs.length > 0) {
      const firstQ = activeTopic.faqs[0].question;
      // Make it slightly shorter for clean testing
      setActiveQueryText(firstQ.slice(0, 45).toLowerCase());
    } else {
      setActiveQueryText('');
    }
  }, [activeTopic.id]);

  // Handle active topic FAQs updates (adds/edits/deletes)
  const handleUpdateFaqs = (updatedFaqs: FAQItem[]) => {
    const freshTopic = { ...activeTopic, faqs: updatedFaqs };
    setActiveTopic(freshTopic);

    // If it's a custom topic, persist it in the lists and local storage
    if (activeTopic.id.startsWith('custom')) {
      const freshCustoms = customTopics.map(t => t.id === activeTopic.id ? freshTopic : t);
      setCustomTopics(freshCustoms);
      try {
        localStorage.setItem('nlp_chatbot_custom_topics', JSON.stringify(freshCustoms));
      } catch (e) {
        console.error('Error persisting custom topics', e);
      }
    }
  };

  // 2. Instantiate and compile our TF-IDF & Cosine NLP Engine dynamically
  const engine = useMemo(() => {
    return new TFIDFEngine(activeTopic.faqs);
  }, [activeTopic.faqs]);

  // Compute live vector details & query similarities to pipe into sub-components
  const queryNlpResult = useMemo(() => {
    return preprocessText(activeQueryText);
  }, [activeQueryText]);

  const bestMatches = useMemo(() => {
    return engine.matchQuery(activeQueryText);
  }, [engine, activeQueryText]);

  const vectorEntries = useMemo(() => {
    return engine.getVectorDetails(activeQueryText);
  }, [engine, activeQueryText]);

  const engineStats = useMemo(() => {
    return engine.getStats();
  }, [engine]);

  const bestMatch = bestMatches[0] || null;

  // 3. Dialogue submit handler
  const handleSendMessage = (text: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if the user typed or clicked
    const cleanText = text.trim();
    if (!cleanText) return;

    // A. Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: timestampStr
    };

    // B. Trigger the TF-IDF math metrics for this new question instantly
    setActiveQueryText(cleanText);

    // C. Perform instant corpus matching
    const matches = engine.matchQuery(cleanText);
    const topMatch = matches.length > 0 ? matches[0] : null;

    let replyText = '';
    let replyMatchInfo: Message['matchInfo'] = undefined;

    if (activeTopic.faqs.length === 0) {
      replyText = "My knowledge base is currently empty! Please head down to the 'Corpus Knowledge Base' editor below to add matching FAQ answers.";
    } else if (topMatch && topMatch.similarity >= 0.15) {
      // Confident match! Return registered FAQ answer
      replyText = topMatch.faq.answer;
      replyMatchInfo = {
        queryNlp: preprocessText(cleanText),
        matches: matches.map(m => ({ question: m.faq.question, similarity: m.similarity })),
        topMatchScore: topMatch.similarity,
        bestQuestion: topMatch.faq.question,
        bestAnswer: topMatch.faq.answer
      };
    } else {
      // Low confidence fallback: suggest similar questions
      const suggestions = matches.slice(0, 3).filter(m => m.similarity > 0.02);
      
      if (suggestions.length > 0) {
        replyText = `I analyzed your question but couldn't find a highly confident match. Below are the closest relative questions in my database. Did you mean one of these?`;
      } else {
        replyText = `Sorry, I couldn't find any questions in the "${activeTopic.name}" database related to those terms. Try rephrasing your search or consult the index below.`;
      }

      replyMatchInfo = {
        queryNlp: preprocessText(cleanText),
        matches: matches.map(m => ({ question: m.faq.question, similarity: m.similarity })),
        topMatchScore: topMatch ? topMatch.similarity : 0
      };
    }

    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: timestampStr,
      matchInfo: replyMatchInfo
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#C4A484] selection:text-[#1A1A1A] pb-12 antialiased relative overflow-hidden">
      {/* Background Watermark Emblem */}
      <div className="absolute top-0 right-0 text-[18vw] font-serif italic text-[#1A1A1A]/[0.02] select-none pointer-events-none translate-x-12 -translate-y-12 font-bold leading-none">
        NLP
      </div>

      {/* CLASSIC HIGH-CONTRAST HEADER */}
      <header className="border-b border-[#1A1A1A]/10 sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white rounded-none border border-[#1A1A1A]">
              <span className="font-serif italic font-medium text-lg text-[#C4A484]">Φ</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-serif text-[#1A1A1A] tracking-tight">
                  NLP FAQ <span className="italic text-[#C4A484]">Similarity Sandbox</span>
                </h1>
                <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-[#1F1F1F] text-[#FDFCFB]">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-[#1A1A1A]/60 mt-0.5 font-serif italic font-medium">
                Dissect lexical preprocessing, weight normalizations, and Cosine Vector Similarity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest">
            <div className="bg-[#F5F2EE]/80 px-3 py-1.5 border border-[#1A1A1A]/10 text-[#1A1A1A]">
              SYSTEM CLOCK: <span className="font-bold">2026-06-22</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-10 relative">
        
        {/* TOP LEVEL METRICS BAR */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-dashboard">
          {/* Card 1 */}
          <div className="bg-transparent p-5 border border-[#1A1A1A]/15 relative rounded-none flex items-center justify-between shadow-[2px_2px_0_rgba(26,26,26,0.03)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#C4A484]" />
            <div>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C4A484]">Corpus Documents</p>
              <h3 className="text-lg font-serif italic text-[#1A1A1A] mt-1.5">{engineStats.documentCount} active target{engineStats.documentCount !== 1 ? 's' : ''}</h3>
            </div>
            <div className="p-2 border border-[#1A1A1A]/5 bg-[#F5F2EE] text-[#1A1A1A]/70">
              <Database className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-transparent p-5 border border-[#1A1A1A]/15 relative rounded-none flex items-center justify-between shadow-[2px_2px_0_rgba(26,26,26,0.03)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1A1A1A]" />
            <div>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C4A484]">Lexical Vocabulary</p>
              <h3 className="text-lg font-serif italic text-[#1A1A1A] mt-1.5">{engineStats.vocabularySize} dimensions</h3>
            </div>
            <div className="p-2 border border-[#1A1A1A]/5 bg-[#F5F2EE] text-[#1A1A1A]/70">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-transparent p-5 border border-[#1A1A1A]/15 relative rounded-none flex items-center justify-between shadow-[2px_2px_0_rgba(26,26,26,0.03)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#C4A484]" />
            <div>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C4A484]">Extracted Tokens</p>
              <h3 className="text-lg font-serif italic text-[#1A1A1A] mt-1.5">{engineStats.totalProcessedTokens} lexemes</h3>
            </div>
            <div className="p-2 border border-[#1A1A1A]/5 bg-[#F5F2EE] text-[#1A1A1A]/70">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-transparent p-5 border border-[#1A1A1A]/15 relative rounded-none flex items-center justify-between shadow-[2px_2px_0_rgba(26,26,26,0.03)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1A1A1A]" />
            <div>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C4A484]">Stopwords Dropped</p>
              <h3 className="text-lg font-serif italic text-[#1A1A1A] mt-1.5">{engineStats.stopwordsSavedCount} match-saved</h3>
            </div>
            <div className="p-2 border border-[#1A1A1A]/5 bg-[#F5F2EE] text-[#1A1A1A]/70">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* WORKSPACE DUAL PANELS PANEL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel- Chat UI: 5 columns */}
          <div className="lg:col-span-5 flex flex-col">
            <ChatbotUI 
              messages={messages}
              onSendMessage={handleSendMessage}
              bestMatches={bestMatches}
              activeFaqs={activeTopic.faqs}
            />
          </div>

          {/* Right panel- NLP Preprocessor details: 7 columns */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <NlpVisualizer 
              nlpResult={queryNlpResult}
              title={`Tokenizer Pipeline: Query Analysis`}
              sub={`Interactive dissection of: "${activeQueryText || 'empty user input'}"`}
            />
          </div>
        </section>

        {/* MATHEMATICAL VECTOR MATRIX DEBUGGER */}
        <section>
          <MathDebugger 
            vectorEntries={vectorEntries}
            bestMatch={bestMatch}
            queryText={activeQueryText}
            activeTopicName={activeTopic.name}
          />
        </section>

        {/* FAQS VECTOR SEED CORPUS EDITOR */}
        <section>
          <FaqManager 
            activeTopic={activeTopic}
            onTopicChange={setActiveTopic}
            onUpdateFaqs={handleUpdateFaqs}
            customTopics={customTopics}
            onAddCustomTopic={handleAddCustomTopic}
          />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-[#1A1A1A]/10 bg-[#F5F2EE]/40 py-10 text-center text-xs text-[#1A1A1A]/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-serif italic text-left max-w-xl">
            © 2026 NLP FAQ Similarity Sandbox. Engineered with local TF-IDF matrices, offline stemmers, and cosine scalar calculations. No data is shared externally.
          </p>
          <div className="flex gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest bg-white border border-[#1A1A1A]/10 px-3 py-1 select-none text-[#1A1A1A]/70">
              Determinism: 1.0 (Exact Vector Math)
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest bg-white border border-[#1A1A1A]/10 px-3 py-1 select-none text-[#1A1A1A]/70">
              Model: Cosine Similarity
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
