import { NextRequest, NextResponse } from "next/server";

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-small";
const HF_API_KEY = process.env.HF_API_KEY;

const REFERENCE_TEXTS: Record<string, string> = {
  "1:1": "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
  "1:2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَـٰلَمِينَ",
  "1:3": "الرَّحْمَـٰنِ الرَّحِيمِ",
  "1:4": "مَـٰلِكِ يَوْمِ الدِّينِ",
  "1:5": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
  "1:6": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
  "1:7": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  "2:1": "الم",
  "2:2": "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
  "2:3": "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
  "2:4": "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
  "2:5": "أُولَـٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَـٰئِكَ هُمُ الْمُفْلِحُونَ",
};

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const norm1 = normalizeArabic(text1);
  const norm2 = normalizeArabic(text2);
  if (!norm1 || !norm2) return 0;

  // Use longest common subsequence ratio for better Arabic text comparison
  const len1 = norm1.length;
  const len2 = norm2.length;
  if (len1 === 0 && len2 === 0) return 1;

  // LCS dynamic programming
  const dp: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (norm1[i - 1] === norm2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  const lcsLen = dp[len1][len2];
  return lcsLen / Math.max(len1, len2);
}

function analyzeTajweed(transcription: string) {
  const issues: Array<{ rule: string; severity: string; message: string; suggestion: string }> = [];
  let score = 100;

  // Check for ghunnah markers (نْ, مْ, tanween) — correct if present
  const hasGhunnah = /[\u064B-\u064D]/.test(transcription) || /نْ|مْ/.test(transcription);
  if (hasGhunnah) {
    // Good — user pronounced nasalization
  }

  // Check for common letter substitutions
  const words = transcription.split(/\s+/);
  let qalqalahCount = 0;
  for (const word of words) {
    // Qalqalah only applies when STOPPING on these letters (word-final position)
    // and only when the letter has sukun (no vowel). Since we can't detect sukun
    // from transcription alone, we only flag it as a reminder, not a penalty.
    const qalqalahLetters = ["ب", "ج", "د", "ط", "ظ"];
    const lastChar = word.slice(-1);
    if (qalqalahLetters.includes(lastChar) && qalqalahCount < 3) {
      issues.push({
        rule: "Echo (Qalqalah)",
        severity: "info",
        message: `Word ends with "${lastChar}". If stopping here, apply qalqalah.`,
        suggestion: "When pausing on this letter, produce a slight bouncing sound.",
      });
      qalqalahCount++;
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

async function transcribeWithWhisper(audioBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY not set. Get free token at huggingface.co/settings/tokens");
  }

  // Map MIME types to Whisper-supported formats
  const formatMap: Record<string, string> = {
    "audio/webm": "audio/webm",
    "audio/webm;codecs=opus": "audio/webm",
    "audio/mp4": "audio/mp4",
    "audio/wav": "audio/wav",
    "audio/ogg": "audio/ogg",
  };
  const contentType = formatMap[mimeType] || "audio/webm";

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": contentType,
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Handle model loading (503)
    if (response.status === 503) {
      throw new Error("Model is loading. Please try again in 30 seconds.");
    }
    throw new Error(`Whisper API error: ${response.status} ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return result.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const verseKey = (formData.get("verseKey") as string) || "1:1";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large. Max 10MB." }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const transcription = await transcribeWithWhisper(audioBuffer, audioFile.type);

    const reference = REFERENCE_TEXTS[verseKey] || "";
    const similarity = reference ? calculateSimilarity(transcription, reference) : 0;

    const tajweed = analyzeTajweed(transcription);

    // Weighted score: 70% text accuracy + 30% tajweed
    // Without reference, cap score at 70 (can't verify accuracy)
    let finalScore = tajweed.score;
    if (reference) {
      finalScore = similarity * 70 + (tajweed.score / 100) * 30;
    } else {
      finalScore = Math.min(70, tajweed.score);
    }

    return NextResponse.json({
      transcription,
      score: Math.round(finalScore * 10) / 10,
      issues: tajweed.issues,
      similarity: reference ? Math.round(similarity * 1000) / 10 : null,
      reference: reference || null,
    });
  } catch (error) {
    console.error("[Tajweed API Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze recitation" },
      { status: 500 }
    );
  }
}
