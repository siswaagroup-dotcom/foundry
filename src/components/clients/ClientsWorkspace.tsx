"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { ClientsFilters } from "./ClientsFilters";
import { ClientsHeader } from "./ClientsHeader";
import { ClientsTable } from "./ClientsTable";
import { SavedFilters } from "./SavedFilters";
import { useClients } from "./hooks/useClients";

export function ClientsWorkspace() {
  const router = useRouter();
  const {
    search,
    setSearch,
    activeFilter,
    activeSavedFilter,
    filteredClients,
    clientFilters,
    savedClientFilters,
    selectFilter,
    selectSavedFilter,
  } = useClients();
  const createClient = useCallback(
    () => router.push("/dashboard/clients/create"),
    [router],
  );
  const selectClient = useCallback(
    (client: { id: string }) => router.push(`/dashboard/clients/${client.id}`),
    [router],
  );

  return (
    <div className="mx-auto min-h-full max-w-[1110px] bg-white">
      <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-6">
        <ClientsHeader
          onCreateClient={createClient}
        />
        <ClientsFilters
          filters={clientFilters}
          activeFilter={activeFilter}
          search={search}
          onSearchChange={setSearch}
          onFilterChange={selectFilter}
        />
      </div>

      <div className="grid border-t border-[#E5E7EB] lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="px-4 py-5 sm:px-6 lg:px-6">
          <ClientsTable
            clients={filteredClients}
            onSelectClient={selectClient}
          />
        </div>

        <SavedFilters
          filters={savedClientFilters}
          activeFilter={activeSavedFilter}
          onSelect={selectSavedFilter}
        />
      </div>
    </div>
  );
}
