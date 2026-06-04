import type { ApprovalRule } from "./types/settings-types";

type ApprovalRulesProps = {
  approvalRules: ApprovalRule[];
};

export function ApprovalRules({ approvalRules }: ApprovalRulesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {approvalRules.map((rule) => (
        <div
          key={rule.id}
          className="rounded-xl border border-[#edf0f3] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {rule.title}
              </p>
              {rule.description ? (
                <p className="mt-2 text-xs leading-5 text-[#6b7280]">
                  {rule.description}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-primary">
              {rule.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
