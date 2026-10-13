import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without `globals: true`, so React Testing Library cannot register
// its own auto-cleanup. Without this, each render appends to document.body and
// later tests query a polluted DOM.
afterEach(() => {
  cleanup();
});

// jsdom does not implement the Pointer Capture API that Radix Select calls on
// pointer events. Without these stubs, interacting with a Select throws
// `target.hasPointerCapture is not a function` and aborts the run.
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  // jsdom does not implement scrollIntoView, which Radix Select calls when it
  // opens and highlights the selected candidate.
  Element.prototype.scrollIntoView = () => {};
}

// jsdom does not implement ResizeObserver, which Recharts' ResponsiveContainer
// constructs on mount. Without this stub, rendering the trend chart throws
// `ResizeObserver is not defined` and the whole page fails to render.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
