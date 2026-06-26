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
