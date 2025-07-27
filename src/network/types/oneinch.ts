export interface OneInchToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
}

export interface OneInchQuoteResponse {
  srcToken: OneInchToken;
  dstToken: OneInchToken;
  dstAmount: string;
  fromAmount: string;
  protocols: any[];
  gas: string;
}

export interface OneInchQuoteParams {
  src: string;
  dst: string;
  amount: string;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
  fee?: number;
  protocols?: string;
  gasPrice?: string;
  complexityLevel?: string;
  connectorTokens?: string;
  gasLimit?: number;
  mainRouteParts?: number;
  parts?: number;
}

export interface OneInchSwapParams {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: string;
  connectorTokens?: string;
  allowPartialFill?: boolean;
  disableEstimate?: boolean;
  usePatching?: boolean;
}

export interface OneInchSwapResponse {
  srcToken: OneInchToken;
  dstToken: OneInchToken;
  dstAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
}

export interface OneInchSimpleQuoteParams {
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
}
