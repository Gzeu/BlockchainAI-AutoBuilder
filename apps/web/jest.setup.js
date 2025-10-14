import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    section: ({ children, ...props }) => React.createElement('section', props, children),
    h1: ({ children, ...props }) => React.createElement('h1', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    button: ({ children, ...props }) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const icons = [
    'Activity', 'ArrowRight', 'Book', 'Calendar', 'Check', 'ChevronDown',
    'ChevronRight', 'Clock', 'Code', 'Code2', 'Copy', 'Database',
    'Download', 'Eye', 'EyeOff', 'FolderOpen', 'Github', 'Home',
    'LayoutDashboard', 'Loader2', 'Lock', 'LogOut', 'Mail', 'Menu',
    'Plus', 'Play', 'Rocket', 'Shield', 'Sparkles', 'TrendingUp',
    'User', 'Users', 'X', 'Zap'
  ]
  
  const mockIcons = {}
  icons.forEach(icon => {
    mockIcons[icon] = ({ className, ...props }) => 
      React.createElement('svg', {
        'data-testid': `${icon.toLowerCase()}-icon`,
        className,
        ...props
      })
  })
  
  return mockIcons
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Setup global test utilities
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
})