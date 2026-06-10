"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, signOut } = useAuthStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
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
      avatarUrl,
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
    router.push("/auth");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wider mb-2">
          Wardrobe Profile
        </h1>
        <p className="text-text-secondary max-w-xl">
          Customize your display profile and account specifications for the Aurora collection.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Live Preview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-ink text-text-inverted rounded-lg p-8 relative overflow-hidden shadow-lg border border-white/10">
            {/* Elegant Background Grid / Accent */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
              <span className="font-display font-black text-[12rem] uppercase leading-none select-none">
                A
              </span>
            </div>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full border-2 border-accent-primary overflow-hidden bg-bg-primary/10 mb-5 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName || "Profile avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>

              <h2 className="font-display font-bold text-2xl tracking-wide uppercase mb-1">
                {displayName || "Unnamed Member"}
              </h2>
              <p className="text-xs text-accent-primary uppercase tracking-widest font-semibold mb-4">
                Aurora Member
              </p>

              <div className="w-full border-t border-white/10 my-4"></div>

              <p className="text-sm text-text-muted italic max-w-xs line-clamp-3 mb-6">
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

          <button
            onClick={handleSignOut}
            className="w-full py-3 border border-border-medium hover:border-error hover:text-error rounded uppercase tracking-wider text-sm font-semibold transition-all duration-300 bg-bg-secondary"
          >
            Sign Out Session
          </button>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-8 bg-bg-secondary border border-border-subtle p-8 md:p-10 rounded-lg shadow-sm">
          <h3 className="font-display font-bold text-2xl uppercase tracking-wide mb-6 pb-4 border-b border-border-subtle">
            Profile Details
          </h3>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="profile-display-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                >
                  Display Name
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
                  placeholder="e.g. Jean Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-avatar-url"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                >
                  Avatar Image URL
                </label>
                <input
                  id="profile-avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
              >
                Biography
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary border border-border-medium rounded focus:border-accent-primary focus:outline-none transition-colors text-sm resize-none"
                placeholder="Share details about your wardrobe preference, sizing, style matches, etc."
              />
            </div>

            {statusMsg && (
              <div
                className={`text-xs font-medium ${
                  statusType === "success" ? "text-success" : "text-error"
                }`}
              >
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="px-8 py-3 bg-bg-ink hover:bg-accent-primary text-white hover:text-bg-ink font-semibold rounded uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50"
            >
              {updating ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
