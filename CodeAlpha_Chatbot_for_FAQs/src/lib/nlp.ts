import { FAQItem, TokenDetail, NLPResult, VectorTableEntry, MatchResult } from '../types';

// Standard English stopwords list used in academic and NLP packages
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot',
  'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed',
  'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i',
  'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more',
  'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell',
  'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed',
  'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while',
  'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre',
  'youve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Lightweight Porter-stemmer approximation for educational display and vocabulary matching.
 * This handles common English rules like plurals, gerunds, adverbials, and common noun/adjective suffixes.
 */
export function stemWord(word: string): string {
  if (word.length <= 2) return word;

  let stem = word;

  // 1. Plural forms & Y conversion
  if (stem.endsWith('sses')) {
    stem = stem.slice(0, -2); // successes -> success
  } else if (stem.endsWith('ies')) {
    stem = stem.slice(0, -3) + 'i'; // studies -> studi
  } else if (stem.endsWith('ss')) {
    // Keep ss (e.g., progress, access)
  } else if (stem.endsWith('s') && !stem.endsWith('us') && !stem.endsWith('is') && !stem.endsWith('as')) {
    stem = stem.slice(0, -1); // skills -> skill
  }

  // Double stem check for Y conversion
  if (stem.endsWith('y') && stem.length > 3) {
    // Check if vowel precedes (e.g. key, play -> keep y, but study -> studi)
    const precedesVowel = /[aeiou]/.test(stem.charAt(stem.length - 2));
    if (!precedesVowel) {
      stem = stem.slice(0, -1) + 'i';
    }
  }

  // 2. Continuous/Completed verb suffix stripping
  if (stem.endsWith('eed')) {
    if (stem.length > 4) stem = stem.slice(0, -1); // agreed -> agree
  } else if (stem.endsWith('ing')) {
    stem = stem.slice(0, -3); // cleaning -> clean
    // double consonant reduction (e.g. running -> runn -> run)
    if (stem.length > 3 && stem.charAt(stem.length - 1) === stem.charAt(stem.length - 2)) {
      const char = stem.charAt(stem.length - 1);
      if (['n', 't', 'p', 'd', 'g', 'm'].includes(char)) {
        stem = stem.slice(0, -1);
      }
    }
    // Handle silent e recovery (e.g. create -> creating -> creat -> create)
    if (['creat', 'clos', 'updat', 'manag', 'remov', 'integr', 'us', 'sav'].includes(stem)) {
      stem += 'e';
    }
  } else if (stem.endsWith('ed')) {
    stem = stem.slice(0, -2); // loved -> lov or matched -> match
    if (stem.endsWith('at') || stem.endsWith('bl') || stem.endsWith('iz')) {
      stem += 'e'; // create, enable, tokenize
    } else if (stem.length > 3 && stem.charAt(stem.length - 1) === stem.charAt(stem.length - 2)) {
      stem = stem.slice(0, -1); // skipped -> skipp -> skip
    }
  }

  // 3. Suffix clean-ups
  if (stem.endsWith('ational')) {
    stem = stem.slice(0, -7) + 'ate'; // relational -> relate
  } else if (stem.endsWith('tional')) {
    stem = stem.slice(0, -6) + 'tion'; // conditional -> condition
  } else if (stem.endsWith('izer')) {
    stem = stem.slice(0, -1); // organizer -> organize
  } else if (stem.endsWith('ly')) {
    stem = stem.slice(0, -2); // friendly -> friend, easily -> easi
  } else if (stem.endsWith('fulness')) {
    stem = stem.slice(0, -4); // helpfulness -> help
  } else if (stem.endsWith('ness')) {
    stem = stem.slice(0, -4); // brightness -> bright
  } else if (stem.endsWith('ment') && stem.length > 5) {
    stem = stem.slice(0, -4); // management -> manage
  } else if (stem.endsWith('ive') && stem.length > 5) {
    // Keep active, but strip if verb root (e.g., interactive -> interact)
    if (stem.endsWith('ative')) {
      stem = stem.slice(0, -5);
    }
  }

  return stem;
}

/**
 * Preprocesses a sentence by cleaning, tokenizing, filtering stopwords, and stemming.
 * Retains high precision debug tracking for visualization.
 */
export function preprocessText(text: string): NLPResult {
  const lowercased = text.toLowerCase();
  
  // Regex finding alphanumeric words (skipping standalone special chars)
  const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()?"'’[\]\\+]/g;
  const rawWords = lowercased.split(/[\s\-_]+/);

  const tokens: TokenDetail[] = [];
  const finalTerms: string[] = [];

  for (const raw of rawWords) {
    // Strip punctuation from word
    const cleaned = raw.replace(punctuationRegex, '').trim();
    if (!cleaned) continue;

    const isStop = STOPWORDS.has(cleaned);
    const stem = isStop ? '' : stemWord(cleaned);

    tokens.push({
      original: raw,
      clean: cleaned,
      isStopword: isStop,
      stem: stem
    });

    if (!isStop) {
      finalTerms.push(stem);
    }
  }

  return {
    original: text,
    lowercased,
    tokens,
    finalTerms
  };
}

/**
 * Class to manage and calculate TF-IDF and Cosine Similarity over an FAQ Corpus
 */
export class TFIDFEngine {
  private faqs: FAQItem[] = [];
  private faqNlps: NLPResult[] = [];
  private vocabulary: string[] = []; // All unique stemmed terms in the corpus
  private idfs: { [term: string]: number } = {};
  private docVectors: number[][] = []; // TF-IDF representation of each FAQ card

  constructor(faqs: FAQItem[]) {
    this.updateCorpus(faqs);
  }

  /**
   * Refreshes the vocabulary, TFs, IDFs, and document vectors when the corpus changes.
   */
  public updateCorpus(faqs: FAQItem[]) {
    this.faqs = faqs;
    this.faqNlps = faqs.map(faq => preprocessText(faq.question));
    
    // 1. Compile Unique Vocabulary
    const vocabSet = new Set<string>();
    this.faqNlps.forEach(nlp => {
      nlp.finalTerms.forEach(term => vocabSet.add(term));
    });
    this.vocabulary = Array.from(vocabSet).sort();

    const N = faqs.length;

    // 2. Compute IDF for each vocabulary term
    // IDF(t) = ln(1 + (N / (1 + DF(t)))) + 1  (Smoothed to avoid division by zero and negative values)
    this.vocabulary.forEach(term => {
      const documentFrequency = this.faqNlps.filter(nlp => nlp.finalTerms.includes(term)).length;
      this.idfs[term] = Math.log(1 + (N / (1 + documentFrequency))) + 1;
    });

    // 3. Compute TF-IDF Vectors for Documents
    this.docVectors = this.faqNlps.map(nlp => {
      // Calculate raw term frequencies in this document
      const docTermCounts: { [term: string]: number } = {};
      nlp.finalTerms.forEach(term => {
        docTermCounts[term] = (docTermCounts[term] || 0) + 1;
      });

      // Map to the vocabulary space
      return this.vocabulary.map(term => {
        const tf = docTermCounts[term] || 0;
        const idf = this.idfs[term] || 0;
        return tf * idf;
      });
    });
  }

  /**
   * Translates a user query into the active vector space and scores all FAQs.
   */
  public matchQuery(queryText: string): MatchResult[] {
    if (this.faqs.length === 0) return [];

    const queryNlp = preprocessText(queryText);
    
    // 1. Calculate Query TF-IDF vector
    const queryTermCounts: { [term: string]: number } = {};
    queryNlp.finalTerms.forEach(term => {
      queryTermCounts[term] = (queryTermCounts[term] || 0) + 1;
    });

    const queryVector = this.vocabulary.map(term => {
      const tf = queryTermCounts[term] || 0;
      const idf = this.idfs[term] || 0;
      return tf * idf;
    });

    const queryMagnitude = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));

    // 2. Score similarity with each FAQ's vector using the cosine formula
    const results: MatchResult[] = this.faqs.map((faq, idx) => {
      const docVector = this.docVectors[idx];
      const docMagnitude = Math.sqrt(docVector.reduce((sum, val) => sum + val * val, 0));

      // Dot product: sum of Q_i * D_i
      let dotProduct = 0;
      const commonTerms: { term: string; queryVal: number; faqVal: number }[] = [];

      this.vocabulary.forEach((term, index) => {
        const qVal = queryVector[index];
        const dVal = docVector[index];
        if (qVal > 0 && dVal > 0) {
          dotProduct += qVal * dVal;
          commonTerms.push({
            term,
            queryVal: qVal,
            faqVal: dVal
          });
        }
      });

      // Cosine similarity
      const similarity = (queryMagnitude > 0 && docMagnitude > 0) 
        ? dotProduct / (queryMagnitude * docMagnitude)
        : 0;

      return {
        faq,
        similarity,
        queryVectorSize: queryMagnitude,
        faqVectorSize: docMagnitude,
        dotProduct,
        commonTerms: commonTerms.sort((a,b) => (b.queryVal * b.faqVal) - (a.queryVal * a.faqVal))
      };
    });

    // Sort by descending similarity score
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generates full vocabulary metadata table details for academic display
   */
  public getVectorDetails(queryText: string): VectorTableEntry[] {
    const queryNlp = preprocessText(queryText);
    const queryTermCounts: { [term: string]: number } = {};
    queryNlp.finalTerms.forEach(term => {
      queryTermCounts[term] = (queryTermCounts[term] || 0) + 1;
    });

    return this.vocabulary.map((term, index) => {
      const queryTF = queryTermCounts[term] || 0;
      const idf = this.idfs[term] || 0;
      const queryTfidf = queryTF * idf;

      const faqTermFrequencies = this.faqNlps.map(nlp => {
        return nlp.finalTerms.filter(t => t === term).length;
      });

      const itemTfidf = this.docVectors.map(vec => vec[index]);

      return {
        term,
        faqTermFrequencies,
        idf,
        queryTF,
        queryTfidf,
        itemTfidf
      };
    });
  }

  /**
   * Diagnostic summary statistics of the corpus
   */
  public getStats() {
    return {
      documentCount: this.faqs.length,
      vocabularySize: this.vocabulary.length,
      stopwordsSavedCount: this.faqNlps.reduce((sum, nlp) => sum + nlp.tokens.filter(t => t.isStopword).length, 0),
      totalProcessedTokens: this.faqNlps.reduce((sum, nlp) => sum + nlp.finalTerms.length, 0)
    };
  }
}
