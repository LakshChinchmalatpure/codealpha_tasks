import fs from "fs";
import path from "path";

export interface TranslationHistoryItem {
  id: string;
  text: string;
  sourceLang: string;
  targetLang: string;
  response: {
    translatedText: string;
    detectedSourceLanguage: string;
    pronunciationSpelling?: string;
    alternativePhrasings?: string[];
    culturalTipOrGrammarNote?: string;
  };
  timestamp: number;
  starred: boolean;
  category?: string;
  notes?: string;
}

export interface AnalyticsStats {
  totalTranslations: number;
  totalStarred: number;
  activeLanguagesCount: number;
  mostTranslatedWords: string[];
  recentActivityTrend: { date: string; count: number }[];
  languagesUsed: { language: string; count: number; direction: string }[];
  averageLength: number;
  activeStreak: number;
}

const DB_FILE_PATH = path.join(process.cwd(), "lingoflow_db.json");

// Helper to load db with recovery fallback
function loadDatabase(): TranslationHistoryItem[] {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(raw) as TranslationHistoryItem[];
  } catch (err) {
    console.error("Database read error. Re-initializing empty records:", err);
    return [];
  }
}

// Helper to save db atomically
function saveDatabase(data: TranslationHistoryItem[]): void {
  try {
    // Save to temp file first, then rename, preventing file corruption on high loads
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, DB_FILE_PATH);
  } catch (err) {
    console.error("Critical: Failed to save database:", err);
  }
}

export const dbService = {
  // Get all items, sorted by timestamp desc
  getAll(search = "", onlyStarred = false, category = ""): TranslationHistoryItem[] {
    let list = loadDatabase();

    if (onlyStarred) {
      list = list.filter((item) => item.starred);
    }

    if (category) {
      list = list.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.response.translatedText.toLowerCase().includes(q) ||
          (item.response.culturalTipOrGrammarNote || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  },

  // Add a translation log
  add(item: Omit<TranslationHistoryItem, "id" | "timestamp" | "starred">): TranslationHistoryItem {
    const list = loadDatabase();
    
    const newItem: TranslationHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      starred: false,
    };

    // Prevent direct consecutive identical queries
    const lastItem = list[0];
    if (
      lastItem &&
      lastItem.text.toLowerCase() === newItem.text.toLowerCase() &&
      lastItem.sourceLang === newItem.sourceLang &&
      lastItem.targetLang === newItem.targetLang
    ) {
      return lastItem;
    }

    list.unshift(newItem);
    // Keep a maximum of 200 items in full persistent database
    saveDatabase(list.slice(0, 200));
    return newItem;
  },

  // Toggle starred status
  toggleStar(id: string): TranslationHistoryItem | null {
    const list = loadDatabase();
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return null;

    list[index].starred = !list[index].starred;
    saveDatabase(list);
    return list[index];
  },

  // Update notes/categories
  updateMeta(id: string, updates: { category?: string; notes?: string }): TranslationHistoryItem | null {
    const list = loadDatabase();
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
    };
    saveDatabase(list);
    return list[index];
  },

  // Delete single translation
  delete(id: string): boolean {
    const list = loadDatabase();
    const originalLength = list.length;
    const filtered = list.filter((x) => x.id !== id);
    
    if (filtered.length !== originalLength) {
      saveDatabase(filtered);
      return true;
    }
    return false;
  },

  // Clear all items successfully
  clearAll(): void {
    saveDatabase([]);
  },

  // Analytics Engine - Generates dynamic diagnostic values like a fully-fledged business app
  getStats(): AnalyticsStats {
    const list = loadDatabase();
    
    // 1. Total & Stars
    const totalTranslations = list.length;
    const totalStarred = list.filter((x) => x.starred).length;

    // 2. Active languages list
    const activeLangs = new Set<string>();
    const langCounts: { [key: string]: { count: number; code: string; directions: Set<string> } } = {};
    
    list.forEach((item) => {
      activeLangs.add(item.targetLang);
      if (item.sourceLang !== "auto") {
        activeLangs.add(item.sourceLang);
      }

      const dirKey = `${item.sourceLang} ➔ ${item.targetLang}`;
      if (!langCounts[item.targetLang]) {
        langCounts[item.targetLang] = { count: 0, code: item.targetLang, directions: new Set() };
      }
      langCounts[item.targetLang].count += 1;
      langCounts[item.targetLang].directions.add(dirKey);
    });

    const languagesUsed = Object.values(langCounts).map((val) => ({
      language: val.code.toUpperCase(),
      count: val.count,
      direction: Array.from(val.directions).slice(0, 2).join(", "),
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // 3. Most translated top terms (individual words)
    const wordCleanReg = /[^a-zA-Z\d\s\u00C0-\u00FF\u0100-\u017F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g; // Unicode support for CJVK / international
    const wordOccurrences: { [key: string]: number } = {};
    list.forEach((item) => {
      const words = item.text
        .replace(wordCleanReg, "")
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3); // match substantial words only
      words.forEach((w) => {
        wordOccurrences[w] = (wordOccurrences[w] || 0) + 1;
      });
    });

    const mostTranslatedWords = Object.entries(wordOccurrences)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .slice(0, 5);

    // 4. Calculate Average text lengths
    const totalLen = list.reduce((acc, curr) => acc + curr.text.length, 0);
    const averageLength = totalTranslations > 0 ? Math.round(totalLen / totalTranslations) : 0;

    // 5. Recent Activity Trend (for chart displays)
    const trendMap: { [date: string]: number } = {};
    const msInDay = 24 * 60 * 60 * 1000;
    
    // Fill the last 7 days automatically with 0
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * msInDay).toLocaleDateString([], { month: "short", day: "numeric" });
      trendMap[dateStr] = 0;
    }

    list.forEach((item) => {
      const dateStr = new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
      if (dateStr in trendMap) {
        trendMap[dateStr] += 1;
      }
    });

    const recentActivityTrend = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    }));

    // 6. Streaks
    let activeStreak = 0;
    const uniqueDates = new Set(
      list.map((item) => new Date(item.timestamp).toDateString())
    );
    
    let checkDate = new Date();
    while (uniqueDates.has(checkDate.toDateString())) {
      activeStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      totalTranslations,
      totalStarred,
      activeLanguagesCount: activeLangs.size,
      mostTranslatedWords,
      recentActivityTrend,
      languagesUsed,
      averageLength,
      activeStreak,
    };
  },
};
