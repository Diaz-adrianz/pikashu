import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';
import {
  ApiCacheMode,
  ApiFetcherError,
  ApiParams,
  ApiResponsePaginate,
} from '../types';
import useSWR, { SWRConfiguration } from 'swr';
import { useState } from 'react';

// Utils
// -----------------------------------------------------------------
const buildApiParams = (params: ApiParams, page: number, limit: number) => {
  const query = new URLSearchParams();

  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v) query.set(k, v);
    });

  query.set('page', String(page));
  query.set('limit', String(limit));
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

// Paginate
// -----------------------------------------------------------------
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Paginate Infinite
// -----------------------------------------------------------------
const PAGINATE_INFINITE_CACHE_CONFIG: Record<
  ApiCacheMode,
  SWRInfiniteConfiguration
> = {
  cached: {
    revalidateFirstPage: false,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60_000,
  },
  fresh: {
    revalidateFirstPage: true,
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
  },
};

export const useApiPaginateInfinite = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends ApiResponsePaginate<any>,
  E = ApiFetcherError,
>(
  url: string,
  {
    params = {},
    enabled = true,
    limit = 10,
    cache = 'cached',
    onError,
  }: {
    params?: ApiParams;
    enabled?: boolean;
    limit?: number;
    cache?: ApiCacheMode;
    onError?: (error: E, key: string) => void;
  } = {}
) => {
  const { data, error, isValidating, size, setSize, mutate } = useSWRInfinite<
    R,
    E
  >(
    (pageIndex, previousPageData) => {
      if (!enabled) return null;
      if (previousPageData && !previousPageData.data?.items.length) return null;

      const query = buildApiParams(params, pageIndex + 1, limit);
      return `${url}?${query}`;
    },
    apiFetcher,
    {
      ...PAGINATE_INFINITE_CACHE_CONFIG[cache],
      onError,
    }
  );

  const items: NonNullable<R['data']['items'][number]>[] =
    data?.flatMap((page) => page.data?.items ?? []) ?? [];
  const total = data?.at(-1)?.data?.total ?? 0;
  const hasMore = items.length < total;

  const loadMore = () => {
    if (!isValidating && hasMore) setSize(size + 1);
  };

  return {
    items,
    total,
    hasMore,
    error,
    isLoading: isValidating,
    loadMore,
    refresh: mutate,
  };
};
