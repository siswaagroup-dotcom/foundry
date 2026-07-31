import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getInvitations, getMembers } from "@/services/team.server";
import type {
  CrmPipelineStage,
  IntegrationsPatch,
  SettingsData,
  SettingsPatch,
} from "../../settings/types/settings-types";

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

// Internal DB shape — stores the actual API key, never sent to the client
type StoredCredential = {
  apiKey?: string;
};

type IntegrationCredentialsMap = {
  resend?: StoredCredential;
  openai?: StoredCredential;
  github?: StoredCredential;
};

type SettingsRow = {
  workspace_name: string;
  logo_url: string | null;
  timezone: string;
  currency: string;
  date_format: string;
  language: string;
  user_name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  job_title: string | null;
  expense_required_approvals: number | null;
  expense_auto_approve_below: string | null;
  reimbursement_rules: string | null;
  integration_resend_connected: boolean;
  integration_openai_connected: boolean;
  integration_github_connected: boolean;
  integration_credentials: IntegrationCredentialsMap | null;
  crm_pipeline_stages: CrmPipelineStage[];
};

// Runtime check: does the integration_credentials column exist?
let credentialsColumnExists: boolean | null = null;

async function hasCredentialsColumn(): Promise<boolean> {
  if (credentialsColumnExists !== null) return credentialsColumnExists;
  try {
    const { rows } = await db.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_name = 'workspace_settings'
           AND column_name = 'integration_credentials'
       ) AS exists`
    );
    credentialsColumnExists = rows[0]?.exists ?? false;
    return credentialsColumnExists;
  } catch {
    credentialsColumnExists = false;
    return false;
  }
}


function normalizeStages(stages: CrmPipelineStage[]): CrmPipelineStage[] {
  return stages
    .filter((stage) => stage.id.trim() && stage.label.trim())
    .map((stage, index) => ({
      id: stage.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      label: stage.label.trim(),
      position: index + 1,
    }));
}

async function ensureWorkspaceSettings(workspaceId: string): Promise<void> {
  await db.query(
    `INSERT INTO workspace_settings (workspace_id)
     VALUES ($1)
     ON CONFLICT (workspace_id) DO NOTHING`,
    [workspaceId]
  );
}

export async function getSettings(
  workspaceId: string,
  userId: string
): Promise<ServiceResult<SettingsData>> {
  try {
    console.error("[settings.getSettings] START workspaceId=%s userId=%s", workspaceId, userId);

    // Step 1: ensure workspace_settings row exists
    try {
      await ensureWorkspaceSettings(workspaceId);
      console.error("[settings.getSettings] ensureWorkspaceSettings OK");
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; detail?: string; hint?: string };
      console.error("[settings.getSettings] ensureWorkspaceSettings FAILED");
      console.error("  error.message:", e?.message);
      console.error("  error.code:", e?.code);
      console.error("  error.detail:", e?.detail);
      console.error("  error.hint:", e?.hint);
      throw err;
    }

    // Step 2: check if integration_credentials column exists
    let withCredentials = false;
    try {
      withCredentials = await hasCredentialsColumn();
      console.error("[settings.getSettings] hasCredentialsColumn=%s", withCredentials);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error("[settings.getSettings] hasCredentialsColumn FAILED message=%s code=%s", e?.message, e?.code);
      withCredentials = false;
    }

    const credentialsSelect = withCredentials
      ? ",\n           ws.integration_credentials"
      : "";

    const mainQuery = `SELECT
           w.name AS workspace_name,
           w.logo_url,
           w.timezone,
           w.currency,
           w.date_format,
           w.language,
           u.name AS user_name,
           u.avatar_url,
           u.email,
           u.phone,
           u.job_title,
           ws.expense_required_approvals,
           ws.expense_auto_approve_below,
           ws.reimbursement_rules,
           ws.integration_resend_connected,
           ws.integration_openai_connected,
           ws.integration_github_connected,
           ws.crm_pipeline_stages${credentialsSelect}
         FROM workspaces w
         JOIN users u ON u.id = $2 AND u.deleted_at IS NULL
         JOIN workspace_settings ws ON ws.workspace_id = w.id
         WHERE w.id = $1 AND w.deleted_at IS NULL
         LIMIT 1`;

    const [settingsResult, membersResult, invitationsResult] = await Promise.all([
      db.query<SettingsRow>(mainQuery, [workspaceId, userId]).catch((err: unknown) => {
        const e = err as { message?: string; code?: string; detail?: string; hint?: string; stack?: string };
        console.error("[settings.getSettings] MAIN QUERY FAILED");
        console.error("  SQL:", mainQuery.replace(/\s+/g, " ").trim());
        console.error("  params: workspaceId=%s userId=%s", workspaceId, userId);
        console.error("  error.message:", e?.message);
        console.error("  error.code:", e?.code);
        console.error("  error.detail:", e?.detail);
        console.error("  error.hint:", e?.hint);
        console.error("  stack:", e?.stack);
        throw err;
      }),
      getMembers(workspaceId),
      getInvitations(workspaceId),
    ]);

    const row = settingsResult.rows[0];
    if (!row) {
      console.error("[settings.getSettings] NO ROW returned for workspaceId=%s userId=%s", workspaceId, userId);
      return { success: false, error: "Settings not found", status: 404, code: "SETTINGS_NOT_FOUND" };
    }
    if (!membersResult.success) {
      console.error("[settings.getSettings] getMembers FAILED:", membersResult.error);
      return membersResult;
    }
    if (!invitationsResult.success) {
      console.error("[settings.getSettings] getInvitations FAILED:", invitationsResult.error);
      return invitationsResult;
    }

    console.error("[settings.getSettings] All queries OK, building response");

    const credentials: IntegrationCredentialsMap = row.integration_credentials ?? {};

    return {
      success: true,
      data: {
        workspace: {
          name: row.workspace_name,
          logoUrl: row.logo_url ?? "",
          timezone: row.timezone,
          currency: row.currency,
          dateFormat: row.date_format,
          language: row.language,
        },
        profile: {
          name: row.user_name,
          avatarUrl: row.avatar_url ?? "",
          email: row.email,
          phone: row.phone ?? "",
          jobTitle: row.job_title ?? "",
        },
        team: {
          members: membersResult.data,
          invitations: invitationsResult.data,
        },
        expensePolicies: {
          approvalLevels: row.expense_required_approvals ?? 1,
          autoApprovalLimit: row.expense_auto_approve_below ?? "",
          defaultCurrency: row.currency,
          reimbursementRules: row.reimbursement_rules ?? "",
        },
        crm: {
          stages: normalizeStages(row.crm_pipeline_stages),
        },
        integrations: {
          resend: row.integration_resend_connected,
          resendCredentials: { hasKey: Boolean(credentials.resend?.apiKey) },
          openai: row.integration_openai_connected,
          openaiCredentials: { hasKey: Boolean(credentials.openai?.apiKey) },
          github: row.integration_github_connected,
          githubCredentials: { hasKey: Boolean(credentials.github?.apiKey) },
        },
      },
    };
  } catch (error) {
    console.error("[settings.getSettings]", error);
    return { success: false, error: "Failed to fetch settings", status: 500, code: "SETTINGS_FETCH_FAILED" };
  }
}

export async function updateSettings(
  workspaceId: string,
  userId: string,
  patch: SettingsPatch
): Promise<ServiceResult<SettingsData>> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO workspace_settings (workspace_id)
       VALUES ($1)
       ON CONFLICT (workspace_id) DO NOTHING`,
      [workspaceId]
    );

    if (patch.workspace) {
      const fields: string[] = [];
      const values: unknown[] = [];
      const map: [keyof SettingsData["workspace"], string, (value: string) => string | null][] = [
        ["name", "name", (value) => value.trim()],
        ["logoUrl", "logo_url", (value) => value.trim() || null],
        ["timezone", "timezone", (value) => value.trim()],
        ["currency", "currency", (value) => value.trim().toUpperCase()],
        ["dateFormat", "date_format", (value) => value.trim()],
        ["language", "language", (value) => value.trim()],
      ];

      for (const [key, column, normalize] of map) {
        const value = patch.workspace[key];
        if (value !== undefined) {
          values.push(normalize(value));
          fields.push(`${column} = $${values.length}`);
        }
      }

      if (fields.length > 0) {
        values.push(workspaceId);
        await client.query(
          `UPDATE workspaces SET ${fields.join(", ")}, updated_at = NOW()
           WHERE id = $${values.length} AND deleted_at IS NULL`,
          values
        );
      }
    }

    if (patch.profile) {
      const fields: string[] = [];
      const values: unknown[] = [];
      const map: [keyof SettingsData["profile"], string, (value: string) => string | null][] = [
        ["name", "name", (value) => value.trim()],
        ["avatarUrl", "avatar_url", (value) => value.trim() || null],
        ["phone", "phone", (value) => value.trim() || null],
        ["jobTitle", "job_title", (value) => value.trim() || null],
      ];

      for (const [key, column, normalize] of map) {
        const value = patch.profile[key];
        if (value !== undefined) {
          values.push(normalize(value));
          fields.push(`${column} = $${values.length}`);
        }
      }

      if (fields.length > 0) {
        values.push(userId);
        await client.query(
          `UPDATE users SET ${fields.join(", ")}, updated_at = NOW()
           WHERE id = $${values.length} AND deleted_at IS NULL`,
          values
        );
      }
    }

    if (patch.password?.currentPassword || patch.password?.newPassword) {
      if (!patch.password.currentPassword || !patch.password.newPassword) {
        await client.query("ROLLBACK");
        return { success: false, error: "Current and new password are required", status: 400, code: "PASSWORD_REQUIRED" };
      }

      const { rows } = await client.query<{ password_hash: string | null }>(
        "SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1",
        [userId]
      );
      const hash = rows[0]?.password_hash;
      if (!hash || !(await bcrypt.compare(patch.password.currentPassword, hash))) {
        await client.query("ROLLBACK");
        return { success: false, error: "Current password is incorrect", status: 400, code: "INVALID_PASSWORD" };
      }

      const nextHash = await bcrypt.hash(patch.password.newPassword, 12);
      await client.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [nextHash, userId]);
    }

    if (patch.expensePolicies) {
      await client.query(
        `UPDATE workspace_settings
         SET expense_required_approvals = COALESCE($1, expense_required_approvals),
             expense_auto_approve_below = $2,
             reimbursement_rules = COALESCE($3, reimbursement_rules),
             updated_at = NOW()
         WHERE workspace_id = $4`,
        [
          patch.expensePolicies.approvalLevels,
          patch.expensePolicies.autoApprovalLimit === undefined || patch.expensePolicies.autoApprovalLimit === ""
            ? null
            : patch.expensePolicies.autoApprovalLimit,
          patch.expensePolicies.reimbursementRules,
          workspaceId,
        ]
      );
      if (patch.expensePolicies.defaultCurrency) {
        await client.query(
          "UPDATE workspaces SET currency = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
          [patch.expensePolicies.defaultCurrency.trim().toUpperCase(), workspaceId]
        );
      }
    }

    if (patch.crm?.stages) {
      await client.query(
        "UPDATE workspace_settings SET crm_pipeline_stages = $1::jsonb, updated_at = NOW() WHERE workspace_id = $2",
        [JSON.stringify(normalizeStages(patch.crm.stages)), workspaceId]
      );
    }

    if (patch.integrations) {
      const intPatch = patch.integrations as IntegrationsPatch;

      // Update boolean connected flags
      await client.query(
        `UPDATE workspace_settings
         SET integration_resend_connected = COALESCE($1, integration_resend_connected),
             integration_openai_connected = COALESCE($2, integration_openai_connected),
             integration_github_connected = COALESCE($3, integration_github_connected),
             updated_at = NOW()
         WHERE workspace_id = $4`,
        [
          intPatch.resend,
          intPatch.openai,
          intPatch.github,
          workspaceId,
        ]
      );

      // Update credentials if column exists
      const credColExists = await hasCredentialsColumn();
      if (credColExists) {
        const hasCredentialUpdates =
          Boolean(intPatch.resendCredentials?.newApiKey?.trim()) ||
          Boolean(intPatch.openaiCredentials?.newApiKey?.trim()) ||
          Boolean(intPatch.githubCredentials?.newApiKey?.trim());

        if (hasCredentialUpdates) {
          // Fetch current credentials first
          const { rows: credRows } = await client.query<{
            integration_credentials: IntegrationCredentialsMap | null;
          }>(
            "SELECT integration_credentials FROM workspace_settings WHERE workspace_id = $1",
            [workspaceId]
          );
          const current: IntegrationCredentialsMap = credRows[0]?.integration_credentials ?? {};

          const next: IntegrationCredentialsMap = { ...current };

          const resendKey = intPatch.resendCredentials?.newApiKey?.trim();
          if (resendKey) {
            next.resend = { ...(next.resend ?? {}), apiKey: resendKey };
          }

          const openaiKey = intPatch.openaiCredentials?.newApiKey?.trim();
          if (openaiKey) {
            next.openai = { ...(next.openai ?? {}), apiKey: openaiKey };
          }

          const githubKey = intPatch.githubCredentials?.newApiKey?.trim();
          if (githubKey) {
            next.github = { ...(next.github ?? {}), apiKey: githubKey };
          }

          await client.query(
            "UPDATE workspace_settings SET integration_credentials = $1::jsonb WHERE workspace_id = $2",
            [JSON.stringify(next), workspaceId]
          );
        }
      }
    }

    await client.query("COMMIT");
    return getSettings(workspaceId, userId);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("[settings.updateSettings]", error);
    return { success: false, error: "Failed to update settings", status: 500, code: "SETTINGS_UPDATE_FAILED" };
  } finally {
    client.release();
  }
}
