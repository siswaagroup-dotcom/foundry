"use client";

// =============================================================================
// HOOK — useWorkspaceMembers
//
// Manages all workspace member state and actions.
// Wraps team.service.ts — no direct data imports in components.
//
// Responsibilities:
//   - List all members in the workspace
//   - Change a member's role
//   - Remove a member from the workspace
//
// API-READY: Actions call the service layer. Swap service methods to
// real fetch() calls when backend is ready. No hook changes required.
// =============================================================================

import { useCallback, useEffect, useState } from "react";
import {
  changeRole,
  getMembers,
  removeMember,
} from "../services/team.service";
import type {
  ChangeRoleFormData,
  WorkspaceMember,
  WorkspaceRole,
} from "../types/team-types";

export function useWorkspaceMembers() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load members on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    getMembers()
      .then((data) => {
        if (!cancelled) {
          setMembers(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load team members.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // changeRole
  // Updates a member's role. Returns error string or null.
  // ---------------------------------------------------------------------------
  const updateRole = useCallback(
    async (data: ChangeRoleFormData): Promise<string | null> => {
      const result = await changeRole(data);

      if (!result.success) {
        return result.error ?? "Failed to change role.";
      }

      // Update local state optimistically
      setMembers((prev) =>
        prev.map((m) =>
          m.id === data.memberId ? { ...m, role: data.role } : m
        )
      );

      return null;
    },
    []
  );

  // ---------------------------------------------------------------------------
  // removeMember
  // Removes a member from the workspace. Returns error string or null.
  // ---------------------------------------------------------------------------
  const remove = useCallback(async (memberId: string): Promise<string | null> => {
    const result = await removeMember(memberId);

    if (!result.success) {
      return result.error ?? "Failed to remove member.";
    }

    // Remove from local state
    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // Derived: role summary counts
  // Used by RolesSummary component to show member counts per role.
  // Computed from live members state — stays in sync with changes.
  // ---------------------------------------------------------------------------
  const roleSummary = useCallback((): Record<WorkspaceRole, number> => {
    const counts: Record<WorkspaceRole, number> = {
      Owner: 0,
      Admin: 0,
      Manager: 0,
      Member: 0,
      Viewer: 0,
    };
    members.forEach((m) => {
      if (m.role in counts) {
        counts[m.role as WorkspaceRole]++;
      }
    });
    return counts;
  }, [members]);

  return {
    members,
    isLoading,
    error,
    updateRole,
    remove,
    roleSummary,
  };
}
