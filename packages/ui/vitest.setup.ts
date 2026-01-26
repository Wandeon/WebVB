import '@testing-library/jest-dom/vitest';

// Polyfill for Radix UI components that use Pointer Capture
// jsdom doesn't support hasPointerCapture, so we mock it
if (typeof Element !== 'undefined' && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (typeof Element !== 'undefined' && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// Polyfill for scrollIntoView which jsdom doesn't implement
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Mock window.scrollTo
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
