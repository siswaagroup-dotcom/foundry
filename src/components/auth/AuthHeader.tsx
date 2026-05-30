type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-2xl font-bold leading-tight tracking-normal text-[#111827] sm:text-[28px] lg:text-[32px]">
        {title}
      </h1>
      <p className="mt-1 text-xs leading-5 text-[#6b7280] sm:text-[13px] lg:text-sm">
        {subtitle}
      </p>
    </header>
  );
}
