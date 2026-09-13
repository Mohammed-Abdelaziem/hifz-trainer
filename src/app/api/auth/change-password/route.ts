import { getSessionUser, hashPassword, verifyPassword, revokeAllSessions, createSession } from "@/lib/server/auth";
import { getDbWithTest } from "@/lib/db";

export const dynamic = "force-dynamic";

function isStrongPassword(pw: string): boolean {
  if (pw.length < 12 || pw.length > 128) return false;
  let categories = 0;
  if (/[A-Z]/.test(pw)) categories++;
  if (/[a-z]/.test(pw)) categories++;
  if (/[0-9]/.test(pw)) categories++;
  if (/[^A-Za-z0-9]/.test(pw)) categories++;
  return categories >= 3;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof oldPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: "New passwords do not match." }, { status: 400 });
    }

    if (!isStrongPassword(newPassword)) {
      return Response.json({ error: "Password must be 12+ characters with at least 3 of: uppercase, lowercase, digit, symbol." }, { status: 400 });
    }

    const db = await getDbWithTest();
    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser?.passwordHash) return Response.json({ error: "No password set for this account." }, { status: 400 });

    if (!(await verifyPassword(oldPassword, fullUser.passwordHash))) {
      return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash, lastPasswordChangedAt: new Date() },
    });
    await revokeAllSessions(user.id);
    await createSession(user.id);

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[/api/auth/change-password]", err);
    return Response.json({ error: "Failed to change password" }, { status: 500 });
  }
}
