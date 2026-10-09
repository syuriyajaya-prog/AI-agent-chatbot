// Direct sub-module imports to avoid triggering natural's SentimentAnalyzer require('afinn-165') ESM issue in Vercel/serverless environments
// eslint-disable-next-line
const { TfIdf } = require('natural/lib/natural/tfidf');
// eslint-disable-next-line
const { WordTokenizer } = require('natural/lib/natural/tokenizers');

// Common English stopwords
const DEFAULT_STOPWORDS = [
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
];

const STOPWORDS = new Set([
  ...DEFAULT_STOPWORDS,
  'and', 'the', 'is', 'in', 'at', 'of', 'a', 'an', 'to', 'for', 'with', 'on', 'as',
  'by', 'this', 'that', 'it', 'from', 'or', 'be', 'are', 'was', 'were', 'will',
  'have', 'has', 'had', 'been', 'can', 'could', 'should', 'would', 'do', 'does',
  'did', 'their', 'our', 'my', 'your', 'his', 'her', 'its', 'they', 'we', 'you',
  'i', 'me', 'us', 'him', 'them', 'about', 'above', 'after', 'again', 'against',
  'all', 'am', 'any', 'because', 'before', 'being', 'below', 'between', 'both',
  'but', 'down', 'during', 'each', 'few', 'further', 'here', 'how', 'if', 'into',
  'just', 'more', 'most', 'no', 'nor', 'not', 'off', 'once', 'only', 'other',
  'out', 'over', 'own', 'same', 'so', 'some', 'such', 'than', 'too', 'under',
  'until', 'up', 'very', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'also', 'etc', 'including', 'responsible', 'duties', 'work', 'working'
]);

/**
 * Preprocesses raw text by lowercasing, stripping punctuation, and removing stopwords.
 */
export function preprocessText(text: string): string[] {
  if (!text) return [];

  // Lowercase and strip punctuation
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ') // Keep technical symbols like c++, c#, .net
    .replace(/\s+/g, ' ');

  // Tokenize using natural WordTokenizer or regex fallback
  let tokens: string[] = [];
  try {
    const tokenizer = new WordTokenizer();
    tokens = tokenizer.tokenize(cleaned) || [];
  } catch (e) {
    tokens = cleaned.split(/\s+/);
  }

  // Filter stopwords and short tokens
  return tokens
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Computes TF-IDF vector cosine similarity between job description text and resume text.
 * Returns a normalized score between 0 and 100.
 */
export function computeTfIdfCosineSimilarity(
  jobDescription: string,
  resumeText: string
): {
  similarityScore: number;
  matchedTokens: string[];
  jobTokensCount: number;
  resumeTokensCount: number;
} {
  const jobTokens = preprocessText(jobDescription);
  const resumeTokens = preprocessText(resumeText);

  if (jobTokens.length === 0 || resumeTokens.length === 0) {
    return {
      similarityScore: 0,
      matchedTokens: [],
      jobTokensCount: jobTokens.length,
      resumeTokensCount: resumeTokens.length,
    };
  }

  // Create Natural TfIdf instance
  const tfidf = new TfIdf();

  // Doc 0: Job Description
  tfidf.addDocument(jobTokens);
  // Doc 1: Resume
  tfidf.addDocument(resumeTokens);

  // Collect unique vocabulary
  const vocabSet = new Set<string>([...jobTokens, ...resumeTokens]);
  const vocab = Array.from(vocabSet);

  // Build TF-IDF vectors for both documents
  const jobVector: number[] = [];
  const resumeVector: number[] = [];
  const matchedTokens: string[] = [];

  vocab.forEach(term => {
    let jobWeight = 0;
    let resumeWeight = 0;

    tfidf.tfidfs(term, (docIndex: number, measure: number) => {
      if (docIndex === 0) jobWeight = measure;
      if (docIndex === 1) resumeWeight = measure;
    });

    jobVector.push(jobWeight);
    resumeVector.push(resumeWeight);

    if (jobWeight > 0 && resumeWeight > 0) {
      matchedTokens.push(term);
    }
  });

  // Calculate Cosine Similarity
  let dotProduct = 0;
  let jobMagnitudeSq = 0;
  let resumeMagnitudeSq = 0;

  for (let i = 0; i < vocab.length; i++) {
    dotProduct += jobVector[i] * resumeVector[i];
    jobMagnitudeSq += jobVector[i] * jobVector[i];
    resumeMagnitudeSq += resumeVector[i] * resumeVector[i];
  }

  const magnitude = Math.sqrt(jobMagnitudeSq) * Math.sqrt(resumeMagnitudeSq);
  const rawCosine = magnitude > 0 ? dotProduct / magnitude : 0;

  // Keyword overlap ratio
  const jobUniqueWords = new Set(jobTokens);
  const matchedUniqueWords = new Set(matchedTokens);
  const overlapRatio = jobUniqueWords.size > 0
    ? matchedUniqueWords.size / jobUniqueWords.size
    : 0;

  // Calibrate score for HR relevance:
  // Combines TF-IDF cosine similarity (60% weight) and key concept coverage ratio (40% weight)
  // Scaled non-linearly to reflect realistic candidate evaluation
  const blendedRatio = (rawCosine * 0.65) + (overlapRatio * 0.35);

  // Power scaling for intuitive HR percentage distribution:
  // e.g. 0.50 overlap yields ~70-75%, 0.70 overlap yields ~88-92%
  const normalizedScore = Math.min(98, Math.max(12, Math.round(Math.pow(blendedRatio, 0.75) * 105)));

  return {
    similarityScore: normalizedScore,
    matchedTokens: Array.from(matchedUniqueWords).slice(0, 15),
    jobTokensCount: jobTokens.length,
    resumeTokensCount: resumeTokens.length,
  };
}

/**
 * Determines recommendation category based on score thresholds:
 * 75-100: Highly Recommended
 * 55-74: Recommended
 * 35-54: Consider
 * 0-34: Not Recommended
 */
export function getRecommendationForScore(score: number): 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended' {
  if (score >= 75) return 'Highly Recommended';
  if (score >= 55) return 'Recommended';
  if (score >= 35) return 'Consider';
  return 'Not Recommended';
}
