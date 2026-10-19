import { AxiosError } from 'axios';
import { getErrorMessage } from './apiService';

const failure = (status: number, data: unknown) => {
  const error = new AxiosError('failed');
  error.response = { status, data } as AxiosError['response'];
  return error;
};

describe('getErrorMessage', () => {
  it('returns a string detail unchanged', () => {
    expect(getErrorMessage(failure(409, { detail: 'Supplier still has inventory items' }))).toBe(
      'Supplier still has inventory items'
    );
  });

  it('flattens FastAPI validation errors into one readable line', () => {
    const error = failure(422, {
      detail: [
        { loc: ['body', 'quantity'], msg: 'Input should be greater than or equal to 0' },
        { loc: ['body', 'name'], msg: 'String should have at least 1 character' },
      ],
    });
    expect(getErrorMessage(error)).toBe(
      'quantity: Input should be greater than or equal to 0; name: String should have at least 1 character'
    );
  });

  it('explains an unreachable server', () => {
    expect(getErrorMessage(new AxiosError('Network Error'))).toMatch(/cannot reach the server/i);
  });

  it('falls back for unknown errors', () => {
    expect(getErrorMessage(new Error('x'), 'Custom fallback')).toBe('Custom fallback');
  });
});
