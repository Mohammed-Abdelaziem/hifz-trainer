import { NextRequest, NextResponse } from "next/server";

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-small";
const HF_API_KEY = process.env.HF_API_KEY; // Free tier key from huggingface.co/settings/tokens

// Reference Quran text for comparison
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
  const chars1 = new Set(norm1);
  const chars2 = new Set(norm2);
  const intersection = new Set([...chars1].filter((c) => chars2.has(c)));
  const union = new Set([...chars1, ...chars2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function analyzeTajweed(transcription: string, duration: number) {
  const issues: Array<{ rule: string; severity: string; message: string; suggestion: string }> = [];
  let score = 100;

  const words = transcription.split(/\s+/);
  const avgWordDuration = duration / Math.max(words.length, 1);

  if (avgWordDuration < 0.3) {
    issues.push({
      rule: "Elongation (Madd)",
      severity: "warning",
      message: "Recitation may be too fast. Elongations need proper duration.",
      suggestion: "Slow down and extend vowel sounds.",
    });
    score -= 10;
  } else if (avgWordDuration > 2.0) {
    issues.push({
      rule: "Elongation (Madd)",
      severity: "info",
      message: "Recitation may be too slow.",
      suggestion: "Maintain a natural pace while keeping elongations correct.",
    });
    score -= 5;
  }

  const qalqalahLetters = ["ب", "ج", "د", "ط", "ظ"];
  for (const word of words) {
    if (word && qalqalahLetters.includes(word.slice(-1))) {
      issues.push({
        rule: "Echo (Qalqalah)",
        severity: "info",
        message: `Qalqalah letter detected at end of word. Ensure bouncing sound.`,
        suggestion: "Apply qalqalah when stopping on this letter.",
      });
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

async function transcribeWithWhisper(audioBuffer: ArrayBuffer): Promise<string> {
  if (!HF_API_KEY) {
    throw new Error("HF_API_KEY not set. Get free token at huggingface.co/settings/tokens");
  }

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
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

    // Convert File to ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Transcribe with Whisper
    const transcription = await transcribeWithWhisper(audioBuffer);

    // Get duration (estimate from file size, or use a default)
    const duration = audioFile.size / 16000; // rough estimate for webm

    // Compare with reference
    const reference = REFERENCE_TEXTS[verseKey] || "";
    const similarity = reference ? calculateSimilarity(transcription, reference) : 0;

    // Analyze tajweed
    const tajweed = analyzeTajweed(transcription, duration);

    // Adjust score based on similarity
    let finalScore = tajweed.score;
    if (reference) {
      finalScore = (tajweed.score + similarity * 100) / 2;
    }

    return NextResponse.json({
      transcription,
      score: Math.round(finalScore * 10) / 10,
      issues: tajweed.issues,
      duration: Math.round(duration * 10) / 10,
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
