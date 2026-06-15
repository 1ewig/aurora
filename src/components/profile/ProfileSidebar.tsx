"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";


interface ProfileSidebarProps {
  onClose?: () => void;
}

export function ProfileSidebar({ onClose }: ProfileSidebarProps) {
  const pathname = usePathname();

  const isProfileActive = pathname === "/profile";
  const isOrdersActive = pathname === "/profile/orders";

  return (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8">
      <div>
        {/* Logo and Brand */}
        <div className="mb-8 px-2">
          <Link
            href="/"
            onClick={onClose}
            className="font-display font-black text-xl tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
          >
            Aurora
          </Link>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold mt-1">
            Wardrobe Space
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex flex-col">
          <Link
            href="/profile"
            onClick={onClose}
            className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 font-semibold uppercase tracking-wider px-4 py-3 rounded-full ${isProfileActive
                ? "bg-bg-ink text-text-inverted"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Profile
          </Link>

          <Link
            href="/profile/orders"
            onClick={onClose}
            className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 font-semibold uppercase tracking-wider px-4 py-3 rounded-full ${isOrdersActive
                ? "bg-bg-ink text-text-inverted"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            Orders
          </Link>
        </nav>
      </div>

      {/* Back to Shop section */}
      <div className="pt-4 border-t border-border-subtle mt-6">
        <Link
          href="/products"
          onClick={onClose}
          className="w-full py-4 bg-bg-ink text-text-inverted rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 hover:bg-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
