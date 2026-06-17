"use client";

import { ProfileForm } from "./ProfileForm";
import { useProfile } from "./hooks/useProfile";

export function ProfilePage() {
  const profile = useProfile();

  return (
    <main className="min-h-screen bg-[#f7f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[560px] items-center">
        <section className="w-full rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold leading-tight text-[#1f2933]">
              User Profile
            </h1>
          </div>
          <ProfileForm profile={profile} />
        </section>
      </div>
    </main>
  );
}
