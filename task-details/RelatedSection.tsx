import { ChevronRight, Link2, Users } from "lucide-react";
import type { RelatedEntity } from "./types/task-details-types";

type RelatedSectionProps = {
  relatedEntities: RelatedEntity[];
};

export function RelatedSection({ relatedEntities }: RelatedSectionProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Related</h3>
      </div>

      <div className="space-y-3">
        {relatedEntities.map((entity) => (
          <div
            key={entity.id}
            className="flex items-center gap-3 rounded-lg bg-[#f8fafc] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{entity.title}</p>
              <p className="mt-1 truncate text-xs text-[#6b7280]">
                {entity.subtitle}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
          </div>
        ))}
      </div>
    </section>
  );
}
