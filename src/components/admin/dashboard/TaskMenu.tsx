"use client";

import Link from "next/link";

export function TaskMenu() {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm space-y-5">
      <h3 className="font-display font-bold text-lg uppercase tracking-wider text-text-primary border-b border-border-subtle pb-4">
        Operational Tasks
      </h3>
      
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/products"
          className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">Catalog Editor</div>
            <div className="text-xs text-text-secondary mt-1">Add or adjust sizes & stock</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>

        <Link
          href="/admin/orders"
          className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">Order Fulfillment</div>
            <div className="text-xs text-text-secondary mt-1">Fulfill pending orders</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>

        <Link
          href="/"
          className="p-4 bg-bg-primary/40 rounded-xl border border-border-subtle hover:border-accent-primary transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">View Customer Site</div>
            <div className="text-xs text-text-secondary mt-1">Navigate back to user catalog</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-text-secondary group-hover:text-accent-primary group-hover:translate-x-1 transition-all">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
