'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Address, Account } from '@multiversx/sdk-core'

interface Web3ContextType {
  isConnected: boolean
  account: Account | null
  address: string | null
  balance: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
}

const Web3Context = createContext<Web3ContextType | null>(null)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connect = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement actual wallet connection logic
      // This is a placeholder
      console.log('Connecting to wallet...')
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock data for development
      const mockAddress = 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4c5'
      setAddress(mockAddress)
      setIsConnected(true)
      setBalance('1000.0')
      
      console.log('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAccount(null)
    setAddress(null)
    setBalance(null)
    console.log('Wallet disconnected')
  }

  const value: Web3ContextType = {
    isConnected,
    account,
    address,
    balance,
    connect,
    disconnect,
    isLoading
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}