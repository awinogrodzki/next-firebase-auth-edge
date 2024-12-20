import {MultipleCookieBuilder} from './MultipleCookieBuilder.js';

describe('MultipleCookieBuilder', () => {
  it('should create four cookies, representing all tokens and signature', async () => {
    const builder = new MultipleCookieBuilder('TestCookie', ['secret']);

    expect(
      await builder.buildCookies({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        customToken: 'custom-token'
      })
    ).toEqual([
      {
        name: 'TestCookie.id',
        value: 'id-token'
      },
      {
        name: 'TestCookie.refresh',
        value: 'refresh-token'
      },
      {
        name: 'TestCookie.custom',
        value: 'custom-token'
      },
      {
        name: 'TestCookie.sig',
        value: 'QupyAMaPmI6d90CqB0lvec5Q517onmUvXEk6bONTQM0'
      }
    ]);
  });

  it('should skip custom token if not provided', async () => {
    const builder = new MultipleCookieBuilder('TestCookie', ['secret']);

    expect(
      await builder.buildCookies({
        idToken: 'id-token',
        refreshToken: 'refresh-token'
      })
    ).toEqual([
      {
        name: 'TestCookie.id',
        value: 'id-token'
      },
      {
        name: 'TestCookie.refresh',
        value: 'refresh-token'
      },
      {
        name: 'TestCookie.sig',
        value: 'g-7yXxxJfMmzsR7BqkJjguoUWsOqCTGz2AndxjJBrkw'
      }
    ]);
  });
});
