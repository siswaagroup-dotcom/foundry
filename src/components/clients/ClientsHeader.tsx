import { Plus } from "lucide-react";

type ClientsHeaderProps = {
  onCreateClient: () => void;
};

export function ClientsHeader({
  onCreateClient,
}: ClientsHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-[24px] font-bold leading-none text-[#0f172a]">
        Clients
      </h1>

      <button
        type="button"
        onClick={onCreateClient}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f15a24] px-5 text-xs font-bold text-white shadow-[0_5px_12px_rgba(241,90,36,0.24)] transition hover:bg-[#e95420]"
      >
        <Plus className="h-3.5 w-3.5" />
        New Client
      </button>
    </header>
  );
}
