import {RemoveAuthCookiesOptions} from '../index.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';

describe('SingleCookieRemover', () => {
  it('should remove single cookie', () => {
    const mockHeaders = {append: jest.fn()} as unknown as Headers;
    const serializeOptions = {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24,
      expires: 1727373870
    };
    const options = {
      cookieName: 'TestCookie',
      cookieSerializeOptions: serializeOptions
    } as unknown as RemoveAuthCookiesOptions;
    const remover = SingleCookieRemover.fromHeaders(mockHeaders, options);

    remover.removeCookies();

    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });
});
