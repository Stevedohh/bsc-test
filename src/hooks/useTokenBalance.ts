import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'

import { Token } from '@/network/types/token'
import { isNativeToken } from '@/utils'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const

export const useTokenBalance = (token: Token | null) => {
  const { address: userAddress, isConnected } = useAccount()

  const isNative = token ? isNativeToken(token.address) : false

  const {
    data: nativeBalance,
    isLoading: isNativeLoading
  } = useBalance({
    address: userAddress,
    query: {
      enabled: isConnected && isNative && !!token,
      refetchInterval: 10000,
    },
  })

  const {
    data: tokenBalance,
    isLoading: isTokenLoading
  } = useReadContract({
    address: token?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: isConnected && !isNative && !!token && !!userAddress,
      refetchInterval: 10000,
    },
  })

  if (!isConnected || !token) {
    return {
      balance: null,
      formattedBalance: '0',
      isLoading: false,
    }
  }

  const isLoading = isNative ? isNativeLoading : isTokenLoading
  const rawBalance = isNative ? nativeBalance?.value : tokenBalance

  if (isLoading || !rawBalance) {
    return {
      balance: null,
      formattedBalance: '0',
      isLoading,
    }
  }

  const decimals = parseInt(token.decimals)
  const balance = formatUnits(rawBalance, decimals)

  const numBalance = parseFloat(balance)
  let formattedBalance = '0'

  if (numBalance === 0) {
    formattedBalance = '0'
  } else if (numBalance < 0.001) {
    formattedBalance = '< 0.001'
  } else if (numBalance < 1) {
    formattedBalance = numBalance.toFixed(3)
  } else if (numBalance < 1000) {
    formattedBalance = numBalance.toFixed(2)
  } else if (numBalance < 1000000) {
    formattedBalance = `${(numBalance / 1000).toFixed(2)}K`
  } else {
    formattedBalance = `${(numBalance / 1000000).toFixed(2)}M`
  }

  return {
    balance: rawBalance,
    formattedBalance,
    isLoading,
  }
}
