"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
  userEmail: string;
  displayName: string;
  setDisplayName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  statusMsg: string;
  statusType: "success" | "error" | "";
  updating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  userEmail,
  displayName,
  setDisplayName,
  bio,
  setBio,
  statusMsg,
  statusType,
  updating,
  onSubmit,
}: ProfileFormProps) {
  return (
    <div className="bg-bg-secondary border border-border-subtle p-5 sm:p-6 md:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] shadow-sm">
      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl uppercase tracking-wide mb-4 sm:mb-5 md:mb-6 pb-3 sm:pb-4 border-b border-border-subtle">
        Profile Details
      </h3>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
        <div>
          <label
            htmlFor="profile-email"
            className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 sm:mb-2 px-1"
          >
            Email Address
          </label>
          <input
            id="profile-email"
            type="email"
            value={userEmail}
            readOnly
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-bg-primary border border-border-medium rounded-full text-text-secondary opacity-60 cursor-not-allowed text-xs sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="profile-display-name"
            className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 sm:mb-2 px-1"
          >
            Display Name
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-bg-primary border border-border-medium rounded-full focus:border-accent-primary focus:outline-none transition-colors text-xs sm:text-sm"
            placeholder="e.g. Jean Doe"
          />
        </div>

        <div>
          <label
            htmlFor="profile-bio"
            className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 sm:mb-2 px-1"
          >
            Biography
          </label>
          <textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-bg-primary border border-border-medium rounded-[16px] sm:rounded-[20px] focus:border-accent-primary focus:outline-none transition-colors text-xs sm:text-sm resize-none"
            placeholder="Share details about your wardrobe preference, sizing, style matches, etc."
          />
        </div>

        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs sm:text-sm font-medium px-1 ${
              statusType === "success" ? "text-success" : "text-error"
            }`}
          >
            {statusMsg}
          </motion.div>
        )}

        <div className="flex gap-3 pt-1 sm:pt-2">
          <Button
            type="submit"
            variant="filled"
            size="md"
            disabled={updating}
            fullWidth
          >
            {updating ? "Saving Changes..." : "Save Profile Details"}
          </Button>
        </div>
      </form>
    </div>
  );
}
