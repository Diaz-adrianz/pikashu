import { FieldErrors } from '@/lib/zod/types';

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
