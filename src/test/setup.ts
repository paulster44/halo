import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
if (!globalThis.process?.env?.VITE_SUPABASE_URL) {
  globalThis.process = {
    ...globalThis.process,
    env: {
      ...globalThis.process?.env,
      VITE_SUPABASE_URL: 'https://test-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock window.ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock HTML2Canvas for PDF generation tests
const mockHtml2Canvas = () => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,mock-image-data'
})

Object.defineProperty(globalThis, 'html2canvas', {
  value: mockHtml2Canvas
})
