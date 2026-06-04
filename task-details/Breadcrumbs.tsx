import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "./types/task-details-types";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
      {items.map((item, index) => (
        <span key={item.id} className="inline-flex items-center gap-2">
          <span className={index === items.length - 1 ? "text-[#4b5563]" : ""}>
            {item.label}
          </span>
          {index < items.length - 1 ? (
            <ChevronRight className="h-3 w-3 text-[#9ca3af]" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}
