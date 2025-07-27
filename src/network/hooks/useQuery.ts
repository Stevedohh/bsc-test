import {
  useQuery as useTanstackQuery,
  UseQueryOptions,
} from '@tanstack/react-query'

import { HttpContextProvider, HttpContextProviderProps } from '../services';

type CallbackReturn = (...args: any) => any;

const useCommonQuery = <T, Res = unknown, Req = unknown, Err = Record<string, unknown>>(
  context: T,
  callback: (context: T) => CallbackReturn,
  params?: Req,
  { enabled = true, ...options }: Omit<UseQueryOptions, 'queryKey'> = {},
) => {
  const name = `${callback.toString().replace(/\n/g, '').toLowerCase()}`;

  return useTanstackQuery<Res, Err>({
      queryFn: () => callback(context)(params),
      queryKey: [name, params],
      refetchOnWindowFocus: false,
      retry: false,
      keepPreviousData: true,
      enabled,
      ...options,
    } as any
  );
};

export const useQuery = <Res = unknown, Req = unknown, Err = Record<string, unknown>>(
  callback: (context: HttpContextProviderProps) => CallbackReturn,
  params?: Req,
  options?: Omit<UseQueryOptions, 'queryKey'>,
) => {
  return useCommonQuery<HttpContextProviderProps, Res, Req, Err>(
    HttpContextProvider,
    callback,
    params,
    options,
  );
};
