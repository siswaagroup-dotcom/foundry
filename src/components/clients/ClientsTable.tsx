import { ClientRow } from "./ClientRow";
import type { Client } from "./types/client-types";

type ClientsTableProps = {
  clients: Client[];
};

export function ClientsTable({
  clients,
}: ClientsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="hidden h-10 grid-cols-[1.25fr_0.8fr_0.65fr_0.85fr_24px] items-center gap-4 bg-[#fafafa] px-5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#5f6b7a] md:grid">
        <span>Client</span>
        <span>Primary Contact</span>
        <span>Recent Activity</span>
        <span>Tags</span>
        <span />
      </div>

      <div>
        {clients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
          />
        ))}
      </div>
    </section>
  );
}
