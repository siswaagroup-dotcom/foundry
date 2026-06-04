import { AuthCard } from "@/components/auth/AuthCard";
import { HeroSection } from "@/components/landing/HeroSection";

export function AuthLayout() {
  return (
    <main className="auth-fade-in h-dvh w-screen overflow-hidden bg-background">
      <div className="grid h-full min-h-0 lg:grid-cols-[56%_44%] xl:grid-cols-[58%_42%]">
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <HeroSection />
        </div>

        <section className="flex min-h-0 items-center justify-center overflow-hidden bg-[#f8fafc] p-3 sm:p-5 lg:p-6">
          <div className="flex w-full max-w-[420px] items-center justify-center lg:max-w-[480px]">
            <AuthCard />
          </div>
        </section>
      </div>
    </main>
  );
}
