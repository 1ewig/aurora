"use client";

import { motion } from "framer-motion";
import { ProfileForm } from "./ProfileForm";

interface ProfileWorkspaceProps {
  userEmail: string;
  onSignOut: () => void;
  displayName: string;
  setDisplayName: (val: string) => void;
  statusMsg: string;
  statusType: "success" | "error" | "";
  updating: boolean;
  handleUpdate: (e: React.FormEvent) => void;
}

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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 sm:mb-8 lg:mb-12"
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider">
          Wardrobe Profile
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-1 max-w-xl">
          Customize your display profile and account specifications.
        </p>
      </motion.div>

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
