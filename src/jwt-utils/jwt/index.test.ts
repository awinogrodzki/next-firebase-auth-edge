import * as jwebt from '.';
import { decode, isExpired, sign } from '.';

describe('jwebt', () => {
  it('should export decode function', () => {
    expect.assertions(1);

    expect(typeof decode).toBe('function');
  });

  it('should export isExpired function', () => {
    expect.assertions(1);

    expect(typeof isExpired).toBe('function');
  });

  it('should export sign function', () => {
    expect.assertions(1);

    expect(typeof sign).toBe('function');
  });

  it('should not export additional functions', () => {
    expect.assertions(1);

    expect(Object.keys(jwebt)).toStrictEqual(['decode', 'isExpired', 'sign']);
  });
});
