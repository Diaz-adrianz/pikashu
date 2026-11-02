export type ApiResponse<T> = {
  status?: number;
  message: string;
  data: T;
};

export type ApiResponsePaginate<T> = ApiResponse<{
  items: T[];
  total: number;
}>;

export type ApiParams = Record<string, string | undefined>;

export type ApiFetcherError = {
  message: string;
};

export type ApiCacheMode = 'cached' | 'fresh';
