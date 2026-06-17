"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordSection } from "./PasswordSection";
import { ProfilePhoto } from "./ProfilePhoto";
import type { useProfile } from "./hooks/useProfile";

type ProfileFormProps = {
  profile: ReturnType<typeof useProfile>;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <div className="space-y-5">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          profile.saveProfile();
        }}
      >
        <ProfilePhoto
          avatarUrl={profile.profileData.avatarUrl}
          fullName={profile.profileData.fullName}
          error={profile.profileErrors.photoFile}
          onPhotoChange={profile.updatePhoto}
        />

        <div className="space-y-1.5">
          <Label htmlFor="fullName">
            Full Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="fullName"
            value={profile.profileData.fullName}
            onChange={(event) => profile.updateProfileField("fullName", event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(profile.profileErrors.fullName)}
          />
          <p className="min-h-4 text-xs leading-4 text-primary">
            {profile.profileErrors.fullName}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.profileData.email}
            onChange={(event) => profile.updateProfileField("email", event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(profile.profileErrors.email)}
          />
          <p className="min-h-4 text-xs leading-4 text-primary">
            {profile.profileErrors.email}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={profile.cancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>

      <PasswordSection
        passwordData={profile.passwordData}
        errors={profile.passwordErrors}
        onChange={profile.updatePasswordField}
        onChangePassword={profile.changePassword}
      />
    </div>
  );
}
