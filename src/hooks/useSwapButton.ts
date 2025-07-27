import { useMemo } from 'react';
import { Token } from '@/network/types/token';

interface UseSwapButtonParams {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  needsApproval: boolean;
  isNative: boolean;
  isApproveLoading: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  isSwapLoading: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isAllowanceLoading: boolean;
  canSwap: boolean;
  isConnected: boolean;
}

interface UseSwapButtonReturn {
  text: string;
  disabled: boolean;
}

export const useSwapButton = (params: UseSwapButtonParams): UseSwapButtonReturn => {
  const {
    fromToken,
    toToken,
    fromAmount,
    needsApproval,
    isNative,
    isApproveLoading,
    isApproveConfirming,
    isApproveConfirmed,
    isSwapLoading,
    isConfirming,
    isConfirmed,
    isAllowanceLoading,
    canSwap,
    isConnected
  } = params;

  const text = useMemo(() => {
    if (!isConnected) {
      return 'Connect your wallet';
    }

    if (!fromToken || !toToken) {
      return 'Select tokens';
    }

    if (!fromAmount) {
      return 'Enter amount';
    }

    if (needsApproval && !isNative) {
      if (isApproveLoading && !isApproveConfirming) {
        return 'Preparing approval...';
      }

      if (isApproveConfirming) {
        return 'Confirming approval...';
      }

      if (isApproveConfirmed) {
        return 'Approval confirmed! Ready to swap';
      }

      return `Approve ${fromToken.symbol}`;
    }

    if (isSwapLoading && !isConfirming) {
      return 'Preparing swap...';
    }

    if (isConfirming) {
      return 'Confirming transaction...';
    }

    if (isConfirmed) {
      return 'Swap completed!';
    }

    return 'Swap';
  }, [
    isConnected,
    fromToken,
    toToken,
    fromAmount,
    needsApproval,
    isNative,
    isApproveLoading,
    isApproveConfirming,
    isApproveConfirmed,
    isSwapLoading,
    isConfirming,
    isConfirmed
  ]);

  const disabled = useMemo(() => {
    if (!isConnected) {
      return false;
    }

    if (!fromToken || !toToken || !fromAmount) {
      return true;
    }

    if (isAllowanceLoading) {
      return true;
    }

    if (needsApproval && !isNative) {
      return isApproveLoading || isApproveConfirmed;
    }

    return !canSwap || isSwapLoading || isConfirmed;
  }, [
    isConnected,
    fromToken,
    toToken,
    fromAmount,
    isAllowanceLoading,
    needsApproval,
    isNative,
    isApproveLoading,
    isApproveConfirmed,
    canSwap,
    isSwapLoading,
    isConfirmed
  ]);

  return { text, disabled };
};
