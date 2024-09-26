import {HeadersCookieSetter} from './HeadersCookieSetter.ts';

describe('HeadersCookieSetter', () => {
  it('should append cookie with options on provided headers', () => {
    const mockHeaders = {append: jest.fn()} as unknown as Headers;
    const serializeOptions = {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24
    };
    const setter = new HeadersCookieSetter(mockHeaders, serializeOptions);

    setter.setCookies([
      {
        name: 'FirstCookie',
        value: 'first'
      },
      {
        name: 'SecondCookie',
        value: 'second'
      }
    ]);

    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      1,
      'Set-Cookie',
      'FirstCookie=first; Max-Age=1036800; Path=/; HttpOnly; Secure; SameSite=Lax'
    );

    expect(mockHeaders.append).toHaveBeenNthCalledWith(
      2,
      'Set-Cookie',
      'SecondCookie=second; Max-Age=1036800; Path=/; HttpOnly; Secure; SameSite=Lax'
    );
  });
});
