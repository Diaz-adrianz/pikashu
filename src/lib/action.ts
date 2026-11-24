import { unstable_rethrow } from 'next/navigation';
import { FieldErrors, ValidationError } from './zod';
import { ForbiddenError, UnauthenticatedError } from './auth';

/** --------------------------------------
 * Types
 * -------------------------------------- */
export type ActionResult<T> =
  | {
      ok: true;
      message?: string;
      data: T;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: FieldErrors;
    };

/** --------------------------------------
 * Classes
 * -------------------------------------- */
export class ActionError extends Error {}

/** --------------------------------------
 * Handlers
 * -------------------------------------- */
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

    if (error instanceof ActionError)
      return { ok: false, message: error.message };

    console.error(error);
    return { ok: false, message: 'Server terjadi masalah' };
  }
};
