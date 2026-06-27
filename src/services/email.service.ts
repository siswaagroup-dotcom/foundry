// =============================================================================
// EMAIL SERVICE — Resend SDK
// Server-side only. Never import this in client components.
// Invitation emails are sent after a successful DB insert.
// If email fails, the invitation still exists — we log and continue.
//
// NOTE: Resend client is instantiated inside the function (not at module level)
// so that process.env.RESEND_API_KEY is read at runtime, not at import time.
// Module-level instantiation causes process.env to be undefined during
// Next.js build/bundle evaluation, resulting in a 401 "API key is invalid".
// =============================================================================
import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvitationEmailData {
  to: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationToken: string;
  expiresAt: Date;
}

// ─── sendInvitationEmail ──────────────────────────────────────────────────────

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  // ✅ Instantiate INSIDE the function — reads env var at call time (runtime)
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email.sendInvitationEmail] RESEND_API_KEY is not set — skipping email");
    throw new Error("[email.sendInvitationEmail] RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);

  const fromName  = process.env.INVITE_FROM_NAME  ?? "Siswaa";
  const fromEmail = process.env.INVITE_FROM_EMAIL ?? "invite@siswaa.com";
  const FROM      = `${fromName} <${fromEmail}>`;

  const inviteUrl = `${APP_URL}/invite/${data.invitationToken}`;
  const expiryDate = data.expiresAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = buildEmailHtml({
    inviterName:   data.inviterName,
    workspaceName: data.workspaceName,
    role:          data.role,
    inviteUrl,
    expiryDate,
  });

  try {
    const result = await resend.emails.send({
      from:    FROM,
      to:      data.to,
      subject: `You're invited to join ${data.workspaceName} on Siswaa`,
      html,
    });

    if (result.error) {
      console.error("[email.sendInvitationEmail] Resend error:", result.error);
      throw new Error("[email.sendInvitationEmail] Resend failed to send invitation");
    }
  } catch (err) {
    console.error("[email.sendInvitationEmail] Unexpected error:", err);
    throw err;
  }
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildEmailHtml(params: {
  inviterName:   string;
  workspaceName: string;
  role:          string;
  inviteUrl:     string;
  expiryDate:    string;
}): string {
  const { inviterName, workspaceName, role, inviteUrl, expiryDate } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workspace Invitation — Siswaa</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;background:linear-gradient(135deg,#f15a24,#e8431a);border-radius:10px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:36px;color:#fff;font-weight:900;font-size:18px;">S</div>
                      <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;margin-left:10px;">Siswaa</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">

              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
                You're invited!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                <strong>${escapeHtml(inviterName)}</strong> has invited you to join
                <strong>${escapeHtml(workspaceName)}</strong> on Siswaa as a
                <strong>${escapeHtml(role)}</strong>.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;color:#6b7280;display:block;">Workspace</span>
                          <span style="font-size:14px;font-weight:600;color:#111827;">${escapeHtml(workspaceName)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;color:#6b7280;display:block;">Your Role</span>
                          <span style="font-size:14px;font-weight:600;color:#111827;">${escapeHtml(role)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;color:#6b7280;display:block;">Invited By</span>
                          <span style="font-size:14px;font-weight:600;color:#111827;">${escapeHtml(inviterName)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;color:#6b7280;display:block;">Link Expires</span>
                          <span style="font-size:14px;font-weight:600;color:#111827;">${escapeHtml(expiryDate)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}"
                       style="display:inline-block;background:#f15a24;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.01em;">
                      Join Workspace →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
                Or copy this link into your browser:<br />
                <a href="${inviteUrl}" style="color:#f15a24;word-break:break-all;">${inviteUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                You received this email because someone invited you to a Siswaa workspace.<br />
                If you weren't expecting this, you can safely ignore it.<br /><br />
                © ${new Date().getFullYear()} Siswaa. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
