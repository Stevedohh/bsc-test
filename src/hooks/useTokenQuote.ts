import { useMemo } from 'react';
import { parseUnits, formatUnits } from 'viem';

import { Token } from '@/network/types/token';
import { useQuery } from '@/network';


interface UseTokenQuoteParams {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
}

interface TokenQuoteResult {
  toAmount: string;
  isLoading: boolean;
  error: string | null;
}

export const useTokenQuote = ({
                                fromToken,
                                toToken,
                                fromAmount
                              }: UseTokenQuoteParams): TokenQuoteResult => {

  const isValidForQuote = Boolean(
    fromToken &&
    toToken &&
    fromAmount &&
    fromAmount !== '0'
  );

  const amount = useMemo(() => {
    if (!fromToken || !fromAmount) {
      return null
    }

    return parseUnits(fromAmount, parseInt(fromToken.decimals as string)).toString();
  }, [fromToken, fromAmount]);

  const { data: quote, isLoading, isError, error } = useQuery<string | null>(
    ({ oneInch }) => oneInch.getSimpleQuote,
    {
      fromTokenAddress: fromToken?.address,
      toTokenAddress: toToken?.address,
      amount
    },
    {
      enabled: isValidForQuote && amount !== undefined,
    }
  );

  const toAmount = useMemo(() => {
    if (!isValidForQuote) {
      return ''
    }

    if (fromToken!.address.toLowerCase() === toToken!.address.toLowerCase()) {
      return fromAmount;
    }

    if (quote && !isLoading && !isError) {
      const toDecimals = parseInt(toToken!.decimals);
      const formattedAmount = formatUnits(BigInt(quote), toDecimals);
      const numAmount = parseFloat(formattedAmount);

      if (numAmount < 0.000001) return '< 0.000001';
      if (numAmount < 0.01) return numAmount.toFixed(6);
      if (numAmount < 1) return numAmount.toFixed(4);

      return numAmount.toFixed(3);
    }

    return '';
  }, [fromToken, toToken, fromAmount, quote, isLoading, isError, isValidForQuote]);

  const errorMessage = useMemo(() => {
    if (!isError) return null;

    if (typeof error === 'object' && error && 'message' in error) {
      return error.message as string;
    }

    return 'Failed to get quote';
  }, [isError, error]);

  return {
    toAmount,
    isLoading,
    error: errorMessage,
  };
};
