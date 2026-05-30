import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  action,
  children,
  className,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#e5e7eb] bg-white shadow-sm",
        className,
      )}
    >
      {title || action ? (
        <div className="flex min-h-12 items-center justify-between border-b border-[#edf0f3] px-4 py-3">
          {title ? <h2 className="text-sm font-bold">{title}</h2> : <div />}
          {action}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
