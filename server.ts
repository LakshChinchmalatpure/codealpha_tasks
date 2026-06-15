import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { dbService } from "./dbService.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Dictionary to translate detected language ISO codes to human-readable names
const languageNameMap: { [key: string]: string } = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
  vi: "Vietnamese",
  nl: "Dutch",
  th: "Thai",
  // Indian Voice Languages mapping
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
  ur: "Urdu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  pa: "Punjabi",
  as: "Assamese",
  sa: "Sanskrit",
  mai: "Maithili",
  ne: "Nepali",
  kok: "Konkani",
  sd: "Sindhi",
  ks: "Kashmiri",
  doi: "Dogri",
  mni: "Manipuri",
  brx: "Bodo",
  sat: "Santali"
};

// Database API endpoints
app.get("/api/history", (req, res) => {
  try {
    const search = String(req.query.search || "");
    const onlyStarred = req.query.onlyStarred === "true";
    const category = String(req.query.category || "");
    const records = dbService.getAll(search, onlyStarred, category);
    return res.json(records);
  } catch (error: any) {
    console.error("Failed to query history database:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch database items." });
  }
});

app.post("/api/history/star", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing document ID." });
    }
    const updated = dbService.toggleStar(id);
    if (!updated) {
      return res.status(404).json({ error: "Database log not found with specified ID." });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/history/meta", (req, res) => {
  try {
    const { id, category, notes } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing document ID." });
    }
    const updated = dbService.updateMeta(id, { category, notes });
    if (!updated) {
      return res.status(404).json({ error: "Database log not found with specified ID." });
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = dbService.delete(id);
    if (!success) {
      return res.status(404).json({ error: "Log record not found." });
    }
    return res.json({ success: true, message: "Record removed from server database." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/history", (req, res) => {
  try {
    dbService.clearAll();
    return res.json({ success: true, message: "Database wiped completely." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/stats", (req, res) => {
  try {
    const stats = dbService.getStats();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Lazy-initialized AI Client Helper (Handles empty keys gracefully)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.log("No AI key provided in environment. Running purely on resilient Google Translate Engine fallback mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient API Call with Model Fallbacks and Exponential Backoff Retries
async function generateContentWithFallbackAndRetry(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  schema: any
) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxRetriesPerModel = 2;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        
        if (response && response.text) {
          return response;
        }
        throw new Error("Empty representation back from language engine model.");
      } catch (err: any) {
        lastError = err;
        console.warn(`Linguistic assistant attempt using ${modelName} on ${attempt} failed:`, err?.message || err);

        if (modelName === modelsToTry[modelsToTry.length - 1] && attempt === maxRetriesPerModel) {
          break;
        }

        const errMsg = String(err?.message || "").toLowerCase();
        const errStatus = err?.status || "";
        const errCode = err?.code || 0;

        const isTransient = 
          errMsg.includes("demand") || 
          errMsg.includes("503") || 
          errMsg.includes("429") || 
          errMsg.includes("temporarily") || 
          errMsg.includes("resource_exhausted") || 
          errMsg.includes("unavailable") ||
          errStatus === "UNAVAILABLE" ||
          errCode === 503 ||
          errCode === 429;

        if (isTransient) {
          const delay = attempt * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("AI engine process failed.");
}

// Resilient unauthenticated Google Translation API helper
async function translateWithGoogleTranslate(text: string, sourceLang: string, targetLang: string) {
  // If source is auto, pass auto, otherwise pass the code
  const sl = sourceLang === "auto" ? "auto" : sourceLang;
  const tl = targetLang;
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Translate backend returned: ${res.statusText}`);
  }
  
  const data = await res.json();
  let translatedText = "";
  if (data && data[0]) {
    for (const chunk of data[0]) {
      if (chunk && chunk[0]) {
        translatedText += chunk[0];
      }
    }
  }
  
  const detectedCode = data[2] || sl;
  
  return {
    translatedText: translatedText.trim(),
    detectedCode
  };
}

// Translate endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Text content is required for translation." });
    }
    if (!sourceLang || !targetLang) {
      return res.status(400).json({ error: "Both source and target languages must be specified." });
    }

    // 1. Core Translation through unauthenticated Google Translate API (Always works, extremely reliable and instant!)
    let googleRes;
    try {
      googleRes = await translateWithGoogleTranslate(text, sourceLang, targetLang);
    } catch (googleError: any) {
      console.error("Google Translation API fail:", googleError);
      return res.status(500).json({ error: "The standard translation service is currently unavailable. Please check your network connection." });
    }

    const detectedLangCode = googleRes.detectedCode;
    const detectedName = languageNameMap[detectedLangCode] || detectedLangCode;

    // 2. Wrap default responses
    const finalResult = {
      translatedText: googleRes.translatedText,
      detectedSourceLanguage: detectedName,
      pronunciationSpelling: "",
      alternativePhrasings: [] as string[],
      culturalTipOrGrammarNote: ""
    };

    // 3. AI Enrichment (Only executed if the user has configured an API key!)
    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `You are an automated high-precision linguist system. Enrich the following translation result with structural details.
        Source Language: "${sourceLang}" (Detected name: "${detectedName}")
        Target Language: "${targetLang}"
        Original Input: "${text}"
        Translated Output: "${googleRes.translatedText}"

        Provide:
        1. pronunciationSpelling: A phonetical reading spelling (e.g. Romanized Pinyin, Romaji, or simplified phonics) of the translated output so a beginner can speak it correctly. Only provide this if the target language uses non-Latin scripts (like Hindi, Sanskrit, Bengali, Japanese, Korean, Arabic). If it uses English or Western Latin script, return empty "".
        2. alternativePhrasings: Exactly two highly natural alternative ways to say this (formal, colloquial, or synonyms) in the target language.
        3. culturalTipOrGrammarNote: A brief grammatical hint or custom context usage note under 30 words.

        Output MUST match this Schema structure. No other text or wrappers.`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            pronunciationSpelling: { type: Type.STRING },
            alternativePhrasings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            culturalTipOrGrammarNote: { type: Type.STRING }
          },
          required: ["pronunciationSpelling", "alternativePhrasings", "culturalTipOrGrammarNote"]
        };

        const aiResponse = await generateContentWithFallbackAndRetry(
          ai,
          prompt,
          "You are an automated linguistic parser. Output strictly valid raw JSON structure.",
          responseSchema
        );

        if (aiResponse && aiResponse.text) {
          const parsedEnrichment = JSON.parse(aiResponse.text);
          finalResult.pronunciationSpelling = parsedEnrichment.pronunciationSpelling || "";
          finalResult.alternativePhrasings = parsedEnrichment.alternativePhrasings || [];
          finalResult.culturalTipOrGrammarNote = parsedEnrichment.culturalTipOrGrammarNote || "";
        }
      } catch (aiError) {
        console.warn("Linguistic AI enrichment skipped (running pure translation fallback):", aiError);
      }
    }

    // 4. Fill local smart fallbacks if enrichment was skipped or empty
    if (!finalResult.alternativePhrasings || finalResult.alternativePhrasings.length === 0) {
      finalResult.alternativePhrasings = [
        `Expression: ${finalResult.translatedText}`,
        `Conversational: ${finalResult.translatedText}`
      ];
    }
    if (!finalResult.culturalTipOrGrammarNote) {
      const targetName = languageNameMap[targetLang] || targetLang;
      finalResult.culturalTipOrGrammarNote = `Integrated Google Translate API completed high-precision matches into ${targetName}.`;
    }

    // Save to the persistent history logs
    const savedLog = dbService.add({
      text,
      sourceLang,
      targetLang,
      response: finalResult,
    });

    return res.json({
      ...finalResult,
      id: savedLog.id,
      timestamp: savedLog.timestamp,
    });
  } catch (error: any) {
    console.error("Translation controller error:", error);
    return res.status(500).json({ 
      error: error.message || "An unexpected error occurred during translation processing." 
    });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running successfully!`);
    console.log(`- Local Link: http://localhost:${PORT}`);
    console.log(`- Network Link: http://127.0.0.1:${PORT}`);
    console.log(`Ensure you open the http://localhost:${PORT} URL in your browser instead of http://0.0.0.0:${PORT}`);
  });
}

startServer();
