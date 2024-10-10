import {SingleCookieBuilder} from './SingleCookieBuilder.js';

describe('SingleCookieBuilder', () => {
  it('should create a signed jwt token cookie based on all tokens', async () => {
    const builder = new SingleCookieBuilder('TestCookie', ['secret']);

    expect(
      await builder.buildCookies({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        customToken: 'custom-token'
      })
    ).toEqual([
      {
        name: 'TestCookie',
        value:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF90b2tlbiI6ImlkLXRva2VuIiwicmVmcmVzaF90b2tlbiI6InJlZnJlc2gtdG9rZW4iLCJjdXN0b21fdG9rZW4iOiJjdXN0b20tdG9rZW4ifQ.ExxN2rNayg2XCR6WNeZmY8tAyc_qyiZ2YdzITRbQocs'
      }
    ]);
  });
});
