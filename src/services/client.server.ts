// =============================================================================
// CLIENT SERVICE — server-side only
// =============================================================================
import { db } from "@/lib/db";
import type {
  Client, ClientContact, ClientFilters, ClientTimelineEvent,
  CreateClientInput, UpdateClientInput, CrmStage,
} from "@/types/client";

export type { Client, ClientContact, ClientFilters, ClientTimelineEvent, CreateClientInput, UpdateClientInput };

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inits(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function actDays(days: number): { activity: string; activityTone: "green" | "yellow" | "gray" } {
  if (days === 0) return { activity: "Today",        activityTone: "green"  };
  if (days === 1) return { activity: "Yesterday",    activityTone: "green"  };
  if (days <= 7)  return { activity: `${days}d ago`, activityTone: "yellow" };
  return              { activity: `${days}d ago`, activityTone: "gray"   };
}

type ClientRow = {
  id: string; workspace_id: string; name: string; company_name: string | null;
  industry: string | null; email: string | null; phone: string | null;
  location: string | null; timezone: string | null; tier: string; priority: string;
  crm_status: string; quoted_amount: string | null;
  advance_received: string | null; paid_amount: string | null;
  client_since: string | null; notes: string | null;
  created_by: string; created_at: string; updated_at: string;
  task_count: string; expense_total: string; active_project: boolean;
};

async function attachDetails(rows: ClientRow[]): Promise<Client[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [{ rows: tagRows }, { rows: contactRows }] = await Promise.all([
    db.query<{ client_id: string; tag: string }>(
      "SELECT client_id, tag FROM client_tags WHERE client_id = ANY($1)", [ids]
    ),
    db.query<{ id: string; client_id: string; name: string; email: string | null; phone: string | null; role: string | null; is_primary: boolean }>(
      "SELECT id, client_id, name, email, phone, role, is_primary FROM client_contacts WHERE client_id = ANY($1)", [ids]
    ),
  ]);

  const tagMap = new Map<string, string[]>();
  tagRows.forEach((r) => tagMap.set(r.client_id, [...(tagMap.get(r.client_id) ?? []), r.tag]));

  const conMap = new Map<string, ClientContact[]>();
  contactRows.forEach((r) => {
    const c: ClientContact = { id: r.id, clientId: r.client_id, name: r.name, email: r.email, phone: r.phone, role: r.role, isPrimary: r.is_primary };
    conMap.set(r.client_id, [...(conMap.get(r.client_id) ?? []), c]);
  });

  return rows.map((r) => {
    const contacts = conMap.get(r.id) ?? [];
    const primary  = contacts.find((c) => c.isPrimary) ?? contacts[0];
    const days     = Math.floor((Date.now() - new Date(r.updated_at).getTime()) / 86_400_000);
    const { activity, activityTone } = actDays(days);
    const quoted   = r.quoted_amount    !== null ? parseFloat(r.quoted_amount)    : null;
    const paid     = r.paid_amount      !== null ? parseFloat(r.paid_amount)      : null;
    const advance  = r.advance_received !== null ? parseFloat(r.advance_received) : null;
    return {
      id: r.id, workspaceId: r.workspace_id, name: r.name, companyName: r.company_name,
      industry: r.industry, email: r.email, phone: r.phone, location: r.location, timezone: r.timezone,
      tier: r.tier as Client["tier"], priority: r.priority as Client["priority"],
      crmStatus: (r.crm_status || "lead") as CrmStage,
      quotedAmount: quoted, advanceReceived: advance, paidAmount: paid,
      pendingAmount: quoted !== null && paid !== null ? quoted - paid : null,
      clientSince: r.client_since, notes: r.notes,
      tags: tagMap.get(r.id) ?? [], contacts,
      createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at,
      initials: inits(r.name), contact: primary?.name ?? "No contact",
      activity, activityTone,
      activeProject: r.active_project ?? false,
      lastActivityDays: days,
      taskCount:    parseInt(r.task_count    ?? "0"),
      expenseTotal: parseFloat(r.expense_total ?? "0"),
    };
  });
}

// Runtime detection: V017 CRM columns
let _hasCrm: boolean | null = null;
async function hasCrmColumns(): Promise<boolean> {
  if (_hasCrm !== null) return _hasCrm;
  const { rows } = await db.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='crm_status' LIMIT 1"
  );
  _hasCrm = rows.length > 0;
  return _hasCrm;
}

function buildSEL(hasCrm: boolean): string {
  const crmCols = hasCrm
    ? ", c.crm_status, c.quoted_amount, c.advance_received, c.paid_amount"
    : ", 'lead' AS crm_status, NULL::numeric AS quoted_amount, NULL::numeric AS advance_received, NULL::numeric AS paid_amount";
  return `
    SELECT c.id, c.workspace_id, c.name, c.company_name, c.industry,
           c.email, c.phone, c.location, c.timezone, c.tier, c.priority,
           c.client_since, c.notes, c.created_by, c.created_at, c.updated_at
           ${crmCols},
           COALESCE(COUNT(DISTINCT t.id), 0)::text        AS task_count,
           COALESCE(SUM(e.amount_planned), 0)::text       AS expense_total,
           (COUNT(DISTINCT t.id) > 0)                     AS active_project
    FROM clients c
    LEFT JOIN tasks    t ON t.client_id = c.id AND t.deleted_at IS NULL
    LEFT JOIN expenses e ON e.client_id = c.id AND e.deleted_at IS NULL
  `;
}

// ─── getClients ───────────────────────────────────────────────────────────────

export async function getClients(workspaceId: string, filters: ClientFilters = {}): Promise<ServiceResult<Client[]>> {
  try {
    const hasCrm = await hasCrmColumns();
    const SEL    = buildSEL(hasCrm);
    const conds  = ["c.workspace_id = $1", "c.deleted_at IS NULL"];
    const params: unknown[] = [workspaceId];
    let i = 2;
    if (filters.tier)      { conds.push(`c.tier = $${i++}`);     params.push(filters.tier); }
    if (filters.priority)  { conds.push(`c.priority = $${i++}`); params.push(filters.priority); }
    if (filters.search)    { conds.push(`c.name ILIKE $${i++}`); params.push(`%${filters.search}%`); }
    if (filters.tag)       { conds.push(`EXISTS (SELECT 1 FROM client_tags ct WHERE ct.client_id=c.id AND ct.tag=$${i++})`); params.push(filters.tag); }
    if (filters.crmStatus && hasCrm) { conds.push(`c.crm_status=$${i++}`); params.push(filters.crmStatus); }
    const { rows } = await db.query<ClientRow>(
      `${SEL} WHERE ${conds.join(" AND ")} GROUP BY c.id ORDER BY c.created_at DESC`, params
    );
    return { success: true, data: await attachDetails(rows) };
  } catch (err) {
    console.error("[client.getClients]", err);
    return { success: false, error: "Failed to fetch clients", status: 500 };
  }
}

// ─── getClient ────────────────────────────────────────────────────────────────

export async function getClient(workspaceId: string, clientId: string): Promise<ServiceResult<Client>> {
  try {
    const hasCrm = await hasCrmColumns();
    const SEL    = buildSEL(hasCrm);
    const { rows } = await db.query<ClientRow>(
      `${SEL} WHERE c.id=$1 AND c.workspace_id=$2 AND c.deleted_at IS NULL GROUP BY c.id`,
      [clientId, workspaceId]
    );
    if (!rows.length) return { success: false, error: "Client not found", status: 404 };
    const [c] = await attachDetails(rows);
    return { success: true, data: c };
  } catch (err) {
    console.error("[client.getClient]", err);
    return { success: false, error: "Failed to fetch client", status: 500 };
  }
}

// ─── createClient ─────────────────────────────────────────────────────────────

export async function createClient(workspaceId: string, userId: string, input: CreateClientInput): Promise<ServiceResult<Client>> {
  const pg = await db.connect();
  try {
    await pg.query("BEGIN");
    const hasCrm = await hasCrmColumns();
    const cols = hasCrm
      ? "(workspace_id,name,company_name,industry,email,phone,location,timezone,tier,priority,crm_status,quoted_amount,advance_received,paid_amount,notes,created_by)"
      : "(workspace_id,name,company_name,industry,email,phone,location,timezone,tier,priority,notes,created_by)";
    const vals = hasCrm
      ? "($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)"
      : "($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)";
    const qParams = hasCrm
      ? [workspaceId, input.name.trim(), input.companyName?.trim()||null, input.industry?.trim()||null,
         input.email?.trim()||null, input.phone?.trim()||null, input.location?.trim()||null, input.timezone?.trim()||null,
         input.tier??"standard", input.priority??"normal", input.crmStatus??"lead",
         input.quotedAmount??null, input.advanceReceived??null, input.paidAmount??null,
         input.notes?.trim()||null, userId]
      : [workspaceId, input.name.trim(), input.companyName?.trim()||null, input.industry?.trim()||null,
         input.email?.trim()||null, input.phone?.trim()||null, input.location?.trim()||null, input.timezone?.trim()||null,
         input.tier??"standard", input.priority??"normal", input.notes?.trim()||null, userId];

    const { rows } = await pg.query<{ id: string }>(`INSERT INTO clients ${cols} VALUES ${vals} RETURNING id`, qParams);
    const clientId = rows[0].id;

    for (const tag of (input.tags ?? [])) {
      if (tag.trim()) await pg.query("INSERT INTO client_tags (client_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING", [clientId, tag.trim()]);
    }
    if (input.contactName?.trim()) {
      await pg.query(
        "INSERT INTO client_contacts (client_id, workspace_id, name, email, phone, is_primary) VALUES ($1,$2,$3,$4,$5,TRUE)",
        [clientId, workspaceId, input.contactName.trim(), input.contactEmail?.trim()||null, input.contactPhone?.trim()||null]
      );
    }
    await pg.query("COMMIT");
    return getClient(workspaceId, clientId);
  } catch (err) {
    await pg.query("ROLLBACK");
    console.error("[client.createClient]", err);
    return { success: false, error: "Failed to create client", status: 500 };
  } finally { pg.release(); }
}

// ─── updateClient ─────────────────────────────────────────────────────────────

export async function updateClient(workspaceId: string, clientId: string, input: UpdateClientInput): Promise<ServiceResult<Client>> {
  const pg = await db.connect();
  try {
    await pg.query("BEGIN");
    const hasCrm = await hasCrmColumns();
    const { rows: ex } = await pg.query("SELECT id FROM clients WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [clientId, workspaceId]);
    if (!ex.length) { await pg.query("ROLLBACK"); return { success: false, error: "Client not found", status: 404 }; }

    const sets: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [];
    let idx = 1;
    const baseF: [keyof UpdateClientInput, string][] = [
      ["name","name"],["companyName","company_name"],["industry","industry"],
      ["email","email"],["phone","phone"],["location","location"],["timezone","timezone"],
      ["tier","tier"],["priority","priority"],["notes","notes"],
    ];
    const crmF: [keyof UpdateClientInput, string][] = hasCrm ? [
      ["crmStatus","crm_status"],["quotedAmount","quoted_amount"],
      ["advanceReceived","advance_received"],["paidAmount","paid_amount"],
    ] : [];
    for (const [key, col] of [...baseF, ...crmF]) {
      if (key in input) {
        sets.push(`${col} = $${idx++}`);
        const v = input[key];
        params.push(typeof v === "string" ? (v.trim()||null) : (v ?? null));
      }
    }
    if (params.length > 0) {
      params.push(clientId, workspaceId);
      await pg.query(`UPDATE clients SET ${sets.join(", ")} WHERE id=$${idx} AND workspace_id=$${idx+1}`, params);
    }
    if (input.tags !== undefined) {
      await pg.query("DELETE FROM client_tags WHERE client_id=$1", [clientId]);
      for (const tag of input.tags) {
        if (tag.trim()) await pg.query("INSERT INTO client_tags (client_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING", [clientId, tag.trim()]);
      }
    }
    await pg.query("COMMIT");
    return getClient(workspaceId, clientId);
  } catch (err) {
    await pg.query("ROLLBACK");
    console.error("[client.updateClient]", err);
    return { success: false, error: "Failed to update client", status: 500 };
  } finally { pg.release(); }
}

// ─── deleteClient ─────────────────────────────────────────────────────────────

export async function deleteClient(workspaceId: string, clientId: string): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query("UPDATE clients SET deleted_at=NOW() WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [clientId, workspaceId]);
    if ((rowCount??0) === 0) return { success: false, error: "Client not found", status: 404 };
    return { success: true, data: { id: clientId } };
  } catch (err) {
    console.error("[client.deleteClient]", err);
    return { success: false, error: "Failed to delete client", status: 500 };
  }
}

// ─── getCrmPipeline ───────────────────────────────────────────────────────────

export async function getCrmPipeline(workspaceId: string): Promise<ServiceResult<Record<CrmStage, Client[]>>> {
  const result = await getClients(workspaceId);
  if (!result.success) return result;
  const pipeline: Record<CrmStage, Client[]> = {
    lead: [], qualified: [], proposal_sent: [], negotiation: [],
    advance_received: [], active_client: [], completed: [], lost: [],
  };
  result.data.forEach((c) => { if (pipeline[c.crmStatus]) pipeline[c.crmStatus].push(c); });
  return { success: true, data: pipeline };
}

// ─── getClientTimeline ────────────────────────────────────────────────────────

export async function getClientTimeline(workspaceId: string, clientId: string): Promise<ServiceResult<ClientTimelineEvent[]>> {
  try {
    const { rows: check } = await db.query("SELECT id FROM clients WHERE id=$1 AND workspace_id=$2 AND deleted_at IS NULL", [clientId, workspaceId]);
    if (!check.length) return { success: false, error: "Client not found", status: 404 };

    const [{ rows: taskR }, { rows: expR }, { rows: postR }] = await Promise.all([
      db.query<{ id: string; title: string; status: string; created_at: string; creator_name: string }>(
        `SELECT t.id, t.title, t.status, t.created_at, u.name AS creator_name
         FROM tasks t JOIN users u ON u.id=t.created_by
         WHERE t.client_id=$1 AND t.deleted_at IS NULL ORDER BY t.created_at DESC LIMIT 20`, [clientId]
      ),
      db.query<{ id: string; name: string; amount_planned: string; status: string; created_at: string; creator_name: string }>(
        `SELECT e.id, e.name, e.amount_planned, e.status, e.created_at, u.name AS creator_name
         FROM expenses e JOIN users u ON u.id=e.created_by
         WHERE e.client_id=$1 AND e.deleted_at IS NULL ORDER BY e.created_at DESC LIMIT 20`, [clientId]
      ),
      db.query<{ id: string; title: string; platform: string; status: string; created_at: string; creator_name: string }>(
        `SELECT sp.id, sp.title, sp.platform, sp.status, sp.created_at, u.name AS creator_name
         FROM social_posts sp JOIN users u ON u.id=sp.created_by
         WHERE sp.client_id=$1 AND sp.deleted_at IS NULL ORDER BY sp.created_at DESC LIMIT 20`, [clientId]
      ),
    ]);

    const events: ClientTimelineEvent[] = [
      ...taskR.map((r) => ({
        id: `task-${r.id}`, type: "task" as const, title: r.title,
        detail: `Status: ${r.status}`, badge: r.status,
        timestamp: r.created_at, actorName: r.creator_name,
      })),
      ...expR.map((r) => ({
        id: `exp-${r.id}`, type: "expense" as const, title: r.name,
        detail: `$${parseFloat(r.amount_planned).toLocaleString()} · ${r.status}`,
        badge: `$${parseFloat(r.amount_planned).toLocaleString()}`,
        timestamp: r.created_at, actorName: r.creator_name,
      })),
      ...postR.map((r) => ({
        id: `post-${r.id}`, type: "social_post" as const, title: r.title,
        detail: `${r.platform} · ${r.status}`, badge: r.platform,
        timestamp: r.created_at, actorName: r.creator_name,
      })),
    ];
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return { success: true, data: events };
  } catch (err) {
    console.error("[client.getClientTimeline]", err);
    return { success: false, error: "Failed to fetch client timeline", status: 500 };
  }
}

// ─── getClientFilterCounts ────────────────────────────────────────────────────

export async function getClientFilterCounts(workspaceId: string): Promise<ServiceResult<{
  enterpriseClients: number; activeThisWeek: number;
  highPriority: number; premiumTier: number; inactive30Days: number;
}>> {
  try {
    const { rows } = await db.query<{
      ec: string; aw: string; hp: string; pt: string; i30: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE tier='enterprise')                        AS ec,
         COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '7 days') AS aw,
         COUNT(*) FILTER (WHERE priority='high')                          AS hp,
         COUNT(*) FILTER (WHERE tier='premium')                           AS pt,
         COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '30 days') AS i30
       FROM clients WHERE workspace_id=$1 AND deleted_at IS NULL`,
      [workspaceId]
    );
    const r = rows[0];
    return { success: true, data: {
      enterpriseClients: parseInt(r.ec), activeThisWeek: parseInt(r.aw),
      highPriority: parseInt(r.hp), premiumTier: parseInt(r.pt), inactive30Days: parseInt(r.i30),
    }};
  } catch (err) {
    console.error("[client.getClientFilterCounts]", err);
    return { success: false, error: "Failed to fetch filter counts", status: 500 };
  }
}
