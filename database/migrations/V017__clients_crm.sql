-- =============================================================================
-- MIGRATION V017 — CLIENTS CRM UPGRADE
-- Adds CRM pipeline lifecycle + revenue tracking to the clients table.
-- All columns are nullable with defaults — existing rows unaffected.
-- =============================================================================

-- 1. CRM lifecycle stage
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS crm_status VARCHAR(30) NOT NULL DEFAULT 'lead';

ALTER TABLE clients
  ADD CONSTRAINT chk_clients_crm_status
    CHECK (crm_status IN (
      'lead',
      'qualified',
      'proposal_sent',
      'negotiation',
      'advance_received',
      'active_client',
      'completed'
    ));

-- 2. Revenue tracking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS quoted_amount    NUMERIC(12,2) NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS advance_received NUMERIC(12,2) NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS paid_amount      NUMERIC(12,2) NULL;
-- pending_amount is derived: quoted_amount - paid_amount (computed at query time)

-- 3. Index for pipeline view (group by crm_status per workspace)
CREATE INDEX IF NOT EXISTS idx_clients_workspace_crm_status
  ON clients (workspace_id, crm_status)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN clients.crm_status        IS 'CRM lifecycle: lead → qualified → proposal_sent → negotiation → advance_received → active_client → completed';
COMMENT ON COLUMN clients.quoted_amount     IS 'Total value quoted to this client.';
COMMENT ON COLUMN clients.advance_received  IS 'Advance/retainer payment received.';
COMMENT ON COLUMN clients.paid_amount       IS 'Total amount paid to date.';
