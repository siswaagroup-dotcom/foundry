import { Link2 } from "lucide-react";
import { RelatedLinkItem } from "./RelatedLinkItem";
import type { RelatedLink } from "./types/expense-detail-types";

type RelatedLinksProps = {
  relatedLinks: RelatedLink[];
  onLinkClick: (id: string) => void;
};

export function RelatedLinks({
  relatedLinks,
  onLinkClick,
}: RelatedLinksProps) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold">Related Links</h3>
      </div>
      <div className="space-y-3">
        {relatedLinks.map((link) => (
          <RelatedLinkItem
            key={link.id}
            link={link}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </section>
  );
}
