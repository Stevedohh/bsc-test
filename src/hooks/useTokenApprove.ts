'use client'

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';

import { Token } from '@/network/types/token';
import { isNativeToken } from '@/utils';

const ONEINCH_ROUTER_ADDRESS = '0x111111125421cA6dc452d289314280a0f8842A65';

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

interface UseTokenApproveParams {
  token: Token | null;
  onSuccess?: () => void;
}

export const useTokenApprove = ({ token, onSuccess }: UseTokenApproveParams) => {
  const [error, setError] = useState<string | null>(null);

  const { writeContract, isPending, data: txHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const approveToken = async (amount?: string, useMaxApproval = true) => {
    if (!token) {
      setError('Token not selected');
      return;
    }

    if (isNativeToken(token.address)) {
      setError('Native token does not require approval');
      return;
    }

    setError(null);

    try {
      let approvalAmount: bigint;

      if (useMaxApproval) {
        approvalAmount = maxUint256;
      } else if (amount) {
        approvalAmount = parseUnits(amount, parseInt(token.decimals));
      } else {
        setError('Amount is required when not using max approval');
        return;
      }

      writeContract(
        {
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [ONEINCH_ROUTER_ADDRESS, approvalAmount],
        },
        {
          onSuccess: () => {
            console.log('Approval transaction sent:', txHash);
          },
          onError: (error) => {
            console.error('Approval failed:', error);
            setError(error.message);
          },
        }
      );
    } catch (error: any) {
      console.error('Approval preparation failed:', error);
      setError(error.message);
    }
  };

  if (isConfirmed && onSuccess) {
    onSuccess();
  }

  return {
    approveToken,
    isLoading: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    error,
    txHash,
  };
};
