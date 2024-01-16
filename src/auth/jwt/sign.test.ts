import {sign} from './sign';

type GlobalAny = {
  [key: string]: any;
  crypto: {
    subtle: {
      importKey: jest.Mock;
      sign: jest.Mock;
    };
  };
};

const PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\n' +
  'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFL3Pc33GkWha1\n' +
  'WSMRw5e3spUCQAwpGnsRBMcG6JH+eHeHOJYI0odFPqCujVQTyTOEZwKZUtzRvMWP\n' +
  'h+kgIdDw+1+hzsJJTDijHHNi/G/g2kPHpXXVaEdOKnwvOddhC3L79W2vxhcx2e64\n' +
  'LwhbdP880GKHTiCzx8CjkpRExyzN935wHQ90IGaN/mGOQcBE/3j8u6oDqRbxt+IG\n' +
  'xypQTRZR7TFw/Z9OYNt0pr0BI0jNMMDkmAxkUNH6Qw4eurQ7XXATS3cWnR4qiAIp\n' +
  'S2HIxGiCr7PpVJJSWtTVqMgDF6y2xXtiw9H8Gdo36rTytUpyFH0gQeL923+sy9ru\n' +
  'y4aWqL19AgMBAAECggEAXBVN6S6btmGvyx6GRwxtNIb8GSHpy+Qm5oqxmyNO0mRV\n' +
  'hVtCjXorW4Xkqb8sLVU/bqxgRVOx9WxPYjjZAH1qQq9ROJICnxIuPNXTeL1kTb//\n' +
  '+SLmxTM+YV1rwu4jC5m6J7m0cGp0eH5Kgc7M+1DGxRKXgJJWqT42Uuznurq8zK3e\n' +
  'iEmbqLQrDQuhjAcVsy/1DuQWkUy/TbIQ/9YxgsJfAy9T4QMh8KNngpud/gA8PWEM\n' +
  'BkWJlk2e5hdHB9RJdZeBmzOLaKmVQ6oIwi+V7p9udH4lWAiGqBy9ziexTVFDk8Xi\n' +
  'dY/zHKEFyQc+7rNhVDsKJvJaZNAZk44hLORcmfcbDQKBgQDknvpqIi3jgcyOy9G4\n' +
  'lO2dRIIQY75fZKH1A3etU5k3irL2JlBYIqs5+YKUpAf3gueKF/jY5p/7duxYFvWn\n' +
  'fj8UyHWVAweShcrp5hD51DXcWssy8i9UgzqjI/mg0sdVksUbwLllSPJ3sHv1QxY3\n' +
  'ylq8ng0o01BdjzKngUiE6RJq0wKBgQDczLnam9EjlqhC/8ud5/tfPyD4go3n/LEo\n' +
  '1E7VN8IM2rshWZ/YRAw4aZ/mM9mx42pI1LBmaG0VJmGEZMYIzM114KuNiqnQSkOe\n' +
  'rj4YCahkwkyHIxPjLDzX/hMIEFS/23nihOuC+FQOluHBLwmUZOOUk94s5O/oQp9x\n' +
  'c5JVtwZkbwKBgEuoMMaeuQDpG4DGAolK/7djzIcP+xgmfVJP63L4j2PKCp9a3ovM\n' +
  'LU3qPERkZB6Mu4L/m+Jrr9XP7TbZokHjjYybKg4+Cmt6y0PMVyHWEFzzzvr1GqSl\n' +
  'KOqEJUALgNvYzlH43WGfWl4xkVQA94FO/egdhc1U4OuVT/YO2qjhWK7xAoGBANyF\n' +
  'I8HwCUqP93Ei5IvK20XfWOCaE3x05cMvd6R/0bDg7DB8wKZQIBxfcbGKa4u847Pl\n' +
  'qGA/P2L2OELwGtFDKpjmULBGox9CbJKY169ORf6MB76YDA7BaesW+I7/MIWFgA/6\n' +
  'TPU7a0g+7S3x+pFYyerkW+teozTHBVNb5/TvnNTFAoGBAJSkdCSHsKUWDeTDDs8W\n' +
  'xJc+0rgIjrbsYfu/jFoe4gWomr4b76PVPm7A5PvDkwt91amTPO3QpFj8kTMz4mKP\n' +
  'RXOPfGOI0RVxREB6uKYC1H2eMOFformJXm27wxxMhdhAgbK3dye7Bn7Owrj5Ek67\n' +
  '4SD8Q27MvEowXdJvH32RE8ap\n' +
  '-----END PRIVATE KEY-----';

describe('sign', () => {
  const globalOriginal = {...global} as unknown as GlobalAny;
  let globalAny = global as unknown as GlobalAny;

  beforeAll(() => {
    globalAny.crypto = {
      subtle: {
        importKey: jest.fn(),
        sign: jest.fn()
      }
    };
  });

  afterAll(() => {
    globalAny = globalOriginal;
  });

  beforeEach(() => {
    const cryptoKey = {
      algorithm: {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      extractable: false,
      type: 'JWT',
      usages: ['sign']
    };
    const signature = new Uint8Array(
      'secret'.split('').map((character) => character.charCodeAt(0))
    ).buffer;

    globalAny.crypto.subtle.importKey.mockReturnValue(cryptoKey);
    globalAny.crypto.subtle.sign.mockReturnValue(signature);
  });

  it('provides expected JWT with privateKey', async () => {
    expect.assertions(1);

    const payload = {exp: 946688400};

    expect(await sign({payload, privateKey: PRIVATE_KEY})).toBe(
      'eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjk0NjY4ODQwMH0.qZUNyJG5IBztEQuTxAIHkLcGxI8on81rsw0MQt6gC3hHebWZx-icF05M-PwbHjJkGIGxvlzwOHdpzV1xiJN32BQtZDPa3SMx7DeMYrNS3h1gV_hAz0ylnrja-zBIGWb_Q1MZU_jMmrvYCk8wd2qU4SqbnC3LNVPxoxVsIMUMdTtA2fZ5Wk99LkYnPn-UMuR0vSMoJ2foCe2Imhwmjrfa47xxUIK0126GdX3qmY2Ico9KgfOQJz1ksJOrd1yCSVEK9QLRLGC4PAruyW_EWln1s6Bzger1v4MPjFmZULMoLGzW3R31rjdF51FFCswHf2miTP2VkJW3i_ng5XdQS-LUKA'
    );
  });

  it('adds keyId to ecnoded JWT header', async () => {
    expect.assertions(1);

    const payload = {exp: 946688400};
    const keyId = 'key123';

    expect(await sign({payload, privateKey: PRIVATE_KEY, keyId})).toBe(
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleTEyMyJ9.eyJleHAiOjk0NjY4ODQwMH0.t60FJH4NlQysOhzsvHYwRI5eOQqcwgyUqdkOtwV9US4cl04J3ynb9Rfme1bnq29HVqzpHpTHg8qxOFcCPbBr-kwbpg9dRVXHteTtE-LH9L-9TP9eQ8KeNwx6toNyESdGPsNPduMKSSgXMoITpfN1QGpgiREXCPo7atRmL7Jmzt1-9vocwlLCqx5gx_X9x8uPwzHZPu66Q28rzj_Kib9bBjbRFObA0OYMi2raI5DrbvEj2eZgYP4QhxOmfKkYGskW5Ne0GOy4YIPNMsFnw_rH3UhM_fqb7vwIe0f3zB9vK2WknxkNkNvwCrza_R-o98PG-qmvVWsTgnrmCoFfL40rLA'
    );
  });
});
