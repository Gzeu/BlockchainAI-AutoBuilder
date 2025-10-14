'use client'

import { useState } from 'react'
import { Wallet, Copy, ExternalLink, LogOut } from 'lucide-react'
import { useWeb3 } from '@/components/web3-provider'
import toast from 'react-hot-toast'

export function WalletButton() {
  const { isConnected, address, balance, connect, disconnect, isLoading } = useWeb3()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      toast.success('Adresa copiata!')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal: string) => {
    return `${parseFloat(bal).toFixed(2)} EGLD`
  }

  if (isLoading) {
    return (
      <button 
        disabled
        className="flex items-center space-x-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
      >
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Connecting...</span>
      </button>
    )
  }

  if (!isConnected) {
    return (
      <button 
        onClick={connect}
        className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Connect Wallet</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm font-medium">
          {address ? formatAddress(address) : 'Connected'}
        </span>
      </button>
      
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
            <div className="space-y-3">
              {/* Balance */}
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-gray-900">
                  {balance ? formatBalance(balance) : '0.00 EGLD'}
                </div>
                <div className="text-sm text-gray-500">Balance</div>
              </div>
              
              {/* Address */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-gray-900">
                    {address ? formatAddress(address) : 'N/A'}
                  </span>
                  <button 
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    window.open(`https://devnet-explorer.multiversx.com/accounts/${address}`, '_blank')
                  }}
                  className="w-full flex items-center space-x-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View in Explorer</span>
                </button>
                
                <button 
                  onClick={() => {
                    disconnect()
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}