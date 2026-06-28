"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  RefreshCw,
  Trash2,
  Twitter,
  Youtube,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useIntegrationAction,
  useSaveSocialIntegration,
  useSocialDashboard,
} from "@/hooks/useSocialManagement";
import type {
  SaveSocialIntegrationInput,
  SocialAccount,
  SocialIntegration,
  SocialPlatform,
} from "@/types/social";

type PlatformConfig = {
  id: SocialPlatform;
  label: string;
  Icon: typeof Facebook;
  fields: Array<{ key: string; label: string; secret?: boolean; readonly?: boolean }>;
};

const redirectUri =
  typeof window === "undefined" ? "" : `${window.location.origin}/api/social/oauth/callback`;

const platforms: PlatformConfig[] = [
  {
    id: "facebook",
    label: "Facebook",
    Icon: Facebook,
    fields: [
      { key: "facebookAppId", label: "Facebook App ID" },
      { key: "facebookAppSecret", label: "Facebook App Secret", secret: true },
      { key: "graphApiVersion", label: "Graph API Version" },
      { key: "pageId", label: "Page ID" },
      { key: "pageAccessToken", label: "Page Access Token", secret: true },
      { key: "userAccessToken", label: "User Access Token", secret: true },
      { key: "businessId", label: "Business ID" },
    ],
  },
  {
    id: "instagram",
    label: "Instagram Business",
    Icon: Instagram,
    fields: [
      { key: "facebookAppId", label: "Facebook App ID" },
      { key: "facebookAppSecret", label: "Facebook App Secret", secret: true },
      { key: "instagramBusinessAccountId", label: "Instagram Business Account ID" },
      { key: "pageId", label: "Facebook Page ID" },
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
    fields: [
      { key: "clientId", label: "Client ID" },
      { key: "clientSecret", label: "Client Secret", secret: true },
      { key: "organizationId", label: "Organization ID" },
      { key: "redirectUri", label: "Redirect URI", readonly: true },
    ],
  },
  {
    id: "x",
    label: "X (Twitter)",
    Icon: Twitter,
    fields: [
      { key: "apiKey", label: "API Key" },
      { key: "apiSecret", label: "API Secret", secret: true },
      { key: "bearerToken", label: "Bearer Token", secret: true },
      { key: "accessToken", label: "Access Token", secret: true },
      { key: "accessTokenSecret", label: "Access Token Secret", secret: true },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    Icon: Youtube,
    fields: [
      { key: "googleClientId", label: "Google Client ID" },
      { key: "googleClientSecret", label: "Google Client Secret", secret: true },
      { key: "refreshToken", label: "Refresh Token", secret: true },
      { key: "channelId", label: "Channel ID" },
    ],
  },
];

function displayDate(value: string | null) {
  if (!value) return "---";
  return new Date(value).toLocaleString();
}

export function ConnectedAccountsWorkspace() {
  const dashboard = useSocialDashboard();
  const saveIntegration = useSaveSocialIntegration();
  const testIntegration = useIntegrationAction("test");
  const refreshIntegration = useIntegrationAction("refresh");
  const disconnectIntegration = useIntegrationAction("disconnect");
  const deleteIntegration = useIntegrationAction("delete");
  const [selected, setSelected] = useState<PlatformConfig | null>(null);
  const [method, setMethod] = useState<"oauth" | "manual">("oauth");
  const [connectionName, setConnectionName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const integrationsByPlatform = useMemo(() => {
    const map = new Map<SocialPlatform, SocialIntegration>();
    for (const integration of dashboard.data?.integrations ?? []) {
      if (!map.has(integration.platform)) map.set(integration.platform, integration);
    }
    return map;
  }, [dashboard.data?.integrations]);

  const accountsByIntegration = useMemo(() => {
    const map = new Map<string, SocialAccount>();
    for (const account of dashboard.data?.accounts ?? []) {
      if (account.integrationId) map.set(account.integrationId, account);
    }
    return map;
  }, [dashboard.data?.accounts]);

  function openModal(platform: PlatformConfig, integration?: SocialIntegration) {
    setSelected(platform);
    setMethod("oauth");
    setConnectionName(integration?.connectionName ?? integration?.displayName ?? platform.label);
    setCredentials({ redirectUri });
  }

  function startOAuth() {
    if (!selected) return;
    window.location.href = `/api/social/oauth/${selected.id}/start`;
  }

async function saveManual() {
  if (!selected) return;

  const input: SaveSocialIntegrationInput = {
    platform: selected.id,
    connectionType: "manual",

    displayName: connectionName || selected.label,
    connectionName: connectionName || selected.label,
    accountName: connectionName || selected.label,
    handle: connectionName || selected.label,

    credentials: {
      ...credentials,

      appId:
        credentials.appId ??
        credentials.facebookAppId ??
        credentials.clientId ??
        "",

      appSecret:
        credentials.appSecret ??
        credentials.facebookAppSecret ??
        credentials.clientSecret ??
        "",

      pageId:
        credentials.pageId ??
        credentials.facebookPageId ??
        "",

      pageAccessToken:
        credentials.pageAccessToken ??
        credentials.accessToken ??
        credentials.access_token ??
        credentials.token ??
        "",

      graphVersion:
        credentials.graphVersion ??
        credentials.graphApiVersion ??
        "v19.0",

      businessId:
        credentials.businessId ??
        "",

      organizationId:
        credentials.organizationId ??
        "",

      channelId:
        credentials.channelId ??
        "",
    },

    pageId:
      credentials.pageId ??
      credentials.facebookPageId,

    channelId:
      credentials.channelId,

    organizationId:
      credentials.organizationId,

    externalAccountId:
      credentials.pageId ??
      credentials.facebookPageId ??
      credentials.channelId ??
      credentials.organizationId ??
      credentials.instagramBusinessAccountId,
  };

  console.log("Saving Integration", input);

  await saveIntegration.mutateAsync(input);

  setSelected(null);
}

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 bg-white px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-5">
        <div>
          <p className="text-xs font-semibold text-[#64748b]">Social / Connected Accounts</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0f172a]">Connected Accounts</h1>
        </div>
        <Button variant="outline" onClick={() => dashboard.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => {
          const integration = integrationsByPlatform.get(platform.id);
          const account = integration ? accountsByIntegration.get(integration.id) : undefined;
          const Icon = platform.Icon;
          return (
            <article key={platform.id} className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff4ed] text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#111827]">{platform.label}</h2>
                    <p className="mt-1 text-xs font-semibold text-[#64748b]">
                      {integration?.status ?? "disconnected"}
                    </p>
                  </div>
                </div>
              </div>

              <dl className="mt-5 grid gap-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#64748b]">Account</dt>
                  <dd className="font-semibold text-[#111827]">{account?.accountName ?? integration?.accountName ?? "---"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#64748b]">Last Sync</dt>
                  <dd className="font-semibold text-[#111827]">{displayDate(integration?.lastSyncAt ?? null)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#64748b]">Followers</dt>
                  <dd className="font-semibold text-[#111827]">{account?.followersCount?.toLocaleString() ?? "---"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#64748b]">Token Expiry</dt>
                  <dd className="font-semibold text-[#111827]">{displayDate(integration?.expiresAt ?? account?.tokenExpiresAt ?? null)}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="social" onClick={() => openModal(platform, integration)}>
                  {integration ? "Edit Credentials" : "Connect"}
                </Button>
                {integration ? (
                  <>
                    <Button size="social" variant="outline" onClick={() => testIntegration.mutate(integration.id)}>Test</Button>
                    <Button size="social" variant="outline" onClick={() => refreshIntegration.mutate(integration.id)}>Refresh Token</Button>
                    <Button size="social" variant="outline" onClick={() => disconnectIntegration.mutate(integration.id)}>Disconnect</Button>
                    <Button size="social" variant="outline" onClick={() => deleteIntegration.mutate(integration.id)} aria-label="Delete connection">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-[620px] overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Connect {selected.label}</h2>
                <p className="mt-1 text-sm text-[#64748b]">Choose OAuth or encrypted manual credentials.</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-bold text-[#64748b]">Close</button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-[#f8fafc] p-1">
              {(["oauth", "manual"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMethod(option)}
                  className={`h-10 rounded-md text-sm font-bold ${method === option ? "bg-white text-[#111827] shadow-sm" : "text-[#64748b]"}`}
                >
                  {option === "oauth" ? "OAuth" : "Manual Credentials"}
                </button>
              ))}
            </div>

            {method === "oauth" ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-[#475569]">OAuth uses the provider consent screen and stores returned tokens encrypted after callback.</p>
                <Button onClick={startOAuth}>Continue to OAuth</Button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-bold text-[#334155]">
                  Connection Name
                  <Input className="mt-2" value={connectionName} onChange={(event) => setConnectionName(event.target.value)} />
                </label>
                {selected.fields.map((field) => (
                  <label key={field.key} className="block text-sm font-bold text-[#334155]">
                    {field.label}
                    <Input
                      className="mt-2"
                      type={field.secret ? "password" : "text"}
                      value={field.readonly ? redirectUri : credentials[field.key] ?? ""}
                      readOnly={field.readonly}
                      onChange={(event) => setCredentials((current) => ({ ...current, [field.key]: event.target.value }))}
                    />
                  </label>
                ))}
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button onClick={saveManual} disabled={saveIntegration.isPending}>Save</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
