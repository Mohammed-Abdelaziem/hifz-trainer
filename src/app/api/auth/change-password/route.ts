import { getSessionUser, hashPassword, verifyPassword, revokeAllSessions, createSession } from "@/lib/server/auth";
import { isStrongPassword, PASSWORD_RULES_MESSAGE } from "@/lib/server/password";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof newPassword !== "string" || typeof confirmPassword !== "string") {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: "New passwords do not match." }, { status: 400 });
    }

    if (!isStrongPassword(newPassword)) {
      return Response.json({ error: PASSWORD_RULES_MESSAGE }, { status: 400 });
    }

    const db = await getDb();
    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Accounts that already have a password must verify the current one;
    // OAuth-only accounts (passwordHash === null) can set an initial password
    // from their verified session without a prior password.
    if (fullUser.passwordHash) {
      if (typeof oldPassword !== "string" || !oldPassword) {
        return Response.json({ error: "Current password is required." }, { status: 400 });
      }
      if (!(await verifyPassword(oldPassword, fullUser.passwordHash))) {
        return Response.json({ error: "Current password is incorrect." }, { status: 400 });
      }
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
