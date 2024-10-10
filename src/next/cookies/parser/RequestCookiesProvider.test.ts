import {RequestCookiesProvider} from './RequestCookiesProvider.js';
describe('RequestCookiesProvider', () => {
  it('should copy initial headers', () => {
    const headers = new Headers();
    headers.set('Cookie', 'TestCookie=TestToken');

    const provider = RequestCookiesProvider.fromHeaders(headers);

    expect(provider.get('TestCookie')).toEqual('TestToken');

    headers.set('Cookie', 'NewCookie=SomeNewCookie');

    expect(provider.get('TestCookie')).toEqual('TestToken');
    expect(provider.get('NewCookie')).toEqual(undefined);
  });
});
