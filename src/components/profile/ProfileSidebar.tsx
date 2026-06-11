"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ProfileSidebarProps {
  user: { id: string; email: string };
  displayName: string;
  bio: string;
  onSignOut: () => void;
}

export function ProfileSidebar({
  user,
  displayName,
  bio,
  onSignOut,
}: ProfileSidebarProps) {
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
    <>
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

      <ConfirmDialog
        open={showSignOutDialog}
        title="Sign Out"
        description="Are you sure you want to sign out of your Aurora wardrobe profile? You will need to sign in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowSignOutDialog(false);
          onSignOut();
        }}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </>
  );
}
