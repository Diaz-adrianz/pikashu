import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from './types';
import { ForbiddenError, UnauthenticatedError } from '@/lib/next-auth/errors';

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
