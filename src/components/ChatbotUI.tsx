import React, { useState, useRef, useEffect } from 'react';
import { Message, FAQItem, MatchResult } from '../types';
import { Send, MessageSquare, ShieldAlert, BarChart2, User } from 'lucide-react';

interface ChatbotUIProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  bestMatches: MatchResult[];
  activeFaqs: FAQItem[];
}

export const ChatbotUI: React.FC<ChatbotUIProps> = ({
  messages,
  onSendMessage,
  bestMatches,
  activeFaqs
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Provide the user with immediate interactive chips of current active questions
  const quickChips = activeFaqs.slice(0, 3).map(faq => {
    const text = faq.question.length > 42 
      ? faq.question.slice(0, 42).trim() + '...' 
      : faq.question;
    return {
      label: text,
      fullQuery: faq.question
    };
  });

  return (
    <div className="bg-[#FDFCFB] border border-[#1A1A1A]/15 shadow-xs flex flex-col h-[520px] overflow-hidden relative">
      {/* Top designer accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4A484]" />

      {/* Header */}
      <div className="bg-[#1A1A1A] px-5 py-4 flex items-center justify-between text-[#FDFCFB] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-[#C4A484] flex items-center justify-center font-bold text-sm text-[#1A1A1A] shadow-xs">
            S.
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#FDFCFB]">Active Sandbox Chatbot</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A484] animate-pulse" />
              <span className="text-[9px] text-[#FDFCFB]/70 font-mono tracking-wide">NLP Matcher Active | Threshold 15%</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] font-mono uppercase tracking-widest text-[#C4A484] bg-neutral-900 px-2 py-1 border border-white/10">
          State Determinism: 1.0
        </div>
      </div>

      {/* Messages scrolling list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F5F2EE]/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="p-3 bg-[#F5F2EE] border border-[#1A1A1A]/10 rounded-full text-[#1A1A1A]/60">
              <MessageSquare className="w-6 h-6 text-[#C4A484]" />
            </div>
            <div>
              <h4 className="text-sm font-serif italic text-[#1A1A1A]">Your NLP Diagnostic Agent is Online</h4>
              <p className="text-xs text-[#1A1A1A]/70 max-w-xs mt-1.5 leading-relaxed">
                Send a diagnostic question. The algorithm will filter stopwords, stem characters, and map cosine weights offline.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-none shrink-0 flex items-center justify-center text-xs font-bold font-mono ${
                  isUser 
                    ? 'bg-[#1A1A1A] text-white' 
                    : 'bg-[#C4A484] text-[#1A1A1A]'
                }`}>
                  {isUser ? <User className="w-3.5 h-3.5" /> : 'S'}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1">
                  <div className={`px-4 py-2.5 text-sm leading-relaxed rounded-none ${
                    isUser 
                      ? 'bg-[#1A1A1A] text-white' 
                      : 'bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] shadow-3xs'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Math Insight beneath Bot bubble */}
                  {!isUser && msg.matchInfo && (
                    <div className="bg-[#F5F2EE] border border-[#1A1A1A]/10 rounded-none p-3.5 text-[11px] text-[#1A1A1A]/90 space-y-2 mt-1">
                      {/* Top status */}
                      <div className="flex items-center justify-between text-[8px] uppercase font-bold tracking-[0.2em] text-[#C4A484] pb-1 border-b border-[#1A1A1A]/5">
                        <span>NLP Metrics Console</span>
                        <span className={`font-mono px-1.5 py-0.5 ${
                          msg.matchInfo.topMatchScore >= 0.15 ? 'text-white bg-[#1A1A1A]' : 'text-red-700 bg-red-50'
                        }`}>
                          Similarity: {(msg.matchInfo.topMatchScore * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* Best question found */}
                      {msg.matchInfo.bestQuestion ? (
                        <div className="text-[#1A1A1A] text-xs">
                          <span className="font-bold text-[8px] uppercase tracking-wide text-[#C4A484]">Matched Intent:</span>
                          <div className="font-serif italic text-[#1A1A1A] mt-0.5">"{msg.matchInfo.bestQuestion}"</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          No Confident Vector Alignment found.
                        </div>
                      )}

                      {/* Mini Similarity Chart Bar */}
                      <div className="space-y-1.5 pt-1.5 border-t border-[#1A1A1A]/10">
                        <div className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                          <BarChart2 className="w-3 h-3 text-[#C4A484]" />
                          Top FAQ Probability Candidate Weights:
                        </div>
                        {msg.matchInfo.matches.slice(0, 3).map((match, i) => {
                          const percent = match.similarity * 100;
                          return (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                              <span className="w-24 truncate text-[#1A1A1A]/70 font-mono text-[9px]" title={match.question}>
                                {match.question}
                              </span>
                              <div className="flex-1 h-1.5 bg-[#EAE7E2] rounded-none overflow-hidden">
                                <div 
                                  className={`h-full ${i === 0 ? 'bg-[#1A1A1A]' : 'bg-[#C4A484]'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="w-8 text-right font-mono text-[9px] font-bold text-[#1A1A1A]">
                                {percent.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggest chips */}
      {quickChips.length > 0 && (
        <div className="px-5 py-2 bg-[#F5F2EE] border-t border-[#1A1A1A]/10 shrink-0 flex flex-wrap gap-1.5 items-center">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#C4A484] self-center mr-1">
            Sandbox Queries:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(chip.fullQuery)}
              className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-white hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#FDFCFB] border border-[#1A1A1A]/15 hover:border-[#1A1A1A] truncate cursor-pointer transition-colors max-w-[170px]"
              title={chip.label}
              id={`quick-chip-${idx}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input container footer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1A1A1A]/10 flex gap-2 shrink-0 bg-white">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`speaker, lock reset, rate limits...`}
          className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#1A1A1A]/15 focus:outline-hidden focus:border-[#1A1A1A] text-[#1A1A1A]"
          id="chat-input-search"
        />
        <button
          type="submit"
          className="bg-[#1A1A1A] hover:bg-[#C4A484] text-[#FDFCFB] hover:text-[#1A1A1A] transition-colors uppercase text-[10px] tracking-widest font-bold px-4 py-2.5 shrink-0 cursor-pointer flex items-center justify-center gap-1"
          id="chat-send-btn"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

