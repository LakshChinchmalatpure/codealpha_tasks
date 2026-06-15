export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage: string;
  pronunciationSpelling: string;
  alternativePhrasings: string[];
  culturalTipOrGrammarNote: string;
}

export interface TranslationHistoryItem {
  id: string;
  text: string;
  sourceLang: string;
  targetLang: string;
  response: TranslationResponse;
  timestamp: number;
  starred: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string; // Optional emoji flag
}
