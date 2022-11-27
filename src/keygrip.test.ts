import { Keygrip } from './keygrip';

describe('keygrip', () => {
  it('should sign and verify string using provided keys', async () => {
    const keys = new Keygrip(['key1', 'key2']);
    const key = await keys.sign('some string');

    expect(key).toEqual('Ingfa3f0diEOHz20c91k6jdToLNg2bwnhGacPx86oYA=');
    expect(await keys.verify('some string', key)).toBe(true);
    expect(await keys.verify('some string', 'wat')).toBe(false);
    expect(await keys.verify('some', key)).toBe(false);
  })

  it('should sign and verify string using different set keys where at least one matches', async () => {
    const keys1 = new Keygrip(['key1', 'key2']);
    const keys2 = new Keygrip(['key2']);
    const key = await keys2.sign('some string');

    expect(await keys1.verify('some string', key)).toBe(true);
  })
})
