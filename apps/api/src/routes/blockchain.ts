import { Router } from 'express'
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers'
import { Address, Account } from '@multiversx/sdk-core'
import { asyncHandler, createError } from '@/middleware/error-handler'
import { logger } from '@/utils/logger'

const router = Router()

// Initialize MultiversX network provider
const networkProvider = new ApiNetworkProvider(
  process.env.MULTIVERSX_API_URL || 'https://devnet-api.multiversx.com'
)

// Get network information
router.get('/info', asyncHandler(async (req, res) => {
  try {
    const networkConfig = await networkProvider.getNetworkConfig()
    const networkStatus = await networkProvider.getNetworkStatus()
    
    res.json({
      success: true,
      data: {
        network: process.env.MULTIVERSX_NETWORK || 'devnet',
        chainId: networkConfig.ChainID,
        gasPerDataByte: networkConfig.GasPerDataByte,
        minGasLimit: networkConfig.MinGasLimit,
        minGasPrice: networkConfig.MinGasPrice,
        currentRound: networkStatus.CurrentRound,
        currentEpoch: networkStatus.EpochNumber,
        blocksPerShard: networkStatus.BlocksPerShard,
        shardsCount: networkStatus.ShardsCount
      }
    })
  } catch (error) {
    logger.error('Failed to get network info:', error)
    throw createError('Failed to fetch network information', 500)
  }
}))

// Get account information
router.get('/account/:address', asyncHandler(async (req, res) => {
  const { address } = req.params
  
  try {
    // Validate address format
    const addr = new Address(address)
    
    // Get account from network
    const account = await networkProvider.getAccount(addr)
    
    res.json({
      success: true,
      data: {
        address: address,
        balance: account.balance.toString(),
        nonce: account.nonce.valueOf(),
        username: account.username || null,
        codeHash: account.codeHash || null,
        rootHash: account.rootHash || null
      }
    })
  } catch (error) {
    logger.error(`Failed to get account info for ${address}:`, error)
    throw createError('Invalid address or failed to fetch account', 400)
  }
}))

// Get transaction by hash
router.get('/transaction/:hash', asyncHandler(async (req, res) => {
  const { hash } = req.params
  
  try {
    const transaction = await networkProvider.getTransaction(hash)
    
    res.json({
      success: true,
      data: {
        hash: transaction.hash,
        sender: transaction.sender,
        receiver: transaction.receiver,
        value: transaction.value,
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
        status: transaction.status,
        timestamp: transaction.timestamp,
        blockHash: transaction.blockHash,
        miniBlockHash: transaction.miniBlockHash
      }
    })
  } catch (error) {
    logger.error(`Failed to get transaction ${hash}:`, error)
    throw createError('Transaction not found', 404)
  }
}))

// Get token information
router.get('/token/:identifier', asyncHandler(async (req, res) => {
  const { identifier } = req.params
  
  try {
    // This would need to be implemented based on MultiversX API
    // Placeholder response
    res.json({
      success: true,
      data: {
        identifier,
        message: 'Token endpoint - implement based on MultiversX API'
      }
    })
  } catch (error) {
    logger.error(`Failed to get token info for ${identifier}:`, error)
    throw createError('Failed to fetch token information', 500)
  }
}))

// Send transaction (placeholder)
router.post('/transaction', asyncHandler(async (req, res) => {
  // This would implement actual transaction sending
  // For now, it's a placeholder
  
  res.json({
    success: true,
    data: {
      message: 'Transaction sending endpoint - implement with proper wallet integration'
    }
  })
}))

export { router as blockchainRoutes }