import { unstable_rethrow } from 'next/navigation';

import { ActionResult } from './types';
import { ForbiddenError, UnauthenticatedError } from '@/lib/next-auth/errors';
import { ValidationError } from '@/lib/zod/errors';

export const actionHandler = async <T>(
  handler: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> => {
  try {
    return await handler();
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ValidationError)
      return {
        ok: false,
        message: 'Data tidak valid',
        fieldErrors: error.fieldErrors,
      };

    if (error instanceof UnauthenticatedError)
      return { ok: false, message: 'Autentikasi diperlukan' };

    if (error instanceof ForbiddenError)
      return { ok: false, message: 'Akses ditolak' };

    console.error(error);
    return { ok: false, message: 'Server terjadi masalah' };
  }
};
