import {CookieSetter} from '../setter/CookieSetter.js';
import {MultipleCookieExpiration} from './MultipleCookieExpiration.js';

const mockSetter: CookieSetter = {
  setCookies: jest.fn()
};

const cookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60 * 24,
  expires: new Date(1727373870 * 1000)
};

describe('MultipleCookieExpiration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should remove multiple cookies', () => {
    const expiration = new MultipleCookieExpiration('TestCookie', mockSetter);

    expiration.expireCookies(cookieSerializeOptions);

    expect(mockSetter.setCookies).toHaveBeenCalledWith(
      [
        {name: 'TestCookie.id', value: ''},
        {name: 'TestCookie.refresh', value: ''},
        {name: 'TestCookie.custom', value: ''},
        {name: 'TestCookie.sig', value: ''}
      ],
      {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        expires: new Date(0)
      }
    );
  });

  it('should remove custom cookie', () => {
    const expiration = new MultipleCookieExpiration('TestCookie', mockSetter);

    expiration.expireCustomCookie(cookieSerializeOptions);

    expect(mockSetter.setCookies).toHaveBeenCalledWith(
      [{name: 'TestCookie.custom', value: ''}],
      {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        expires: new Date(0)
      }
    );
  });
});
