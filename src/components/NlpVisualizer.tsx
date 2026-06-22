import React from 'react';
import { NLPResult } from '../types';
import { Sparkles } from 'lucide-react';

interface NlpVisualizerProps {
  nlpResult: NLPResult;
  title?: string;
  sub?: string;
}

export const NlpVisualizer: React.FC<NlpVisualizerProps> = ({ 
  nlpResult, 
  title = "NLP Pipeline Analyzer", 
  sub = "Understand how the computer reads human speech step-by-step." 
}) => {
  return (
    <div className="bg-[#FDFCFB] border border-[#1A1A1A]/15 shadow-xs p-6 relative overflow-hidden" id="nlp-pipeline-container">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4A484]" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1A1A1A]/10">
        <div>
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#C4A484] font-bold block mb-1">
            Lexical Inspection Desk
          </span>
          <h3 className="text-2xl font-serif italic text-[#1A1A1A] flex items-center gap-2">
            {title}
          </h3>
          <p className="text-xs text-[#1A1A1A]/60 mt-0.5">{sub}</p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-[#1A1A1A] text-white rounded-none">
          NLP Pipeline
        </span>
      </div>

      {/* Raw input */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A484] mb-2">
          01 / Raw Diagnostic string
        </label>
        <div className="px-5 py-4 bg-[#F5F2EE] border-l-2 border-[#1A1A1A] text-sm text-[#1A1A1A] font-serif italic">
          "{nlpResult.original || "Type something to begin..."}"
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Lowercase Stage */}
        <div className="p-4 bg-[#F5F2EE]/50 border border-[#1A1A1A]/10 relative">
          <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/50 mb-1.5">
            02 / Downcasing & Norm
          </label>
          <p className="text-xs font-mono text-[#1A1A1A] break-all bg-white p-2 border border-[#1A1A1A]/5">
            {nlpResult.lowercased || "–"}
          </p>
          <div className="absolute top-4 right-4 text-[9px] uppercase tracking-wider text-[#C4A484] font-bold">
            Normed
          </div>
        </div>

        {/* Tokenization */}
        <div className="p-4 bg-[#F5F2EE]/50 border border-[#1A1A1A]/10 relative">
          <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/50 mb-1.5">
            03 / Lexical Tokens
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-white p-2 border border-[#1A1A1A]/5">
            {nlpResult.tokens.length > 0 ? (
              nlpResult.tokens.map((tok, i) => (
                <span 
                  key={i} 
                  className="text-[11px] px-2 py-0.5 font-mono bg-[#EAE7E2] hover:bg-[#C4A484]/20 text-[#1A1A1A] transition-colors border border-[#1A1A1A]/10 cursor-help"
                  title={`Original: "${tok.original}"\nCleaned: "${tok.clean}"`}
                >
                  {tok.clean}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#1A1A1A]/40 font-mono italic">Awaiting inputs...</span>
            )}
          </div>
          <div className="absolute top-4 right-4 text-[9px] uppercase tracking-wider text-[#1A1A1A]/60 font-mono">
            {nlpResult.tokens.length} units
          </div>
        </div>
      </div>

      {/* Deep Preprocessing Table */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A484] mb-3">
          04 / Stopword Elimination & Root Stemming
        </label>
        
        {nlpResult.tokens.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#1A1A1A]/20 bg-[#F5F2EE]/40 text-[#1A1A1A]/50 text-xs italic">
            Enter queries above to visualize stopword isolation and lexical root stemming.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1A1A1A]/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EAE7E2] text-[10px] uppercase tracking-wider text-[#1A1A1A]/70 font-mono border-b border-[#1A1A1A]/10">
                  <th className="px-3 py-2 pl-4">Lexeme</th>
                  <th className="px-3 py-2 text-center">Stopword status</th>
                  <th className="px-3 py-2">Porter Stem (Root)</th>
                  <th className="px-3 py-2 text-right pr-4">Search Feature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/5 text-xs bg-white">
                {nlpResult.tokens.map((tok, i) => (
                  <tr key={i} className="hover:bg-[#F5F2EE]/30">
                    <td className="px-3 py-2.5 font-mono font-medium text-[#1A1A1A] pl-4">
                      {tok.clean}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {tok.isStopword ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-transparent text-[#1A1A1A]/45 border border-[#1A1A1A]/20">
                          Stopword
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#C4A484]/15 text-[#1A1A1A] border border-[#C4A484]/40">
                          Retained
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {tok.isStopword ? (
                        <span className="text-[#1A1A1A]/40 italic">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#1A1A1A] font-bold">{tok.stem}</span>
                          {tok.clean !== tok.stem && (
                            <span className="text-[10px] text-[#1A1A1A]/40 line-through">({tok.clean})</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono pr-4">
                      {tok.isStopword ? (
                        <span className="text-[#1A1A1A]/35 italic">Ignored</span>
                      ) : (
                        <span className="text-white font-bold bg-[#1A1A1A] px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {tok.stem}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vocabulary Terms */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A484] mb-2">
          05 / Processed Dimensional Term Vector
        </label>
        <div className="p-4 bg-[#F5F2EE] border border-[#1A1A1A]/10 flex flex-wrap gap-2">
          {nlpResult.finalTerms.length > 0 ? (
            nlpResult.finalTerms.map((term, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold bg-[#1A1A1A] text-white uppercase tracking-wider"
              >
                {term}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#1A1A1A]/60 italic font-serif">
              No useful dimensions extracted (all search tokens are filtered as stopwords).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

