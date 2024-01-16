import {KeyFetcher, PublicKeySignatureVerifier} from './signature-verifier';
import {sign} from './jwt/sign';
import {errors} from 'jose';
import {AuthError, AuthErrorCode} from './error';

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHDTErwJZxwJQH
q+Z6t6qwxuyciqfJauCDD6IUf619noIRQZ4GZCUqFkxX8mOPYnEhLApLQdbIlgWq
EEFJLYBP/UH5ojaOMsmO28K+GY/M7UHvZnxweFv48xjED4R2gRcGAcS+LiuUBRke
NAKcXs41HET50wwClHkVX8OQeOK5R7q6hwwA3+8D4o/XpPYp13rROHrWDHhYNEIP
4s7n8klmP/wSLhYmzFoGBSzOxC4N0mH0p47vTTWHoZjyvbTDzjn4n5p6DMV7ggps
o5+1uUCAu8c5uVUiaj5MnBDtXG+CvRgbkT7RCVMuHdHZx1DYzIOtPvp0JMww201Q
JnhZs15pAgMBAAECggEABLRmHh+eLrAbj5bbirj+mtEI1KZeUt9o0RA0h4GBC0AM
2PWRE5uYWUdPpKCBA+mSvPL6h07WEcWh+qQJtv4RU1KsFYdk/LVsmCjPkIiwImrV
LSBh/pKJsfek9TVcryRb8/NkwA39T7FTJ6iZCzMecpjpdHItjX4O4pdx2t9QlIp3
vV6Ob7u+NxgnLCOVP0HvxghTwaX5rWaHbt1TcUmK8069TPPj/AItN6a1S30CCgxU
yVDdfMOThruJUTcUB0mOTux7ZV+JVEA9oUsrChN1LN30uco2d9n77p2U+R/7/CjV
yYOQWT6Nn4m8EmKxmPbn7NfpiHE4gOAmp7r8ZvsndQKBgQD8kV+l63q8jBGQ1maV
X+ZeUcdROq9TV6lRbtRvSgsyXEUMCp3MJMut89XD1T3BkxVEIyYgyAUZ30QnQF/q
HLnIfBmrnQoUp2b1ZOi/G3emOjNMycYYaeR0Y0MHiiOGxVY20KZe/jsD/knqcYB9
jqv2dPTVL/UHVtB/QFXcPf7wQwKBgQDJwaWyDxXghaNWjHCOQ4x1QHVUQAPYlhN6
kBLI9NYHMq/4glN7G+xOjs87qKi2WE1B57WFrsp02e9eEigKDhxHGTtYKbS7xXfR
LpnvGxVE8ZBQK7Rkiiw/0E6xWSXimeYlKPrDQ4jrL0XWh7dgJ4DBfGgpgTYO4DbX
/1jvFAKx4wKBgQCYzNaCCfnCUjdaWevMGS3FCFK+uPNTR6ifJJ8PCUvG1v3K8C1R
UT2MawV7qennz7VA+MbbdEdpxKJ14MNmXqSjPzlEkwiDQFfQxJDu9Y4omfNpVHUt
Vfsp0te9mvwtT/v9w7OzqrlHjDNpy+tBiuxMeauZwp7KJuKS6fhH+5XeAwKBgBVY
rcVXH0NwIEYJ+eazcur89O0DEOUbi9gN4k7syLBeRowOjfKak7gEGB0BzUfts87j
SytnwPf4DwFu/lmCAK/tFYBQeVTcob66JYNM5EU1IcW5ug5hKClgStMs0XtWOSl5
Wn7KaHQpvkPifB5qT48pMIQjraqJQoQ7+hbhkR9tAoGBAKrNCHGq3edhgnVjHJbj
j3rJk3aIe7UffHoNDkq/xE32W1P4ra3t81ItdLRXEJU/XU6ZmbvEpjJUMfXiIZHt
wmK2NLjp4+wipPmSidEwyabBAk4Epb0qIG+MM2RvMUOC8kkV2p5lNFkZYR346wtI
AIqW5jTJYZYfCnGuCyV0F0C0
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxw0xK8CWccCUB6vmereq
sMbsnIqnyWrggw+iFH+tfZ6CEUGeBmQlKhZMV/Jjj2JxISwKS0HWyJYFqhBBSS2A
T/1B+aI2jjLJjtvCvhmPzO1B72Z8cHhb+PMYxA+EdoEXBgHEvi4rlAUZHjQCnF7O
NRxE+dMMApR5FV/DkHjiuUe6uocMAN/vA+KP16T2Kdd60Th61gx4WDRCD+LO5/JJ
Zj/8Ei4WJsxaBgUszsQuDdJh9KeO7001h6GY8r20w845+J+aegzFe4IKbKOftblA
gLvHOblVImo+TJwQ7Vxvgr0YG5E+0QlTLh3R2cdQ2MyDrT76dCTMMNtNUCZ4WbNe
aQIDAQAB
-----END PUBLIC KEY-----
`;
describe('signature verifier', () => {
  it('verifies jwt with public key', async () => {
    const mockKeyId = 'some-key-id';
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          [mockKeyId]: publicKey
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 + 1};
    const token = await sign({payload, privateKey, keyId: mockKeyId});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);
    await signatureVerifier.verify(token);
  });

  it('throws token expired error if token is expired', async () => {
    const mockKeyId = 'some-key-id';
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          [mockKeyId]: publicKey
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 - 1};
    const token = await sign({payload, privateKey, keyId: mockKeyId});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);

    return expect(() => signatureVerifier.verify(token)).rejects.toBeInstanceOf(
      errors.JWTExpired
    );
  });

  it('throws no matching kid error when non of the public keys corresponds to kid', async () => {
    const mockKeyId = 'some-key-id';
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          'some-test-key': '',
          'any-public-key': publicKey
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 + 1};
    const token = await sign({payload, privateKey, keyId: mockKeyId});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);

    return expect(() => signatureVerifier.verify(token)).rejects.toEqual(
      new AuthError(AuthErrorCode.NO_MATCHING_KID)
    );
  });

  it('throws expired error if one of certificates matches, but token is expired', async () => {
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          'some-test-key': '',
          'any-public-key': publicKey
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 - 1};
    const token = await sign({payload, privateKey, keyId: ''});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);

    return expect(() => signatureVerifier.verify(token)).rejects.toBeInstanceOf(
      errors.JWTExpired
    );
  });

  it('validates token against all public keys if key id is missing', async () => {
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          'any-public-key': publicKey
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 + 1};
    const token = await sign({payload, privateKey, keyId: ''});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);
    await signatureVerifier.verify(token);
  });

  it('throws invalid signature error if none of existing keys is valid against token', async () => {
    const mockFetcher = {
      fetchPublicKeys: jest.fn(() =>
        Promise.resolve({
          'any-kid':
            '-----BEGIN PUBLIC KEY-----\n' +
            'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn3JOtipuElI0FxM9a7Ni\n' +
            'IjGBPtZBa8RJofUHJNoGHRS+cN0NU+XUDvwBBozB2jDl6XRg1+fIVX3WiIokFi3O\n' +
            'MI0iUc6Ht++lEC2IhSpQ3F7IxeZYlpvTLA+Df5y2SCcK1haa5mxhzCYxbE3Iyu7q\n' +
            'Ms4wf7AgNY/zYz9wXlhI6ZomuahkLm4nu1yYnKZOxATsCWBeHx9o+skQbYOQ5fn5\n' +
            'e34EVa2fE592Jg4iTXobVSAF1KZIsJerP9P7tkZzrQm6qPz0qV1c7H/1kLN9k3if\n' +
            'EXeCUZP7tL38XtlP5iB6F49f7jmc0WgL7wOuUqyrQbkRiOxOaXP2ibAa+TPgPxP3\n' +
            '1wIDAQAB\n' +
            '-----END PUBLIC KEY-----'
        })
      )
    } as KeyFetcher;
    const payload = {exp: Date.now() / 1000 - 1};
    const token = await sign({payload, privateKey, keyId: ''});
    const signatureVerifier = new PublicKeySignatureVerifier(mockFetcher);

    return expect(() => signatureVerifier.verify(token)).rejects.toEqual(
      new AuthError(AuthErrorCode.INVALID_SIGNATURE)
    );
  });
});
