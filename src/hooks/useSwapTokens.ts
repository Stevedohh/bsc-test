import { useState, useCallback, useEffect } from "react";
import { Token } from "@/network/types/token";
import { useUrlToken } from "./useUrlToken";

export const useSwapTokens = (tokens: Record<string, Token> | null) => {
  const { selectedToken: fromToken, selectToken: setFromToken } = useUrlToken(tokens, "from");
  const { selectedToken: toToken, selectToken: setToToken } = useUrlToken(tokens, "to");

  const [inputValue, setInputValue] = useState<string>("");
  const [fromAmount, setFromAmount] = useState<string>("");

  const handleFromAmountChange = useCallback((value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFromAmount(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return {
    fromToken,
    toToken,
    inputValue,
    fromAmount,
    setFromToken,
    setToToken,
    handleFromAmountChange,
  };
};
