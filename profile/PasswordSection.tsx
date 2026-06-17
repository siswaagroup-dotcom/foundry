"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PasswordData, PasswordErrors } from "./types/profile-types";

type PasswordSectionProps = {
  passwordData: PasswordData;
  errors: PasswordErrors;
  onChange: (field: keyof PasswordData, value: string) => void;
  onChangePassword: () => void;
};

const fields: { id: keyof PasswordData; label: string }[] = [
  { id: "currentPassword", label: "Current Password" },
  { id: "newPassword", label: "New Password" },
  { id: "confirmPassword", label: "Confirm Password" },
];

export function PasswordSection({
  passwordData,
  errors,
  onChange,
  onChangePassword,
}: PasswordSectionProps) {
  return (
    <form
      className="space-y-4 border-t border-[#e5e7eb] pt-5"
      onSubmit={(event) => {
        event.preventDefault();
        onChangePassword();
      }}
    >
      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type="password"
            value={passwordData[field.id]}
            onChange={(event) => onChange(field.id, event.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errors[field.id])}
          />
          <p className="min-h-4 text-xs leading-4 text-primary">
            {errors[field.id]}
          </p>
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit">Change Password</Button>
      </div>
    </form>
  );
}
