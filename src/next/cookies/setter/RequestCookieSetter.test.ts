import type {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {RequestCookieSetter} from './RequestCookieSetter.ts';

describe('RequestCookieSetter', () => {
  it('should set cookie with options on provided request', () => {
    const mockCookies = {set: jest.fn()} as unknown as RequestCookies;
    const serializeOptions = {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24
    };
    const setter = new RequestCookieSetter(mockCookies, serializeOptions);

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

    expect(mockCookies.set).toHaveBeenNthCalledWith(
      1,
      'FirstCookie',
      'first',
      serializeOptions
    );

    expect(mockCookies.set).toHaveBeenNthCalledWith(
      2,
      'SecondCookie',
      'second',
      serializeOptions
    );
  });
});
