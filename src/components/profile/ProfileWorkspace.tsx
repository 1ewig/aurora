import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import Link from "next/link";

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
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "AM";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

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
          {/* Profile Card — responsive unified layout */}
          <div className="bg-bg-ink text-text-inverted rounded-[20px] sm:rounded-[24px] relative overflow-hidden shadow-lg border border-white/10">
            {/* Decorative "A" — desktop only */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-6 translate-x-6 hidden lg:block">
              <span className="font-display font-black text-[12rem] uppercase leading-none select-none">
                A
              </span>
            </div>

            <div className="relative z-10 p-4 sm:p-5 lg:p-8">
              {/* Mobile: horizontal compact row */}
              <div className="flex lg:flex-col items-center lg:text-center gap-3 sm:gap-4 lg:gap-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 shrink-0 rounded-full border border-accent-primary bg-bg-primary/10 flex items-center justify-center font-display font-bold text-base sm:text-lg lg:text-xl tracking-wider text-accent-primary select-none">
                  {displayName ? getInitials(displayName) : "AM"}
                </div>

                <div className="min-w-0 flex-1 lg:flex-none">
                  {/* Mobile: horizontal name + badge */}
                  <div className="lg:text-center">
                    <h2 className="font-display font-bold text-base sm:text-lg lg:text-2xl tracking-wide uppercase truncate lg:mt-5 lg:mb-1">
                      {displayName || "Unnamed Member"}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-accent-primary uppercase tracking-widest font-semibold">
                      Aurora Member
                    </p>
                  </div>

                  {/* Email — mobile only, under name */}
                  <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 lg:hidden truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Desktop divider + bio + details */}
              <div className="hidden lg:block">
                <div className="w-full border-t border-white/10 my-4"></div>

                <p className="text-sm text-text-muted italic line-clamp-3 mb-6 text-center max-w-xs mx-auto">
                  {bio || "No biography provided yet. Edit your profile to share details."}
                </p>

                <div className="w-full text-left space-y-2 text-xs text-text-muted">
                  <div>
                    <span className="font-semibold text-white">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-semibold text-white">ID:</span>{" "}
                    <code className="text-[10px] bg-white/5 px-1 py-0.5 rounded">
                      {user.id.substring(0, 8)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop nav links — sidebar */}
          <div className="hidden lg:block space-y-3 mt-6">
            <Link
              href="/profile/orders"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium w-full py-2 px-4 rounded-full border border-border-subtle hover:border-border-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Purchase History
            </Link>

            <Button
              onClick={() => setShowSignOutDialog(true)}
              variant="ghost"
              fullWidth
              size="md"
              className="hover:border-error hover:text-error hover:bg-transparent rounded-full"
            >
              Sign Out Session
            </Button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-8 bg-bg-secondary border border-border-subtle p-5 sm:p-6 md:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] shadow-sm">
          <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl uppercase tracking-wide mb-4 sm:mb-5 md:mb-6 pb-3 sm:pb-4 border-b border-border-subtle">
            Profile Details
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-5 md:space-y-6">
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

            <div className="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2">
              <Button
                type="submit"
                variant="filled"
                size="md"
                disabled={updating}
                fullWidth
                className="sm:flex-1"
              >
                {updating ? "Saving Changes..." : "Save Profile Details"}
              </Button>

              {/* Mobile nav links — shown below the main form buttons */}
              <div className="flex flex-col gap-2 lg:hidden mt-2 sm:mt-0">
                <Link
                  href="/profile/orders"
                  className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium w-full py-2.5 px-5 rounded-full border border-border-subtle hover:border-border-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Purchase History
                </Link>

                <Button
                  onClick={() => setShowSignOutDialog(true)}
                  variant="ghost"
                  size="md"
                  fullWidth
                  className="hover:border-error hover:text-error hover:bg-transparent rounded-full"
                >
                  Sign Out Session
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showSignOutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out of your Aurora wardrobe profile? You will need to sign in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowSignOutDialog(false);
          handleSignOut();
        }}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </main>
  );
}
