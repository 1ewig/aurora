import Link from "next/link";
import { footerNav } from "@/data/navigation";

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.24-5.26 1.24-5.26s-.32-.63-.32-1.57c0-1.47.85-2.57 1.91-2.57.9 0 1.34.68 1.34 1.49 0 .91-.58 2.27-.88 3.53-.25 1.06.53 1.92 1.57 1.92 1.88 0 3.15-2.4 3.15-5.23 0-2.16-1.46-3.67-3.55-3.67-2.42 0-3.84 1.82-3.84 3.7 0 .73.28 1.52.63 1.95a.25.25 0 01.06.24l-.23.96c-.04.15-.12.18-.28.11-1.05-.49-1.71-2.02-1.71-3.25 0-2.65 1.92-5.07 5.54-5.07 2.91 0 5.16 2.07 5.16 4.84 0 2.89-1.82 5.21-4.34 5.21-.85 0-1.64-.44-1.91-.96l-.52 1.93c-.19.71-.69 1.61-1.03 2.15.78.24 1.6.37 2.45.37 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-[#F7F7F5] border-t border-[#E8E8E4]"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-20 py-20">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <p className="font-display font-black text-xl tracking-[0.15em] uppercase text-[#111111]">
              Aurora
            </p>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mt-4 max-w-[220px]">
              Designed in solitude.
              <br />
              Worn with intention.
            </p>
            <p className="text-[#ABABAB] text-xs mt-6 leading-relaxed max-w-[200px]">
              Free returns within 30 days. Complimentary shipping on orders
              over $500.
            </p>
          </div>

          {/* Nav Columns */}
          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-medium tracking-[0.1em] uppercase text-[#ABABAB] mb-5">
                {column.title}
              </h3>
              <ul role="list" className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={`/${link.href}`}
                      className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-[#E8E8E4]">
          <p className="text-xs text-[#ABABAB]">
            © 2025 Aurora. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs text-[#ABABAB]">
            <a href="#" className="hover:text-[#111111] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#111111] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#111111] transition-colors">
              Cookies
            </a>
          </div>

          <div
            className="flex gap-5 text-[#6B6B6B]"
            aria-label="Social media links"
          >
            <a
              href="https://instagram.com"
              aria-label="Aurora on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111111] transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://pinterest.com"
              aria-label="Aurora on Pinterest"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111111] transition-colors"
            >
              <PinterestIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
