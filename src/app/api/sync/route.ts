import { getSessionUser } from "@/lib/server/auth";
import { getSyncStatus, syncFullQuran } from "@/lib/server/quran-sync";
import { bulkWarmAyahData } from "@/lib/server/ayah-data";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    return Response.json(await getSyncStatus());
  } catch (err) {
    console.error("[/api/sync GET]", err);
    return Response.json({ error: "Failed to read sync status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const scope = new URL(req.url).searchParams.get("scope");
    if (scope === "words") {
      const limitRaw = Number(new URL(req.url).searchParams.get("limit") ?? "");
      const limit =
        Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(2000, Math.floor(limitRaw)) : 500;
      const report = await bulkWarmAyahData(limit);
      return Response.json({ ok: true, scope: "words", ...report });
    }

    const report = await syncFullQuran();
    return Response.json(report, { status: report.ok ? 200 : 502 });
  } catch (err) {
    console.error("[/api/sync POST]", err);
    return Response.json({ error: "Sync failed unexpectedly" }, { status: 500 });
  }
}
