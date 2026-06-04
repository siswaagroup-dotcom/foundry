import { RelatedItem } from "./RelatedItem";
import type { RelatedItem as Related } from "./types/social-post-detail-types";

type RelatedSectionProps = {
  relatedItems: Related[];
  onItemClick: (id: string) => void;
};

export function RelatedSection({
  relatedItems,
  onItemClick,
}: RelatedSectionProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <h3 className="text-base font-bold">Related</h3>
      </div>
      <div>
        {relatedItems.map((item) => (
          <RelatedItem key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>
    </section>
  );
}
