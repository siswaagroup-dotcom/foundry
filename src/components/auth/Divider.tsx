export function Divider() {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="h-px flex-1 bg-[#d7d7d7]" />
      <span className="text-xs leading-none text-[#8d8d8d]">
        or continue with
      </span>
      <div className="h-px flex-1 bg-[#d7d7d7]" />
    </div>
  );
}
