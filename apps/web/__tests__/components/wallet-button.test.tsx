import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WalletButton } from '@/components/ui/wallet-button'
import { Web3Provider } from '@/lib/providers'

jest.mock('@multiversx/sdk-web-wallet-provider', () => ({
  WalletProvider: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(true),
    login: jest.fn().mockResolvedValue({ address: 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhllllsqg94ah' }),
    logout: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    isConnected: jest.fn().mockReturnValue(true),
    getAddress: jest.fn().mockReturnValue('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhllllsqg94ah')
  }))
}))

const MockWrapper = ({ children }: { children: React.ReactNode }) => (
  <Web3Provider>{children}</Web3Provider>
)

describe('WalletButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
        removeItem: jest.fn(() => null),
        clear: jest.fn(() => null),
      },
      writable: true
    })
  })

  it('renders connect button when wallet is not connected', () => {
    render(
      <MockWrapper>
        <WalletButton />
      </MockWrapper>
    )
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('shows loading state during connection', async () => {
    render(
      <MockWrapper>
        <WalletButton />
      </MockWrapper>
    )
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })
  })

  it('displays wallet address when connected', async () => {
    const mockAddress = 'erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhllllsqg94ah'
    render(
      <MockWrapper>
        <WalletButton />
      </MockWrapper>
    )
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    await waitFor(() => {
      expect(screen.getByText(mockAddress.slice(0, 6) + '...' + mockAddress.slice(-4))).toBeInTheDocument()
    })
  })
})