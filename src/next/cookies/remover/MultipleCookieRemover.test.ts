import {RemoveAuthCookiesOptions} from '../index.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';

describe('MultipleCookieRemover', () => {
  it('should remove multiple cookies', () => {
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
    const remover = MultipleCookieRemover.fromHeaders(mockHeaders, options);

    remover.removeCookies();

    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'TestCookie.id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'TestCookie.refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      3,
      'Set-Cookie',
      'TestCookie.custom=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      4,
      'Set-Cookie',
      'TestCookie.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
    );
  });
});
