import { NextRequest, NextResponse } from 'next/server';
import { ForbiddenError, UnauthenticatedError } from './auth';

/** --------------------------------------
 * Types
 * -------------------------------------- */
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

/** --------------------------------------
 * Classes
 * -------------------------------------- */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

/** --------------------------------------
 * Handlers
 * -------------------------------------- */
export const apiHandler = <T = undefined>(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; query: URLSearchParams }
  ) => Promise<ApiResponse<T>> | ApiResponse<T>
) => {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const res = await handler(request, {
        params: await context.params,
        query: request.nextUrl.searchParams,
      });

      return NextResponse.json(res, {
        status: res.status,
      });
    } catch (error) {
      if (error instanceof ApiError)
        return NextResponse.json(
          { error: { code: error.code, message: error.message } },
          { status: error.status }
        );

      if (error instanceof UnauthenticatedError)
        return NextResponse.json(
          { message: 'Autentikasi diperlukan' },
          { status: 401 }
        );

      if (error instanceof ForbiddenError)
        return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });

      console.error(error);
      return NextResponse.json(
        { message: 'Server Terjadi Masalah' },
        { status: 500 }
      );
    }
  };
};
