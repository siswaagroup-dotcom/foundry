import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "orange" | "blue" | "green" | "red" | "gray";
};

export function StatusBadge({ children, tone = "gray" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
        tone === "orange" && "bg-orange-50 text-orange-700",
        tone === "blue" && "bg-blue-50 text-blue-700",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "gray" && "bg-gray-100 text-gray-700",
      )}
    >
      {children}
    </span>
  );
}
