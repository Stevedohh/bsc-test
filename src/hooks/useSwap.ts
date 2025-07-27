'use client'

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

import { Token } from '@/network/types/token';
import { OneInchSwapResponse } from '@/network/types/oneinch';
import { useQuery } from '@/network';


interface UseSwapParams {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  slippage?: number;
}

export const useSwap = ({ fromToken, toToken, fromAmount, slippage = 1 }: UseSwapParams) => {
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { sendTransaction, isPending: isSendPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  const isValidForSwap = Boolean(
    fromToken &&
    toToken &&
    fromAmount &&
    fromAmount !== '0' &&
    address
  );

  const amount = useMemo(() => {
    if (!fromToken || !fromAmount) {
      return null;
    }

    try {
      return parseUnits(fromAmount, parseInt(fromToken.decimals)).toString();
    } catch {
      return null;
    }
  }, [fromToken, fromAmount]);

  const {
    data: swapData,
    isLoading: isLoadingSwapData,
    isError: isSwapDataError,
    error: swapDataError
  } = useQuery<OneInchSwapResponse | null>(
    ({ oneInch }) => oneInch.getSwapTransaction,
    {
      src: fromToken?.address,
      dst: toToken?.address,
      amount,
      from: address,
      slippage,
    },
    {
      enabled: isValidForSwap && amount !== null,
    }
  );

  const executeSwap = async () => {
    if (!swapData) {
      setError('Swap data not available');
      return;
    }

    setError(null);
    setTxHash(null);

    try {
      sendTransaction(
        {
          to: swapData.tx.to as `0x${string}`,
          data: swapData.tx.data as `0x${string}`,
          value: BigInt(swapData.tx.value),
          gas: BigInt(swapData.tx.gas),
          gasPrice: BigInt(swapData.tx.gasPrice),
        },
        {
          onSuccess: (hash) => {
            setTxHash(hash);
            console.log('Transaction sent:', hash);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setError(error.message);
          },
        }
      );
    } catch (error: any) {
      console.error('Transaction execution failed:', error);
      setError(error.message || 'Transaction execution failed');
    }
  };

  const errorMessage = useMemo(() => {
    if (error) {
      if (error.includes('User rejected')) {
        return 'Transaction rejected by user';
      }

      return 'Failed to prepare swap';
    }

    if (isSwapDataError) {
      if (typeof swapDataError === 'object' && swapDataError && 'message' in swapDataError) {
        const message = swapDataError.message as string;
        if (message.includes('Not enough allowance')) {
          return `Token approval required. Please approve ${fromToken?.symbol} first.`;
        } else if (message.includes('insufficient funds')) {
          return 'Insufficient balance for this swap';
        } else if (message.includes('Not enough')) {
          return 'Not enough balance';
        } else if (message.includes('Swap API Error')) {
          return `Swap failed`;
        }

        return message;
      }

      return 'Failed to prepare swap';
    }

    return null;
  }, [error, isSwapDataError, swapDataError, fromToken?.symbol]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return {
    executeSwap,
    isLoading: isLoadingSwapData || isSendPending || isConfirming,
    isLoadingSwapData,
    isConfirming,
    isConfirmed,
    error: errorMessage,
    txHash,
    canSwap: Boolean(swapData && !isLoadingSwapData && !isSwapDataError),
    swapData,
  };
};
