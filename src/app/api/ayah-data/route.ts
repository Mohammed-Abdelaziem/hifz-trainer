import { getOrFetchAyahData } from "@/lib/server/ayah-data";
import { VALID_RECITER_IDS } from "@/lib/quran/reciters";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const verseKey = params.get("verseKey") ?? "";
    if (!/^\d{1,3}:\d{1,3}$/.test(verseKey)) {
      return Response.json({ error: "verseKey must match 'surah:ayah'" }, { status: 400 });
    }

    let reciterId = Number(params.get("reciter") ?? "");
    if (!Number.isInteger(reciterId) || !VALID_RECITER_IDS.has(reciterId)) {
      reciterId = VALID_RECITER_IDS.has(7) ? 7 : [...VALID_RECITER_IDS][0];
    }

    console.log("[/api/ayah-data] GET", { verseKey, reciterId });
    const data = await getOrFetchAyahData(verseKey, reciterId);
    console.log("[/api/ayah-data] result", {
      verseKey,
      wordCount: data.words.length,
      hasRecitationUrl: Boolean(data.recitationUrl),
      recitationUrl: data.recitationUrl,
      source: data.source,
    });
    return Response.json(data);
  } catch (err) {
    console.error("[/api/ayah-data]", err);
    return Response.json({ error: "Failed to fetch ayah data" }, { status: 502 });
  }
}
