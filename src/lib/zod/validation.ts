import { z } from 'zod';
import { ValidationError } from './errors';

export function validate<S extends z.ZodType>(
  schema: S,
  data: unknown
): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new ValidationError(z.flattenError(result.error).fieldErrors);
  return result.data;
}
