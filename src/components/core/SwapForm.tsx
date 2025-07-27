'use client'

import { FC } from "react";
import { ArrowDownIcon } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { Token } from "@/network/types/token";
import { TokenSelector } from "./TokenSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSwapTokens,
  useTokenBalance,
  useTokenQuote,
  useSwap,
  useTokenAllowance,
  useTokenApprove,
  useSwapButton
} from "@/hooks";
import { isNativeToken } from "@/utils";
import { modal } from "@/context";
import { useQuery } from "@/network";

export const SwapForm: FC = () => {
  const { isConnected } = useAccount();

  const { data: tokens, isLoading } = useQuery<Record<string, Token>>(({ bscTokenList }) => bscTokenList.getTokenList);

  const {
    fromToken,
    toToken,
    inputValue,
    fromAmount,
    setFromToken,
    setToToken,
    handleFromAmountChange,
  } = useSwapTokens(tokens);

  const {
    formattedBalance: fromTokenBalance,
    isLoading: isFromBalanceLoading,
    balance: fromTokenRawBalance
  } = useTokenBalance(fromToken);

  const {
    formattedBalance: toTokenBalance,
    isLoading: isToBalanceLoading
  } = useTokenBalance(toToken);

  const {
    toAmount: quotedToAmount,
    isLoading: isQuoteLoading,
    error: quoteError
  } = useTokenQuote({
    fromToken,
    toToken,
    fromAmount
  });

  const {
    hasEnoughAllowance,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance
  } = useTokenAllowance({ token: fromToken });

  const {
    approveToken,
    isLoading: isApproveLoading,
    isConfirming: isApproveConfirming,
    isConfirmed: isApproveConfirmed,
    error: approveError,
    txHash: approveTxHash
  } = useTokenApprove({
    token: fromToken,
    onSuccess: () => {
      refetchAllowance();
    }
  });

  const {
    executeSwap,
    isLoading: isSwapLoading,
    isConfirming,
    isConfirmed,
    error: swapError,
    txHash,
    canSwap
  } = useSwap({
    fromToken,
    toToken,
    fromAmount,
    slippage: 1
  });

  const handleMaxClick = () => {
    if (!fromToken || !fromTokenRawBalance) return;

    const decimals = parseInt(fromToken.decimals);
    const balance = formatUnits(fromTokenRawBalance, decimals);
    handleFromAmountChange(balance);
  };

  const handleApproveClick = async () => {
    await approveToken();
  };

  const handleSwapClick = async () => {
    if (!canSwap) {
      return;
    }

    await executeSwap();
  };

  const needsApproval = fromToken && fromAmount && !hasEnoughAllowance(fromAmount);
  const isNative = fromToken ? isNativeToken(fromToken.address) : false;

  const { text: buttonText, disabled: buttonDisabled } = useSwapButton({
    fromToken,
    toToken,
    fromAmount,
    needsApproval: !!needsApproval,
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
  });

  const handleMainButtonClick = async () => {
    if (!isConnected) {
      modal.open();
      return;
    }

    if (needsApproval && !isNative) {
      await handleApproveClick();
    } else {
      await handleSwapClick();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <img src="https://token-icons.llamao.fi/icons/tokens/56/0x0000000000000000000000000000000000000000?h=48&w=48"
               className="w-8 h-8 rounded-full"
               alt='bsc'/>
          <span className="text-xl font-semibold">BSC</span>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-2xl p-4 space-y-1">
        <div className="bg-neutral-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-400">You sell</div>
            {fromToken && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-400">
                  Balance: {isFromBalanceLoading ? '...' : fromTokenBalance}
                </div>
                {fromTokenRawBalance && (
                  <button
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-1 py-0.5 rounded border border-blue-400/30 hover:border-blue-300/50"
                  >
                    MAX
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0"
                className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 text-white"
                disabled={isSwapLoading || isApproveLoading}
              />
            </div>
            <div className="w-32">
              <TokenSelector
                data={tokens}
                isLoading={isLoading}
                selectedToken={fromToken}
                onSelect={setFromToken}
                compact={true}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center my-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 border border-neutral-700 hover:bg-neutral-700"
          >
            <ArrowDownIcon className="h-4 w-4"/>
          </Button>
        </div>

        <div className="bg-neutral-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">You buy</div>
              {isQuoteLoading && fromAmount && fromToken && toToken && (
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            {toToken && (
              <div className="text-sm text-gray-400">
                Balance: {isToBalanceLoading ? '...' : toTokenBalance}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                value={quotedToAmount}
                placeholder={isQuoteLoading ? "Calculating..." : quotedToAmount || "0"}
                className={`text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 text-gray-400`}
                readOnly={true}
                disabled={isSwapLoading || isApproveLoading}
              />
              {(quoteError || swapError || approveError) && (
                <div className="text-xs text-red-400 mt-1">
                  {approveError || swapError || quoteError}
                </div>
              )}
            </div>
            <div className="w-32">
              <TokenSelector
                data={tokens}
                isLoading={isLoading}
                selectedToken={toToken}
                onSelect={setToToken}
                compact={true}
              />
            </div>
          </div>
        </div>

        {approveTxHash && (
          <div className="bg-neutral-800 rounded-xl p-4 mt-2">
            <div className="text-sm text-gray-400 mb-1">Approval Transaction:</div>
            <div className="text-xs text-blue-400 break-all">
              <a
                href={`https://bscscan.com/tx/${approveTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                {approveTxHash}
              </a>
            </div>
            {isApproveConfirming && (
              <div className="text-xs text-yellow-400 mt-2 flex items-center space-x-1">
                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Waiting for approval confirmation...</span>
              </div>
            )}
            {isApproveConfirmed && (
              <div className="text-xs text-green-400 mt-2">
                ✅ Approval confirmed! You can now swap.
              </div>
            )}
          </div>
        )}

        {txHash && (
          <div className="bg-neutral-800 rounded-xl p-4 mt-2">
            <div className="text-sm text-gray-400 mb-1">Swap Transaction:</div>
            <div className="text-xs text-blue-400 break-all">
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                {txHash}
              </a>
            </div>
            {isConfirming && (
              <div className="text-xs text-yellow-400 mt-2 flex items-center space-x-1">
                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Waiting for swap confirmation...</span>
              </div>
            )}
            {isConfirmed && (
              <div className="text-xs text-green-400 mt-2">
                ✅ Swap completed successfully!
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        className={`w-full mt-4 font-semibold rounded-xl cursor-pointer ${
          isConfirmed ? 'bg-green-600 hover:bg-green-700' :
            needsApproval && !isNative ? 'bg-yellow-600 hover:bg-yellow-700' : ''
        }`}
        onClick={handleMainButtonClick}
        disabled={buttonDisabled}
      >
        {(isSwapLoading && !isConfirming) || (isApproveLoading && !isApproveConfirming) ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : null}
        {buttonText}
      </Button>
    </div>
  );
};
