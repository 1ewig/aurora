/**
 * Aurora — src/types/lemonsqueezy.d.ts
 *
 * Global type declarations for the LemonSqueezy overlay widget (checkout popup).
 * Augments the Window interface with LemonSqueezy SDK entry points.
 */

interface LemonSqueezyUrlObject {
  Open: (url: string) => void;
  Close: () => void;
}

interface LemonSqueezyObject {
  Url: LemonSqueezyUrlObject;
  Setup: (config: {
    eventHandler: (event: { event: string }) => void;
  }) => void;
}

declare global {
  interface Window {
    LemonSqueezy?: LemonSqueezyObject;
    createLemonSqueezy?: () => void;
  }
}

export {};
