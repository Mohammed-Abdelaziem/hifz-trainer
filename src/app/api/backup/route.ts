import { getSessionUser } from "@/lib/server/auth";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  exportUserBackup,
  importUserBackup,
  type BackupProfile,
  type ExportedMemoryState,
} from "@/lib/server/backup-service";

export const dynamic = "force-dynamic";
export { BACKUP_FORMAT, BACKUP_VERSION };
export type { BackupProfile, ExportedMemoryState };

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const backup = await exportUserBackup(user.id);
    return Response.json(backup, {
      headers: { "Content-Disposition": `attachment; filename="wholly-quran-backup.json"` },
    });
  } catch (err) {
    console.error("[/api/backup]", err);
    return Response.json({ error: "Failed to export backup" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as
      | { format?: unknown; version?: unknown; profile?: unknown; memoryStates?: unknown }
      | null;
    if (!body) return Response.json({ error: "Invalid JSON body" }, { status: 400 });

    const result = await importUserBackup(user.id, body);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  } catch (err) {
    console.error("[/api/backup]", err);
    return Response.json({ error: "Failed to import backup" }, { status: 500 });
  }
}
