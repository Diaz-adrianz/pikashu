'use client';

import { FieldErrors } from '@/lib/zod/types';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ActionResult } from '../types';

type Options<T> = {
  successMessage?: string;
  silent?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (message: string, fieldErrors?: FieldErrors) => void;
};

export const useAction = <A extends unknown[], T>(
  action: (...args: A) => Promise<ActionResult<T>>,
  { successMessage, silent, onSuccess, onError }: Options<T> = {}
) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>();

  const reset = () => {
    setMessage(undefined);
    setFieldErrors(undefined);
  };

  const fail = (msg: string, errors?: FieldErrors) => {
    setMessage(msg);
    setFieldErrors(errors);
    if (!silent) toast.error(msg);
    onError?.(msg, errors);
  };

  const run = (...args: A) => {
    reset();

    startTransition(async () => {
      try {
        const res = await action(...args);

        if (!res.ok) return fail(res.message, res.fieldErrors);

        if (successMessage) toast.success(successMessage);
        onSuccess?.(res.data);
      } catch {
        fail('Server terjadi masalah');
      }
    });
  };

  return { run, isPending, message, fieldErrors, reset };
};
