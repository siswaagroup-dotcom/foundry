import { Heart } from "lucide-react";
import { ReviewerCard } from "./ReviewerCard";
import type { Reviewer } from "./types/task-details-types";

type ReviewersSectionProps = {
  reviewers: Reviewer[];
};

export function ReviewersSection({ reviewers }: ReviewersSectionProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Reviewers</h3>
      </div>

      <div className="space-y-3">
        {reviewers.map((reviewer) => (
          <ReviewerCard key={reviewer.id} reviewer={reviewer} />
        ))}
      </div>
    </section>
  );
}
