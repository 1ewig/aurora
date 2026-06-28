/**
 * Aurora — src/components/profile/ProfileWorkspace.tsx
 *
 * Profile workspace layout wrapping the profile form with a heading.
 */
"use client";

import { ProfileForm } from "./ProfileForm";

interface ProfileWorkspaceProps {
  userEmail: string;
  onSignOut: () => Promise<void>;
  displayName: string;
  setDisplayName: (val: string) => void;
  statusMsg: string;
  statusType: "success" | "error" | "";
  updating: boolean;
  handleUpdate: (e: React.FormEvent) => void;
}

/** Renders the profile workspace with an animated heading and the ProfileForm. */
export function ProfileWorkspace({
  userEmail,
  onSignOut,
  displayName,
  setDisplayName,
  statusMsg,
  statusType,
  updating,
  handleUpdate,
}: ProfileWorkspaceProps) {
  return (
    <>
      <div
        className="mb-6 sm:mb-8 lg:mb-12"
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider">
          Wardrobe Profile
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-1 max-w-xl">
          Customize your display profile and account specifications.
        </p>
      </div>

      <ProfileForm
        userEmail={userEmail}
        onSignOut={onSignOut}
        displayName={displayName}
        setDisplayName={setDisplayName}
        statusMsg={statusMsg}
        statusType={statusType}
        updating={updating}
        onSubmit={handleUpdate}
      />
    </>
  );
}
