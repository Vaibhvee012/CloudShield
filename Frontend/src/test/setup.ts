import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  window.history.pushState({}, "", "/");
});

// jsdom has no ResizeObserver (charts and the cloud map use it).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

// jsdom does not implement scrolling.
window.HTMLElement.prototype.scrollIntoView = () => {};
