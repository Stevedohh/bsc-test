import { useState, useEffect, useMemo } from "react";

import { Token } from "@/network/types/token";

import { useUrlParam } from "./useUrlParam";


export const useUrlToken = (
  tokens: Record<string, Token> | null,
  urlKey: string = "token"
) => {
  const { value: tokenAddress, setValue: setTokenAddress } = useUrlParam(urlKey);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const tokenFromUrl = useMemo(() => {
    if (!tokenAddress || !tokens) {
      return null;
    }

    return tokens[tokenAddress.toLowerCase()] || null;
  }, [tokenAddress, tokens]);

  useEffect(() => {
    if (tokenFromUrl && !selectedToken) {
      setSelectedToken(tokenFromUrl);
    }
  }, [tokenFromUrl, selectedToken]);

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setTokenAddress(token?.address || null);
  };

  return {
    selectedToken,
    selectToken
  };
};
