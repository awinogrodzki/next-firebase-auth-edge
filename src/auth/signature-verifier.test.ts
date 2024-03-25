import {KeyFetcher, PublicKeySignatureVerifier, keyDigest} from './signature-verifier';
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

  it('generates a digest from public keys', async () => {
    const publicKeys = {
      ebc2079354571183d71cebed29c55bef27ad2ccb:
        '-----BEGIN CERTIFICATE-----\nMIIDHDCCAgSgAwIBAgIIU3iPN2Mb46cwDQYJKoZIhvcNAQEFBQAwMTEvMC0GA1UE\nAwwmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjQw\nMzEzMDczMjE1WhcNMjQwMzI5MTk0NzE1WjAxMS8wLQYDVQQDDCZzZWN1cmV0b2tl\nbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBALor7Fk7v0mQvbtCShY1y8u4XJYpJyEZMp2w4V2LaN+GXjBg\nT9ogLyrA0Wt5KBNAPtboU41+Z7JxoOG+LGP1z6FZtjypPq7NzdLuwfGSDhzHB7lq\nlGkGXBE/L++lblMbuwMb+ngfjIQkNwmXIJkTueS04XuW79QAq71JKQIfkd0cgovk\nkO4eUIaISUGPHpl9FWT5lqR0AhczDGebG9yXO4hevGXKPgkWPVNj6hKqqBcFVNs5\nwcEGXE95lneAq7DUceMTFQm1dXDKVP+BlBXN2B75rQKGnC5IBi5r3FukVh4Gxtmi\nJhaWtQxLl1qlbeNi+nweUdkhmMlT26hCXAQR/fECAwEAAaM4MDYwDAYDVR0TAQH/\nBAIwADAOBgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwIwDQYJ\nKoZIhvcNAQEFBQADggEBAFoqdWHw0wWnXgSQawad6WewmJkykMq1XV9VHYAD7uVv\nrjdorPONNv01GFw2UniqO7OlfjP4QzQvyX1/mt8GoAbkPL1JXD5FsDMLwK8iq2qN\ngPNjwRvlmQBpHRDNmHN04vpp1ub0SW5+rBoB4+snt6cb3F6O90SVnxupfxABraWd\n+o1c0c4tM79PhMGz4+01FLbFMUxDJxc12G1VAE3EuAT/aoVLxLQQADVGxvpOSPrh\nKY9w0Y+XpNP44P/FYl0yuQtvBPrltRywAo6+kKEXXwkpLYebkIblbe7pnJePxXE7\nu6Ucjyr6Fjg6OHXDWaZfQx6p4uoq1mtnQjz4+Vnsai8=\n-----END CERTIFICATE-----\n',
      ba62596f52f52ed44049396be7df34d2c64f453e:
        '-----BEGIN CERTIFICATE-----\nMIIDHSCCAgWgAwIBAgIJAKgXsBK+n1ulMA0GCSqGSIb3DQEBBQUAMDExLzAtBgNV\nBAMMJnNlY3VyZXRva2VuLnN5c3RlbS5nc2VydmljZWFjY291bnQuY29tMB4XDTI0\nMDMyMTA3MzIxNloXDTI0MDQwNjE5NDcxNlowMTEvMC0GA1UEAwwmc2VjdXJldG9r\nZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQDYYI/yCkAF+BnvDvemAelqhFfMx2NeNRwq7P0ArDQKIeeV\neZHBM55CiPppgVcvXKZDqfTvlrJHtKvC37MzrwM6n1LcJyrJdz5BiiMu2R+xgSv7\nLuNdlJ3/Gd8dFiF5fW8FOpnwRBFoz6BjGbJaApliDUpeRiqpx0czzzXKg5FusT2o\ngweLV5cxVh/UFOuNdifJyiGcADUvrmukuEo4sF86JG5ITX7PryJJJdbmuToIXKk7\nCkR6mxsoVONEA1SlYMLm+kwljDbUAoePQJA1WyGiB57gmdj/f2FVpfCcvMeuQYSM\nHj4gD+jQ114oGp3m1R0KfMA4ZG8pGgEEHWqwuMeNAgMBAAGjODA2MAwGA1UdEwEB\n/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMCMA0G\nCSqGSIb3DQEBBQUAA4IBAQBW/S7asaDLbSWUE47spawf1r9t1zfErfv8PusF/HYs\nNkBKhWIV2au2aGphob34fxjOYEKgZzdqF7MyLreashNgbRZL+VpVlmbHu6Ud0jHp\nZBgBaZR6Nqw4oDR3TnBlYZtrnvT8foEl2Uloa3gj31pmRp4fvJQ+twNzZo39ONm5\n0+8gZEkg7sfmp9dpoBU3igdLHY76+lCM3MwEqPbAcN/6reF6YsYUb/9dyoInP5Rt\nU8Cr2MFruJd9UjUB0aMHtyGBxhF9sCBZksbE16cyLXmi98PwSqkrcRYWz+hzqkNA\n92yHkt81DT8w0gSGgKjBdOb6uh3N4/DQp4Gt4MKQ2Ib6\n-----END CERTIFICATE-----\n'
    };

    expect(await keyDigest(publicKeys)).toEqual("hIPiO6pz8VcSDnb9qQTxysA5rhZbBekzsvyfkNw2kLU")
  });
});
