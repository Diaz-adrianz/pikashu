import { FieldErrors } from './types';

export class ValidationError extends Error {
  constructor(public fieldErrors: FieldErrors) {
    super('validation');
  }
}
