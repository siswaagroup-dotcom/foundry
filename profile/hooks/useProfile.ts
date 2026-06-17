"use client";

import { useState } from "react";
import { profileConfig } from "../data/profile-config";
import type { PasswordData, PasswordErrors, ProfileData, ProfileErrors } from "../types/profile-types";

const initialProfile: ProfileData = {
  fullName: profileConfig.defaults.user.fullName,
  email: profileConfig.defaults.user.email,
  avatarUrl: profileConfig.defaults.user.avatarUrl,
  photoFile: null,
};

const initialPassword: PasswordData = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function useProfile() {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfile);
  const [passwordData, setPasswordData] = useState<PasswordData>(initialPassword);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  function updateProfileField(field: keyof ProfileData, value: string) {
    setProfileData((current) => ({ ...current, [field]: value }));
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  }
  function updatePasswordField(field: keyof PasswordData, value: string) {
    setPasswordData((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: undefined }));
  }
  function updatePhoto(file: File | null) {
    if (!file) return;
    const maxBytes = profileConfig.avatar.maxSizeMb * 1024 * 1024;
    const acceptedTypes = profileConfig.avatar.acceptedTypes as readonly string[];

    if (!acceptedTypes.includes(file.type)) {
      setProfileErrors((current) => ({
        ...current,
        photoFile: "Use JPG, PNG, or WebP.",
      }));
      return;
    }
    if (file.size > maxBytes) {
      setProfileErrors((current) => ({
        ...current,
        photoFile: "Image must be 2MB or less.",
      }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileData((current) => ({
        ...current,
        avatarUrl: String(reader.result),
        photoFile: file,
      }));
      setProfileErrors((current) => ({ ...current, photoFile: undefined }));
    };
    reader.readAsDataURL(file);
  }
  function validateProfile() {
    const nextErrors: ProfileErrors = {};

    if (
      profileData.fullName.trim().length <
      profileConfig.validation.minNameLength
    ) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!profileConfig.validation.emailPattern.test(profileData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }
  function validatePassword() {
    const nextErrors: PasswordErrors = {};

    if (!passwordData.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (passwordData.newPassword.length < profileConfig.validation.minPasswordLength) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }
  function saveProfile() {
    if (!validateProfile()) return;
    console.log(profileData);
  }
  function changePassword() {
    if (!validatePassword()) return;
    console.log(passwordData);
  }
  function cancel() {
    console.log("Cancel");
  }
  return { profileData, passwordData, profileErrors, passwordErrors, updateProfileField, updatePasswordField, updatePhoto, saveProfile, changePassword, cancel };
}
