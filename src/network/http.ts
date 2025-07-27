import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const http = {
  // Leave empty for now, but can be used to set default headers or base URL later
  api: axios.create(),

  getUri(config: AxiosRequestConfig): string {
    return this.api.getUri(config);
  },

  request<ResponseDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    config: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.request(config);
  },

  get<ResponseDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.get(url, config);
  },

  delete<ResponseDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.delete(url, config);
  },

  head<ResponseDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.head(url, config);
  },

  post<ResponseDataType, RequestDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    data?: RequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.post(url, data, config);
  },

  put<ResponseDataType, RequestDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    data?: RequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.put(url, data, config);
  },

  patch<ResponseDataType, RequestDataType, ReturnType = AxiosResponse<ResponseDataType>>(
    url: string,
    data?: RequestDataType,
    config?: AxiosRequestConfig,
  ): Promise<ReturnType> {
    return this.api.patch(url, data, config);
  },

  success<ResponseDataType>(response: AxiosResponse<ResponseDataType>): ResponseDataType {
    return response.data;
  },

  error(error: AxiosError<Error>) {
    throw error;
  },
};

export { http };
