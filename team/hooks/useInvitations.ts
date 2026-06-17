"use client";

// =============================================================================
// HOOK — useInvitations
//
// Manages all workspace invitation state and actions.
// Wraps team.service.ts — no direct data imports in components.
//
// Responsibilities:
//   - List all invitations for the workspace
//   - Invite a new member (with validation)
//   - Resend an invitation
//   - Revoke an invitation
//
// API-READY: All actions call the service layer, which will swap to
// real fetch() calls when the backend is connected. No changes needed here.
// =============================================================================

import { useCallback, useEffect, useState } from "react";
import {
  getInvitations,
  inviteMember,
  resendInvitation,
  revokeInvitation,
} from "../services/team.service";
import type {
  InviteMemberFormData,
  WorkspaceInvitation,
} from "../types/team-types";

export function useInvitations() {
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load invitations on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    getInvitations()
      .then((data) => {
        if (!cancelled) {
          setInvitations(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load invitations.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Pending invitations only — used in PendingInvites sidebar card
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );

  // ---------------------------------------------------------------------------
  // inviteMember
  // Validates, calls service, updates local state on success.
  // Returns error string or null.
  // ---------------------------------------------------------------------------
  const invite = useCallback(
    async (data: InviteMemberFormData): Promise<{ error: string | null; rawToken?: string }> => {
      setIsSubmitting(true);
      setError(null);

      const result = await inviteMember(data);
      setIsSubmitting(false);

      if (!result.success) {
        return { error: result.error ?? "Failed to send invitation." };
      }

      if (result.invitation) {
        setInvitations((prev) => [result.invitation!, ...prev]);
      }

      const rawToken = (result.invitation as WorkspaceInvitation & { rawToken?: string })?.rawToken;
      return { error: null, rawToken };
    },
    []
  );
  const resend = useCallback(async (invitationId: string): Promise<string | null> => {
    const result = await resendInvitation(invitationId);
    if (!result.success) {
      return result.error ?? "Failed to resend invitation.";
    }

    // Update local state: reset status to pending, update invitedAt
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: "pending", invitedAt: "Just now" }
          : inv
      )
    );

    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // revokeInvitation
  // ---------------------------------------------------------------------------
  const revoke = useCallback(async (invitationId: string): Promise<string | null> => {
    const result = await revokeInvitation(invitationId);
    if (!result.success) {
      return result.error ?? "Failed to revoke invitation.";
    }

    // Update local state: mark as revoked
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId ? { ...inv, status: "revoked" } : inv
      )
    );

    return null;
  }, []);

  return {
    invitations,
    pendingInvitations,
    isLoading,
    isSubmitting,
    error,
    invite,
    resend,
    revoke,
  };
}
