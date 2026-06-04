import type { TeamRole } from "./types/team-types";

type RoleCardProps = {
  role: TeamRole;
};

export function RoleCard({ role }: RoleCardProps) {
  return (
    <div className="rounded-xl border border-[#edf0f3] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{role.name}</p>
          <p className="mt-1 text-xs leading-5 text-[#6b7280]">
            {role.description}
          </p>
        </div>
        <span className="rounded-full bg-[#f3f4f6] px-2 py-1 text-xs font-semibold text-[#4b5563]">
          {role.count}
        </span>
      </div>
    </div>
  );
}
