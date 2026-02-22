/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GITHUB_TOKEN?: string;
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Navigation API types (Baseline 2026)
// https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API

interface NavigationDestination {
  readonly url: string;
  readonly key: string | null;
  readonly id: string | null;
  readonly index: number;
  readonly sameDocument: boolean;
  getState(): unknown;
}

interface NavigateEvent extends Event {
  readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse';
  readonly destination: NavigationDestination;
  readonly canIntercept: boolean;
  readonly userInitiated: boolean;
  readonly hashChange: boolean;
  readonly downloadRequest: string | null;
  readonly signal: AbortSignal;
  readonly formData: FormData | null;
  readonly info: unknown;
  readonly hasUAVisualTransition: boolean;
  intercept(options?: { handler?: () => Promise<void>; focusReset?: 'after-transition' | 'manual'; scroll?: 'after-transition' | 'manual' }): void;
  scroll(): void;
  preventDefault(): void;
}

interface Navigation extends EventTarget {
  readonly currentEntry: NavigationHistoryEntry | null;
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  entries(): NavigationHistoryEntry[];
  navigate(url: string, options?: { state?: unknown; history?: 'auto' | 'push' | 'replace'; info?: unknown }): NavigationResult;
  reload(options?: { state?: unknown; info?: unknown }): NavigationResult;
  traverseTo(key: string, options?: { info?: unknown }): NavigationResult;
  back(options?: { info?: unknown }): NavigationResult;
  forward(options?: { info?: unknown }): NavigationResult;
  addEventListener(type: 'navigate', listener: (event: NavigateEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: 'navigatesuccess' | 'navigateerror' | 'currententrychange', listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'navigate', listener: (event: NavigateEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface NavigationHistoryEntry extends EventTarget {
  readonly key: string;
  readonly id: string;
  readonly url: string | null;
  readonly index: number;
  readonly sameDocument: boolean;
  getState(): unknown;
}

interface NavigationResult {
  committed: Promise<NavigationHistoryEntry>;
  finished: Promise<NavigationHistoryEntry>;
}

interface Window {
  navigation: Navigation;
}
