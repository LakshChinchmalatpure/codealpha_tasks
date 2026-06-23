export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQTopic {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name placeholder
  faqs: FAQItem[];
}

export type TokenStatus = 'normal' | 'stopword' | 'stemmed';

export interface TokenDetail {
  original: string;
  clean: string;
  isStopword: boolean;
  stem: string;
}

export interface NLPResult {
  original: string;
  lowercased: string;
  tokens: TokenDetail[];
  finalTerms: string[];
}

export interface VectorTableEntry {
  term: string;
  faqTermFrequencies: number[]; // TF for each FAQ item in the active list
  idf: number;
  queryTF: number;
  queryTfidf: number;
  itemTfidf: number[]; // TF-IDF for each FAQ item in the active list
}

export interface MatchResult {
  faq: FAQItem;
  similarity: number;
  queryVectorSize: number;
  faqVectorSize: number;
  dotProduct: number;
  commonTerms: { term: string; queryVal: number; faqVal: number }[];
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchInfo?: {
    queryNlp: NLPResult;
    matches: { question: string; similarity: number }[];
    topMatchScore: number;
    bestQuestion?: string;
    bestAnswer?: string;
  };
}
