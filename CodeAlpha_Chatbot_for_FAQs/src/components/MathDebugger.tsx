import React, { useState } from 'react';
import { FAQItem, VectorTableEntry, MatchResult } from '../types';
import { ChevronDown, ChevronUp, Calculator, HelpCircle, BarChart3, Layers } from 'lucide-react';

interface MathDebuggerProps {
  vectorEntries: VectorTableEntry[];
  bestMatch: MatchResult | null;
  queryText: string;
  activeTopicName: string;
}

export const MathDebugger: React.FC<MathDebuggerProps> = ({
  vectorEntries,
  bestMatch,
  queryText,
  activeTopicName
}) => {
  const [filterQueryOnly, setFilterQueryOnly] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  // Filter entries to only show terms helper
  const filteredEntries = filterQueryOnly
    ? vectorEntries.filter(entry => entry.queryTF > 0 || (bestMatch && entry.itemTfidf[bestMatch.faq.id] > 0))
    : vectorEntries;

  // Render a visual formula box
  const renderFormulaWalkthrough = () => {
    if (!bestMatch) {
      return (
        <div className="text-center py-8 bg-[#F5F2EE] border border-[#1A1A1A]/10 text-[#1A1A1A]/60 italic text-sm font-serif">
          Awaiting query submissions to compute Cosine Similarity vectors.
        </div>
      );
    }

    const { faq, similarity, queryVectorSize, faqVectorSize, dotProduct, commonTerms } = bestMatch;
    const similarityPercent = (similarity * 100).toFixed(1);

    return (
      <div className="bg-[#F5F2EE] p-5 border border-[#1A1A1A]/10 relative" id="formula-calculation">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-10 font-bold font-sans text-5xl select-none pointer-events-none">
          MATH
        </div>

        <h4 className="text-[10px] font-bold text-[#C4A484] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#C4A484]" />
          Cosine Similarity Algebraic Iteration
        </h4>

        {/* Math equation layout */}
        <div className="bg-white p-5 border border-[#1A1A1A]/10 font-mono text-xs text-[#1A1A1A] space-y-4 mb-4">
          <div className="pb-3 border-b border-dashed border-[#1A1A1A]/10 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-[#1A1A1A] font-sans uppercase tracking-[0.1em] text-[11px]">Primary Formula:</span>
            <span className="bg-[#1A1A1A] text-[#FDFCFB] px-3 py-1 text-[11px] font-bold tracking-wider">
              cos(θ) = ( A • B ) / ( ||A|| × ||B|| )
            </span>
          </div>

          {/* Numerator */}
          <div>
            <div className="text-[#C4A484] text-[9px] uppercase tracking-[0.15em] font-bold mb-1.5">01 / Numerator: Sparse Vector Dot Product (A • B)</div>
            <div className="pl-3 border-l-2 border-[#1A1A1A]">
              {commonTerms.length === 0 ? (
                <span className="text-[#1A1A1A]/60 font-sans italic">0 intersecting dimensional components. Scalar product is 0.</span>
              ) : (
                <>
                  <div className="text-[#1A1A1A] font-semibold text-[11px]">
                    Σ(Query_tfidf × FAQ_tfidf) =
                  </div>
                  <div className="text-[#1A1A1A]/80 flex flex-wrap items-center mt-1 text-[11px] gap-1">
                    {commonTerms.map((term, idx) => (
                      <span key={idx} className="inline-flex items-center">
                        {idx > 0 && <span className="mx-1 text-[#C4A484] font-sans">+</span>}
                        <span className="bg-[#F5F2EE] text-[#1A1A1A] border border-[#1A1A1A]/10 px-1.5 py-0.5 rounded-sm hover:bg-[#C4A484]/10 cursor-help" title={`Term: "${term.term}"`}>
                          ({term.queryVal.toFixed(2)} × {term.faqVal.toFixed(2)})
                        </span>
                      </span>
                    ))}
                    <span className="mx-2 font-bold text-[#1A1A1A] font-sans">=</span>
                    <span className="font-bold text-[#1A1A1A] bg-[#C4A484]/20 font-mono px-2 py-0.5 border border-[#C4A484]/40">
                      {dotProduct.toFixed(3)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Denominator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <div className="text-[#C4A484] text-[9px] uppercase tracking-[0.15em] font-bold mb-1">02 / Query Euclidean Magnitude (||A||)</div>
              <div className="pl-3 border-l-2 border-[#C4A484] text-[#1A1A1A]/75">
                √Σ(Query_tfidf²) = <span className="font-mono font-bold text-[#1A1A1A]">{queryVectorSize.toFixed(3)}</span>
              </div>
            </div>
            <div>
              <div className="text-[#C4A484] text-[9px] uppercase tracking-[0.15em] font-bold mb-1">03 / Target FAQ Euclidean Magnitude (||B||)</div>
              <div className="pl-3 border-l-2 border-[#C4A484] text-[#1A1A1A]/75">
                √Σ(FAQ_tfidf²) = <span className="font-mono font-bold text-[#1A1A1A]">{faqVectorSize.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Division fraction */}
          <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[#C4A484] text-[9px] uppercase tracking-[0.15em] font-bold mb-1">04 / Cosine Quotient Division Quotient</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#1A1A1A]">{dotProduct.toFixed(3)}</span>
                <span className="text-[#C4A484] font-bold">/</span>
                <span className="text-[#1A1A1A]/70">
                  ({queryVectorSize.toFixed(3)} × {faqVectorSize.toFixed(3)})
                </span>
                <span className="font-bold text-[#1A1A1A] font-sans">=</span>
                <span className="font-bold text-[#1A1A1A] bg-[#F5F2EE] px-2.5 py-1 border border-[#1A1A1A]/20">
                  {similarity.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] text-[#FDFCFB] px-6 py-3 font-sans flex flex-col items-center justify-center self-start md:self-auto">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C4A484] font-bold">Similarity Quotient</span>
              <span className="text-xl font-bold font-serif italic mt-0.5">{similarityPercent}%</span>
            </div>
          </div>
        </div>

        {/* Explain words behavior */}
        <div className="text-xs text-[#1A1A1A]/85 bg-white border border-[#1A1A1A]/10 p-4 leading-relaxed flex gap-3">
          <HelpCircle className="w-5 h-5 text-[#C4A484] shrink-0 mt-0.5" />
          <div className="font-sans">
            <strong className="text-[#1A1A1A] font-bold font-serif italic">Mathematical Vector Deduction:</strong>{' '}
            {commonTerms.length > 0 ? (
              <span>
                The search matched since query tokens shared dimensions{' '}
                <span className="font-bold text-[#1A1A1A] font-mono bg-[#F5F2EE] px-1 py-0.2 border border-[#1A1A1A]/5">
                  {commonTerms.map(t => t.term).join(', ')}
                </span>{' '}
                with the collection catalog. Non-stopword terms filtered have weights calculated from our IDF, representing inverse frequency ratios.
              </span>
            ) : (
              <span>
                All active vocabulary elements are orthogonal to the corpus space. Synonyms or keywords such as{' '}
                <span className="font-bold text-[#1A1A1A] font-mono bg-[#F5F2EE] px-1">
                  {vectorEntries.slice(0, 4).map(e => e.term).join(', ')}
                </span>{' '}
                will generate parallel dimension coordinates.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#1A1A1A]/15 shadow-xs mb-8 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />

      {/* Header with expand control */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F5F2EE]/30 border-b border-[#1A1A1A]/10 transition-colors cursor-pointer focus:outline-hidden"
        id="math-debugger-toggle"
      >
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#C4A484]" />
          <div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C4A484] font-bold block">
              Vector Algebra Suite
            </span>
            <h3 className="text-xl font-serif text-[#1A1A1A] italic">
              Vector Dimension & Core Formulas
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
              Dissect real-time Euclidean space, inverse document frequencies, and the active vocabulary dictionary.
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#1A1A1A]/60" /> : <ChevronDown className="w-5 h-5 text-[#1A1A1A]/60" />}
      </button>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Section 1: Mathematical Cosine Calculation */}
          {renderFormulaWalkthrough()}

          {/* Section 2: Unified Vector Table details */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5 font-sans uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-[#C4A484]" />
                  Sparse Matrix Dimensions ({vectorEntries.length} Unique Roots)
                </h4>
                <p className="text-xs text-[#1A1A1A]/60 font-serif italic">
                  Dimensional columns mapping the vocabulary weights against active text targets.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterQueryOnly(true)}
                  className={`px-3 py-1.5 border cursor-pointer font-sans text-[10px] uppercase tracking-wider font-bold transition-all ${
                    filterQueryOnly 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                      : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#F5F2EE]/40'
                  }`}
                >
                  Query Overlaps
                </button>
                <button
                  onClick={() => setFilterQueryOnly(false)}
                  className={`px-3 py-1.5 border cursor-pointer font-sans text-[10px] uppercase tracking-wider font-bold transition-all ${
                    !filterQueryOnly 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                      : 'bg-white border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#F5F2EE]/40'
                  }`}
                >
                  Full Vocab Set
                </button>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#1A1A1A]/20 bg-[#F5F2EE]/30 text-[#1A1A1A]/50 text-xs italic">
                {filterQueryOnly 
                  ? 'No matching intersection found. Click "Full Vocab Set" to audit non-intersecting coordinates.' 
                  : 'The dictionary has no computed stems.'}
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#1A1A1A]/10">
                <table className="w-full text-left border-collapse text-xs bg-white">
                  <thead>
                    <tr className="bg-[#EAE7E2] text-[10px] uppercase font-mono tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A]/10">
                      <th className="px-3 py-2.5 pl-4">Stem Label (t)</th>
                      <th className="px-3 py-2.5 text-center">Smooth IDF</th>
                      <th className="px-3 py-2 text-center bg-[#F5F2EE] border-x border-[#1A1A1A]/10 text-[#1A1A1A]">Query TF</th>
                      <th className="px-3 py-2 text-center bg-[#F5F2EE]/60 border-r border-[#1A1A1A]/10 text-[#1A1A1A]">Query TF-IDF</th>
                      <th className="px-3 py-2 text-center">Match Doc TF</th>
                      <th className="px-3 py-2 text-center pr-4">Match Doc TF-IDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/5 font-mono text-[#1A1A1A]">
                    {filteredEntries.map((entry, idx) => {
                      const isOverlapping = entry.queryTF > 0 && bestMatch && entry.itemTfidf[bestMatch.faq.id] > 0;
                      return (
                        <tr key={idx} className={`hover:bg-[#F5F2EE]/30 ${isOverlapping ? 'bg-[#C4A484]/15' : ''}`}>
                          {/* Term */}
                          <td className="px-3 py-2.5 pl-4 font-bold text-[#1A1A1A]">
                            {entry.term}
                          </td>
                          {/* Smooth IDF */}
                          <td className="px-3 py-2 text-center text-[#1A1A1A]/70">
                            {entry.idf.toFixed(3)}
                          </td>
                          {/* Query TF */}
                          <td className="px-3 py-2 text-center bg-[#F5F2EE]/30 border-x border-[#1A1A1A]/5 font-bold text-[#1A1A1A]">
                            {entry.queryTF}
                          </td>
                          {/* Query TF-IDF */}
                          <td className="px-3 py-2 text-center bg-[#F5F2EE]/60 border-r border-[#1A1A1A]/10 font-bold text-[#1A1A1A]">
                            {entry.queryTfidf.toFixed(3)}
                          </td>
                          {/* Match Doc TF */}
                          <td className="px-3 py-2 text-center text-[#1A1A1A]/70">
                            {bestMatch ? (bestMatch.faq.question.toLowerCase().includes(entry.term) ? 1 : 0) : 0}
                          </td>
                          {/* Match Doc TF-IDF */}
                          <td className="px-3 py-2 text-center text-[#1A1A1A] pr-4 font-bold">
                            {bestMatch ? (entry.itemTfidf[bestMatch.faq.id] || 0).toFixed(3) : '0.000'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

