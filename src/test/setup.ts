import '@testing-library/jest-dom/vitest'

class ResizeObserverStub {
  observe() {}

  unobserve() {}

  disconnect() {}
}

if (!('ResizeObserver' in window)) {
  // React Flow relies on ResizeObserver for viewport setup in tests.
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: ResizeObserverStub,
  })
}
