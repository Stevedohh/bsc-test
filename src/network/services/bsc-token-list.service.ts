import { http } from "@/network/http";
import { Token } from "@/network/types/token";

// In real-world applications, we should process all tokens using our own API.
// here, I’m using a public token list from LLaMA instead.
const BSC_TOKEN_LIST_URL = 'https://d3g10bzo9rdluh.cloudfront.net/tokenlists-56.json';

export const BscTokenListService = {
  async getTokenList() {
    const { data } = await http.request<unknown, Record<string, Token>>({
      url: BSC_TOKEN_LIST_URL,
      method: 'GET'
    })

    return data;
  }
}
