import { getSessionUser, hashPassword, verifyPassword, revokeAllSessions, createSession } from "@/lib/server/auth";
import { isStrongPassword, PASSWORD_RULES_MESSAGE } from "@/lib/server/password";
import { getDbWithTest } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      return Response.json({ error: PASSWORD_RULES_MESSAGE }, { status: 400 });
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
