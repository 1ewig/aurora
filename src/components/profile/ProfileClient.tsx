"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProfileWorkspace } from "./ProfileWorkspace";

export function ProfileClient() {
  const { user, profile, loading, updateProfile, signOut } = useAuthStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    setStatusType("");
    setUpdating(true);

    const { error } = await updateProfile({
      displayName,
      bio,
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProfileWorkspace
      user={user}
      displayName={displayName}
      setDisplayName={setDisplayName}
      bio={bio}
      setBio={setBio}
      statusMsg={statusMsg}
      statusType={statusType}
      updating={updating}
      handleUpdate={handleUpdate}
      handleSignOut={handleSignOut}
    />
  );
}
