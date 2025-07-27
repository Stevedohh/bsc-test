import { BscTokenListService } from "./bsc-token-list.service";
import { OneInchService } from "./oneinch.service";

export type HttpContextProviderProps = {
  bscTokenList: typeof BscTokenListService;
  oneInch: typeof OneInchService;
};

export const HttpContextProvider: HttpContextProviderProps = {
  bscTokenList: BscTokenListService,
  oneInch: OneInchService,
};
