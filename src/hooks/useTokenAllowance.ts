'use client'

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { Token } from '@/network/types/token';
import { formatUnits } from 'viem';
import { isNativeToken } from '@/utils';

const ONEINCH_ROUTER_ADDRESS = '0x111111125421cA6dc452d289314280a0f8842A65';

const ERC20_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

interface UseTokenAllowanceParams {
  token: Token | null;
}

export const useTokenAllowance = ({ token }: UseTokenAllowanceParams) => {
  const { address } = useAccount();

  const {
    data: allowance,
    isLoading,
    refetch
  } = useReadContract({
    address: token?.address as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && token ? [address, ONEINCH_ROUTER_ADDRESS] : undefined,
    query: {
      enabled: Boolean(address && token && !isNativeToken(token.address)),
    }
  });

  const formattedAllowance = token && allowance
    ? formatUnits(allowance, parseInt(token.decimals))
    : '0';

  const hasEnoughAllowance = (requiredAmount: string): boolean => {
    if (!token || !requiredAmount) return false;

    if (isNativeToken(token.address)) {
      return true;
    }

    if (!allowance) return false;

    try {
      const required = parseFloat(requiredAmount);
      const current = parseFloat(formattedAllowance);
      return current >= required;
    } catch {
      return false;
    }
  };

  return {
    allowance,
    formattedAllowance,
    isLoading,
    hasEnoughAllowance,
    refetch,
    spenderAddress: ONEINCH_ROUTER_ADDRESS
  };
};
