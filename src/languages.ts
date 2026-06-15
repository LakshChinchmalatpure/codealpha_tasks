import { Language } from "./types";

export const SUPPORTED_LANGUAGES: Language[] = [
  // Global Major Languages
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },

  // All Scheduled and Popular Indian Languages
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളம்", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", flag: "🇮🇳" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", flag: "🇮🇳" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇮🇳" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", flag: "🇮🇳" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "🇮🇳" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲशुर", flag: "🇮🇳" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", flag: "🇮🇳" },
  { code: "mni", name: "Manipuri", nativeName: "Meitei", flag: "🇮🇳" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो", flag: "🇮🇳" },
  { code: "sat", name: "Santali", nativeName: "संताली", flag: "🇮🇳" }
];

export const SOURCE_LANG_OPTIONS: Language[] = [
  { code: "auto", name: "Detect Language", nativeName: "Auto-Detect", flag: "🌐" },
  ...SUPPORTED_LANGUAGES
];

export const TARGET_LANG_OPTIONS: Language[] = SUPPORTED_LANGUAGES;

// Attempt to find speaker speech language code matching a standard language code
export function getSpeechLangCode(langCode: string): string {
  const mapping: { [key: string]: string } = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    ko: "ko-KR",
    ar: "ar-SA",
    pt: "pt-PT",
    ru: "ru-RU",
    tr: "tr-TR",
    vi: "vi-VN",
    nl: "nl-NL",
    th: "th-TH",
    // Indian voice maps
    hi: "hi-IN",
    bn: "bn-IN",
    te: "te-IN",
    mr: "mr-IN",
    ta: "ta-IN",
    ur: "ur-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    or: "or-IN",
    pa: "pa-IN",
    as: "as-IN",
    sa: "sa-IN",
    ne: "ne-NP"
  };
  return mapping[langCode] || langCode;
}
