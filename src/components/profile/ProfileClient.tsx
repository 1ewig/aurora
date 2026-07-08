/**
 * Aurora — src/components/profile/ProfileClient.tsx
 *
 * Profile page logic: auth guard, display name state, and update/sign-out handlers.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProfileWorkspace } from "./ProfileWorkspace";

/** Renders the profile page with auth guard, display name editing, and sign-out flow. */
export function ProfileClient() {
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const [displayName, setDisplayName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    setStatusType("");
    setUpdating(true);

    const { error } = await updateProfile({
      displayName,
    });

    setUpdating(false);
    if (error) {
      setStatusType("error");
      setStatusMsg(error.message || "Failed to update profile.");
    } else {
      setStatusType("success");
      setStatusMsg("Profile updated successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const hasChanges = displayName.trim() !== (profile?.displayName || "") && displayName.trim().length > 0;

  if (!user) return null;

  return (
    <ProfileWorkspace
      userEmail={user.email || ""}
      onSignOut={handleSignOut}
      displayName={displayName}
      setDisplayName={setDisplayName}
      statusMsg={statusMsg}
      statusType={statusType}
      updating={updating}
      handleUpdate={handleUpdate}
      hasChanges={hasChanges}
    />
  );
}
