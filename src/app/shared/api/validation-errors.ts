import { HttpErrorResponse } from '@angular/common/http';

/** Field name (camelCase) to the messages the API reported for it. */
export type FieldErrors = Record<string, string[]>;

/** Reads the `errors` of a 400 `application/problem+json` response, or returns `null` for any other failure. */
export function validationErrors(error: unknown): FieldErrors | null {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return null;
  const errors = (error.error as { errors?: unknown } | null)?.errors;
  if (typeof errors !== 'object' || errors === null) return null;
  const result: FieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      // The API uses camelCase names; tolerate a leading capital.
      result[field.charAt(0).toLowerCase() + field.slice(1)] = messages.map(String);
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}
