"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCrmPipeline, useUpdateCrmStatus } from "@/hooks/useClients";
import { useToast } from "@/components/ui/toast";
import { ClientPipelineBoard } from "@/components/clients/ClientPipelineBoard";
import type { CrmStage } from "@/types/client";

export default function ClientPipelinePage() {
  const { toast } = useToast();
  const { data: pipeline, isLoading } = useCrmPipeline();
  const moveMutation = useUpdateCrmStatus();

  const handleClientMove = useCallback(
    (clientId: string, newStage: CrmStage) => {
      moveMutation.mutate(
        { id: clientId, crmStatus: newStage },
        { onError: () => toast({ title: "Failed to update stage", variant: "error" }) }
      );
    },
    [moveMutation, toast]
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/clients"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-xs font-medium text-[#4b5563] hover:bg-[#f8fafc]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Clients
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">CRM Pipeline</h1>
          </div>
          <p className="mt-1 text-sm text-[#6b7280]">
            Drag clients between stages to update their lifecycle status.
          </p>
        </div>
      </div>

      {/* Board */}
      {isLoading || !pipeline ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <ClientPipelineBoard
          pipeline={pipeline}
          onClientMove={handleClientMove}
        />
      )}
    </div>
  );
}
