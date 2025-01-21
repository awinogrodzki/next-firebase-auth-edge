import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';

const mockCookies: RequestCookies = {
  delete: jest.fn()
} as unknown as RequestCookies;

describe('MultipleCookieRemover', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should remove multiple cookies', () => {
    const remover = new MultipleCookieRemover('TestCookie', mockCookies);

    remover.removeCookies();

    expect(mockCookies.delete).toHaveBeenNthCalledWith(1, 'TestCookie.id');
    expect(mockCookies.delete).toHaveBeenNthCalledWith(2, 'TestCookie.refresh');
    expect(mockCookies.delete).toHaveBeenNthCalledWith(3, 'TestCookie.custom');
    expect(mockCookies.delete).toHaveBeenNthCalledWith(4, 'TestCookie.sig');
  });
});
