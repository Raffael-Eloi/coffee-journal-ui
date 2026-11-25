import { HttpErrorResponse } from '@angular/common/http';
import { validationErrors } from './validation-errors';

describe('validationErrors', () => {
  it('reads the messages of a 400 problem response by field', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        errors: { equipmentCategoryId: ['Unknown category'], ImageUrl: ['Bad url', 'Again'] },
      },
    });

    expect(validationErrors(error)).toEqual({
      equipmentCategoryId: ['Unknown category'],
      imageUrl: ['Bad url', 'Again'],
    });
  });

  it('returns null for other failures', () => {
    expect(validationErrors(new HttpErrorResponse({ status: 500 }))).toBeNull();
    expect(validationErrors(new HttpErrorResponse({ status: 400, error: 'x' }))).toBeNull();
    expect(validationErrors(new Error('boom'))).toBeNull();
  });
});
