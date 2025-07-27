import { http } from "@/network/http";
import {
  OneInchQuoteResponse,
  OneInchQuoteParams,
  OneInchSwapParams,
  OneInchSwapResponse, OneInchSimpleQuoteParams,
} from "@/network/types/oneinch";
import { normalizeTokenAddressFor1inch } from "@/utils";

export const OneInchService = {
  async getQuote(params: OneInchQuoteParams): Promise<OneInchQuoteResponse> {
    try {
      const searchParams = new URLSearchParams({
        src: normalizeTokenAddressFor1inch(params.src),
        dst: normalizeTokenAddressFor1inch(params.dst),
        amount: params.amount,
      });

      const { data } = await http.get<OneInchQuoteResponse>(
        `/api/quote?${searchParams.toString()}`
      );

      return data;
    } catch (error: any) {
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(`Quote API Error: ${apiError.details || apiError.error || 'Unknown error'}`);
      }

      throw new Error(`Network Error: ${error.message}`);
    }
  },

  async getSwapTransaction(params: OneInchSwapParams): Promise<OneInchSwapResponse> {
    try {
      const searchParams = new URLSearchParams({
        src: normalizeTokenAddressFor1inch(params.src),
        dst: normalizeTokenAddressFor1inch(params.dst),
        amount: params.amount,
        from: params.from,
        slippage: params.slippage.toString(),
      });

      if (params.protocols) searchParams.set('protocols', params.protocols);
      if (params.fee) searchParams.set('fee', params.fee.toString());
      if (params.gasPrice) searchParams.set('gasPrice', params.gasPrice);
      if (params.complexityLevel) searchParams.set('complexityLevel', params.complexityLevel);
      if (params.connectorTokens) searchParams.set('connectorTokens', params.connectorTokens);
      if (params.allowPartialFill) searchParams.set('allowPartialFill', params.allowPartialFill.toString());
      if (params.disableEstimate) searchParams.set('disableEstimate', params.disableEstimate.toString());
      if (params.usePatching) searchParams.set('usePatching', params.usePatching.toString());

      const { data } = await http.get<OneInchSwapResponse>(
        `/api/swap?${searchParams.toString()}`
      );

      return data;
    } catch (error: any) {
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(`Swap API Error: ${apiError.details || apiError.error || 'Unknown error'}`);
      }

      throw new Error(`Network Error: ${error.message}`);
    }
  },

  async getSimpleQuote(params: OneInchSimpleQuoteParams): Promise<string | null> {
    try {
      const quote = await OneInchService.getQuote({
        src: params.fromTokenAddress,
        dst: params.toTokenAddress,
        amount: params.amount,
      });

      return quote.dstAmount;
    } catch (error) {
      console.warn('1inch quote error:', error);
      return null;
    }
  },
};
