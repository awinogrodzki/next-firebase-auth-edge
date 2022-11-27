import { isExpired } from './is-expired';
import { decode } from './decode';

jest.mock('./decode');
const mockedDecode = decode as jest.Mock;

const fakeJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjk0NjY4ODQwMH0.c2VjcmV0';

describe('isExpired', () => {
  it('should return false for JWT without exp', () => {
    expect.assertions(1);

    mockedDecode.mockImplementation(() => ({}));

    expect(isExpired(fakeJWT)).toBe(false);
  });

  it('should return false for JWT with future exp date', () => {
    expect.assertions(1);

    const exp = Math.floor(new Date().getTime() / 1000) + 60;

    mockedDecode.mockImplementation(() => ({ exp }));

    expect(isExpired(fakeJWT)).toBe(false);
  });

  it('should return true for JWT with past exp date', () => {
    expect.assertions(1);

    const exp = Math.floor(new Date().getTime() / 1000) - 60;

    mockedDecode.mockImplementation(() => ({ exp }));

    expect(isExpired(fakeJWT)).toBe(true);
  });

  describe('options.expiredWithinSeconds', () => {
    it('should return false when expiredWithinSeconds = 60 and JWT is expiring in 61 seconds', () => {
      expect.assertions(1);

      const exp = Math.floor(new Date().getTime() / 1000) + 61;

      mockedDecode.mockImplementation(() => ({ exp }));

      expect(isExpired(fakeJWT, { expiredWithinSeconds: 60 })).toBe(false);
    });

    it('should return true when expiredWithinSeconds = 60 and JWT is expiring in 59 seconds', () => {
      expect.assertions(1);

      const exp = Math.floor(new Date().getTime() / 1000) + 59;

      mockedDecode.mockImplementation(() => ({ exp }));

      expect(isExpired(fakeJWT, { expiredWithinSeconds: 60 })).toBe(true);
    });
  });
});
