import useSWR, { SWRConfiguration } from 'swr';
import { useState } from 'react';
import type {
  ApiCacheMode,
  ApiFetcherError,
  ApiParams,
  ApiResponse,
  ApiResponsePaginate,
} from '@/lib/api';

/** --------------------------------------
 * Utils
 * -------------------------------------- */
const buildApiParams = (params: ApiParams, page?: number, limit?: number) => {
  const query = new URLSearchParams();

  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v) query.set(k, v);
    });

  if (page) query.set('page', String(page));
  if (limit) query.set('limit', String(limit));
  query.sort();

  return query.toString();
};

const apiFetcher = async (url: string) => {
  const res = await fetch(url),
    json = await res.json();

  if (!res.ok)
    throw { message: json.message ?? 'Request failed' } as ApiFetcherError;
  return json;
};

/** --------------------------------------
 * Single item
 * -------------------------------------- */
const API_CACHE_CONFIG: Record<ApiCacheMode, SWRConfiguration> = {
  cached: {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60_000,
    keepPreviousData: true,
  },
  fresh: {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    keepPreviousData: true,
  },
};

export const useApi = <R extends ApiResponse<any>, E = ApiFetcherError>(
  url: string,
  {
    params = {},
    enabled = true,
    cache = 'cached',
    onError,
  }: {
    params?: ApiParams;
    enabled?: boolean;
    cache?: ApiCacheMode;
    onError?: (error: E, key: string) => void;
  } = {}
) => {
  let key: string | null = null;
  if (enabled) {
    const query = buildApiParams(params);
    key = query ? `${url}?${query}` : url;
  }

  const { data, error, isValidating, isLoading, mutate } = useSWR<R, E>(
    key,
    apiFetcher,
    { ...API_CACHE_CONFIG[cache], onError }
  );

  const item: R['data'] | null = data?.data ?? null;

  return {
    item,
    error,
    isLoading,
    isValidating,
    refresh: mutate,
  };
};

/** --------------------------------------
 * Many items
 * -------------------------------------- */
const PAGINATE_CACHE_CONFIG: Record<ApiCacheMode, SWRConfiguration> = {
  cached: {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60_000,
    keepPreviousData: true,
  },
  fresh: {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    keepPreviousData: true,
  },
};

export const useApiPaginate = <
  R extends ApiResponsePaginate<any>,
  E = ApiFetcherError,
>(
  url: string,
  {
    params = {},
    enabled = true,
    limit = 10,
    cache = 'cached',
    initialPage = 1,
    onError,
  }: {
    params?: ApiParams;
    enabled?: boolean;
    limit?: number;
    cache?: ApiCacheMode;
    initialPage?: number;
    onError?: (error: E, key: string) => void;
  } = {}
) => {
  const [page, setPage] = useState(initialPage);

  const paramsKey = JSON.stringify(params);
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);
  if (prevParamsKey !== paramsKey) {
    setPrevParamsKey(paramsKey);
    setPage(1);
  }

  let key: string | null = null;
  if (enabled) {
    const query = buildApiParams(params, page, limit);
    key = `${url}?${query}`;
  }

  const { data, error, isValidating, mutate } = useSWR<R, E>(key, apiFetcher, {
    ...PAGINATE_CACHE_CONFIG[cache],
    onError,
  });

  const items: NonNullable<R['data']['items'][number]>[] =
    data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const next = () => hasNext && setPage(page + 1);
  const prev = () => hasPrev && setPage(page - 1);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    error,
    isLoading: isValidating,
    goTo,
    next,
    prev,
    refresh: mutate,
  };
};
