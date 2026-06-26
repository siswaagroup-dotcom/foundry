import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CrmPipelineStage } from "../types/settings-types";

type Props = {
  stages: CrmPipelineStage[];
  onChange: (stages: CrmPipelineStage[]) => void;
  onSave: () => void;
  saving: boolean;
};

export function CrmSettings({ stages, onChange, onSave, saving }: Props) {
  function updateStage(index: number, label: string) {
    onChange(
      stages.map((stage, currentIndex) =>
        currentIndex === index ? { ...stage, label } : stage
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {stages.map((stage, index) => (
          <label key={`${stage.id}-${stage.position}`} className="block">
            <span className="text-sm font-semibold text-[#111827]">Stage {stage.position}</span>
            <Input
              value={stage.label}
              onChange={(event) => updateStage(index, event.target.value)}
              className="mt-2"
            />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save CRM Settings"}
        </Button>
      </div>
    </div>
  );
}
