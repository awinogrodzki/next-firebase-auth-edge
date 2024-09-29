import {CookieSetter} from '../setter/CookieSetter.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';

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

describe('MultipleCookieRemover', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should remove multiple cookies', () => {
    const remover = new MultipleCookieRemover('TestCookie', mockSetter);

    remover.removeCookies(cookieSerializeOptions);

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
});
