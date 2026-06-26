-- =============================================================================
-- MIGRATION V018 - DYNAMIC SETTINGS
-- Extends existing workspace, user, settings, and CRM tables for Settings module.
-- =============================================================================

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
  ADD COLUMN IF NOT EXISTS language VARCHAR(20) NOT NULL DEFAULT 'en';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(120) NULL;

ALTER TABLE workspace_settings
  ADD COLUMN IF NOT EXISTS reimbursement_rules TEXT NULL,
  ADD COLUMN IF NOT EXISTS integration_resend_connected BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS integration_openai_connected BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS integration_github_connected BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS crm_pipeline_stages JSONB NOT NULL DEFAULT
    '[
      {"id":"lead","label":"Lead","position":1},
      {"id":"qualified","label":"Qualified","position":2},
      {"id":"proposal_sent","label":"Proposal Sent","position":3},
      {"id":"negotiation","label":"Negotiation","position":4},
      {"id":"advance_received","label":"Advance Received","position":5},
      {"id":"active_client","label":"Active Client","position":6},
      {"id":"completed","label":"Completed","position":7},
      {"id":"lost","label":"Lost","position":8}
    ]'::jsonb;

ALTER TABLE clients DROP CONSTRAINT IF EXISTS chk_clients_crm_status;
ALTER TABLE clients ADD CONSTRAINT chk_clients_crm_status
  CHECK (crm_status IN (
    'lead',
    'qualified',
    'proposal_sent',
    'negotiation',
    'advance_received',
    'active_client',
    'completed',
    'lost'
  ));

COMMENT ON COLUMN workspaces.date_format IS 'Workspace display date format preference.';
COMMENT ON COLUMN workspaces.language IS 'Workspace language preference.';
COMMENT ON COLUMN users.phone IS 'User profile phone number.';
COMMENT ON COLUMN users.job_title IS 'User profile job title.';
COMMENT ON COLUMN workspace_settings.reimbursement_rules IS 'Workspace reimbursement policy text.';
COMMENT ON COLUMN workspace_settings.crm_pipeline_stages IS 'Workspace-scoped CRM pipeline stages ordered by position.';
