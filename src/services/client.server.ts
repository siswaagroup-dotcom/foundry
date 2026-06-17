// =============================================================================
// CLIENT SERVICE — server-side only (API route handlers)
// All queries are workspace-scoped for multi-tenant isolation.
// =============================================================================
import { db } from "@/lib/db";
import type {
  Client, ClientContact, ClientFilters,
  CreateClientInput, UpdateClientInput,
} from "@/types/client";

export type { Client, ClientContact, ClientFilters, CreateClientInput, UpdateClientInput };

export type ServiceResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string; status: number; code?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function activityFromDays(days: number): { activity: string; activityTone: "green" | "yellow" | "gray" } {
  if (days === 0) return { activity: "Today",       activityTone: "green"  };
  if (days === 1) return { activity: "Yesterday",   activityTone: "green"  };
  if (days <= 7)  return { activity: `${days}d ago`, activityTone: "yellow" };
  return              { activity: `${days}d ago`, activityTone: "gray"   };
}

function rowsToClients(
  rows: Array<{
    id: string; workspace_id: string; name: string; company_name: string | null;
    industry: string | null; email: string | null; phone: string | null;
    location: string | null; timezone: string | null; tier: string;
    priority: string; client_since: string | null; notes: string | null;
    created_by: string; created_at: string; updated_at: string;
  }>,
  tagsByClient: Map<string, string[]>,
  contactsByClient: Map<string, ClientContact[]>
): Client[] {
  return rows.map((r) => {
    const contacts = contactsByClient.get(r.id) ?? [];
    const primary  = contacts.find((c) => c.isPrimary) ?? contacts[0];
    const tags     = tagsByClient.get(r.id) ?? [];

    // Compute last activity days from updated_at
    const updatedMs = new Date(r.updated_at).getTime();
    const days = Math.floor((Date.now() - updatedMs) / 86_400_000);
    const { activity, activityTone } = activityFromDays(days);

    return {
      id:           r.id,
      workspaceId:  r.workspace_id,
      name:         r.name,
      companyName:  r.company_name,
      industry:     r.industry,
      email:        r.email,
      phone:        r.phone,
      location:     r.location,
      timezone:     r.timezone,
      tier:         r.tier as Client["tier"],
      priority:     r.priority as Client["priority"],
      clientSince:  r.client_since,
      notes:        r.notes,
      tags,
      contacts,
      createdBy:    r.created_by,
      createdAt:    r.created_at,
      updatedAt:    r.updated_at,
      // Derived
      initials:        getInitials(r.name),
      contact:         primary?.name ?? "No contact",
      activity,
      activityTone,
      activeProject:   false,    // future: join tasks table
      lastActivityDays: days,
    };
  });
}

async function attachDetails(
  rows: Parameters<typeof rowsToClients>[0]
): Promise<Client[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const { rows: tagRows } = await db.query<{ client_id: string; tag: string }>(
    "SELECT client_id, tag FROM client_tags WHERE client_id = ANY($1)", [ids]
  );
  const { rows: contactRows } = await db.query<{
    id: string; client_id: string; name: string; email: string | null;
    phone: string | null; role: string | null; is_primary: boolean;
  }>(
    "SELECT id, client_id, name, email, phone, role, is_primary FROM client_contacts WHERE client_id = ANY($1)", [ids]
  );

  const tagMap = new Map<string, string[]>();
  tagRows.forEach((r) => {
    tagMap.set(r.client_id, [...(tagMap.get(r.client_id) ?? []), r.tag]);
  });

  const contactMap = new Map<string, ClientContact[]>();
  contactRows.forEach((r) => {
    const c: ClientContact = {
      id: r.id, clientId: r.client_id, name: r.name,
      email: r.email, phone: r.phone, role: r.role, isPrimary: r.is_primary,
    };
    contactMap.set(r.client_id, [...(contactMap.get(r.client_id) ?? []), c]);
  });

  return rowsToClients(rows, tagMap, contactMap);
}

// ─── getClients ───────────────────────────────────────────────────────────────

export async function getClients(
  workspaceId: string,
  filters: ClientFilters = {}
): Promise<ServiceResult<Client[]>> {
  try {
    const conds: string[] = ["c.workspace_id = $1", "c.deleted_at IS NULL"];
    const params: unknown[] = [workspaceId];
    let i = 2;

    if (filters.tier)     { conds.push(`c.tier = $${i++}`);     params.push(filters.tier); }
    if (filters.priority) { conds.push(`c.priority = $${i++}`); params.push(filters.priority); }
    if (filters.search) {
      conds.push(`c.name ILIKE $${i++}`);
      params.push(`%${filters.search}%`);
    }
    if (filters.tag) {
      conds.push(`EXISTS (SELECT 1 FROM client_tags ct WHERE ct.client_id = c.id AND ct.tag = $${i++})`);
      params.push(filters.tag);
    }

    const { rows } = await db.query(
      `SELECT c.id, c.workspace_id, c.name, c.company_name, c.industry,
              c.email, c.phone, c.location, c.timezone, c.tier, c.priority,
              c.client_since, c.notes, c.created_by, c.created_at, c.updated_at
       FROM clients c WHERE ${conds.join(" AND ")} ORDER BY c.created_at DESC`,
      params
    );
    return { success: true, data: await attachDetails(rows) };
  } catch (err) {
    console.error("[client.getClients]", err);
    return { success: false, error: "Failed to fetch clients", status: 500 };
  }
}

// ─── getClient ────────────────────────────────────────────────────────────────

export async function getClient(
  workspaceId: string, clientId: string
): Promise<ServiceResult<Client>> {
  try {
    const { rows } = await db.query(
      `SELECT c.id, c.workspace_id, c.name, c.company_name, c.industry,
              c.email, c.phone, c.location, c.timezone, c.tier, c.priority,
              c.client_since, c.notes, c.created_by, c.created_at, c.updated_at
       FROM clients c WHERE c.id = $1 AND c.workspace_id = $2 AND c.deleted_at IS NULL`,
      [clientId, workspaceId]
    );
    if (rows.length === 0) return { success: false, error: "Client not found", status: 404 };
    const [client] = await attachDetails(rows);
    return { success: true, data: client };
  } catch (err) {
    console.error("[client.getClient]", err);
    return { success: false, error: "Failed to fetch client", status: 500 };
  }
}

// ─── createClient ─────────────────────────────────────────────────────────────

export async function createClient(
  workspaceId: string, userId: string, input: CreateClientInput
): Promise<ServiceResult<Client>> {
  const pgClient = await db.connect();
  try {
    await pgClient.query("BEGIN");

    const { rows } = await pgClient.query<{ id: string }>(
      `INSERT INTO clients
         (workspace_id, name, company_name, industry, email, phone, location, timezone, tier, priority, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        workspaceId,
        input.name.trim(),
        input.companyName?.trim()  || null,
        input.industry?.trim()     || null,
        input.email?.trim()        || null,
        input.phone?.trim()        || null,
        input.location?.trim()     || null,
        input.timezone?.trim()     || null,
        input.tier     ?? "standard",
        input.priority ?? "normal",
        input.notes?.trim()        || null,
        userId,
      ]
    );
    const clientId = rows[0].id;

    // Tags
    for (const tag of (input.tags ?? [])) {
      if (tag.trim()) {
        await pgClient.query(
          "INSERT INTO client_tags (client_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING",
          [clientId, tag.trim()]
        );
      }
    }

    // Primary contact
    if (input.contactName?.trim()) {
      await pgClient.query(
        "INSERT INTO client_contacts (client_id, workspace_id, name, email, phone, is_primary) VALUES ($1,$2,$3,$4,$5,TRUE)",
        [clientId, workspaceId, input.contactName.trim(), input.contactEmail?.trim() || null, input.contactPhone?.trim() || null]
      );
    }

    await pgClient.query("COMMIT");
    return getClient(workspaceId, clientId);
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("[client.createClient]", err);
    return { success: false, error: "Failed to create client", status: 500 };
  } finally {
    pgClient.release();
  }
}

// ─── updateClient ─────────────────────────────────────────────────────────────

export async function updateClient(
  workspaceId: string, clientId: string, input: UpdateClientInput
): Promise<ServiceResult<Client>> {
  const pgClient = await db.connect();
  try {
    await pgClient.query("BEGIN");

    const { rows: existing } = await pgClient.query(
      "SELECT id FROM clients WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL",
      [clientId, workspaceId]
    );
    if (existing.length === 0) {
      await pgClient.query("ROLLBACK");
      return { success: false, error: "Client not found", status: 404 };
    }

    const sets: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [];
    let idx = 1;

    const fields: [keyof UpdateClientInput, string][] = [
      ["name", "name"], ["companyName", "company_name"], ["industry", "industry"],
      ["email", "email"], ["phone", "phone"], ["location", "location"],
      ["timezone", "timezone"], ["tier", "tier"], ["priority", "priority"], ["notes", "notes"],
    ];

    for (const [key, col] of fields) {
      if (key in input) {
        sets.push(`${col} = $${idx++}`);
        const v = input[key];
        params.push(typeof v === "string" ? (v.trim() || null) : (v ?? null));
      }
    }

    if (params.length > 0) {
      params.push(clientId, workspaceId);
      await pgClient.query(
        `UPDATE clients SET ${sets.join(", ")} WHERE id = $${idx} AND workspace_id = $${idx + 1}`,
        params
      );
    }

    // Replace tags if provided
    if (input.tags !== undefined) {
      await pgClient.query("DELETE FROM client_tags WHERE client_id = $1", [clientId]);
      for (const tag of input.tags) {
        if (tag.trim()) {
          await pgClient.query(
            "INSERT INTO client_tags (client_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING",
            [clientId, tag.trim()]
          );
        }
      }
    }

    await pgClient.query("COMMIT");
    return getClient(workspaceId, clientId);
  } catch (err) {
    await pgClient.query("ROLLBACK");
    console.error("[client.updateClient]", err);
    return { success: false, error: "Failed to update client", status: 500 };
  } finally {
    pgClient.release();
  }
}

// ─── deleteClient ─────────────────────────────────────────────────────────────

export async function deleteClient(
  workspaceId: string, clientId: string
): Promise<ServiceResult<{ id: string }>> {
  try {
    const { rowCount } = await db.query(
      "UPDATE clients SET deleted_at = NOW() WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL",
      [clientId, workspaceId]
    );
    if ((rowCount ?? 0) === 0) return { success: false, error: "Client not found", status: 404 };
    return { success: true, data: { id: clientId } };
  } catch (err) {
    console.error("[client.deleteClient]", err);
    return { success: false, error: "Failed to delete client", status: 500 };
  }
}
