"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileForm } from "./ProfileForm";

interface ProfileWorkspaceProps {
  user: { id: string; email: string };
  displayName: string;
  setDisplayName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  statusMsg: string;
  statusType: "success" | "error" | "";
  updating: boolean;
  handleUpdate: (e: React.FormEvent) => void;
  handleSignOut: () => void;
}

export function ProfileWorkspace({
  user,
  displayName,
  setDisplayName,
  bio,
  setBio,
  statusMsg,
  statusType,
  updating,
  handleUpdate,
  handleSignOut,
}: ProfileWorkspaceProps) {
  return (
    <main className="min-h-screen bg-bg-primary px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      <div className="pt-4 sm:pt-6 md:pt-12 lg:pt-16 mb-6 sm:mb-8 md:mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-10 items-start pb-16 sm:pb-20">
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <ProfileSidebar
            user={user}
            displayName={displayName}
            bio={bio}
            onSignOut={handleSignOut}
          />
        </div>

        <ProfileForm
          displayName={displayName}
          setDisplayName={setDisplayName}
          bio={bio}
          setBio={setBio}
          statusMsg={statusMsg}
          statusType={statusType}
          updating={updating}
          onSubmit={handleUpdate}
          onSignOutClick={handleSignOut}
        />
      </div>
    </main>
  );
}
