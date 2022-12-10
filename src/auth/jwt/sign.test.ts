import { sign } from "./sign";

type GlobalAny = {
  [key: string]: any;
  crypto: {
    subtle: {
      importKey: jest.Mock;
      sign: jest.Mock;
    };
  };
};

describe("sign", () => {
  const globalOriginal = { ...global } as unknown as GlobalAny;
  let globalAny = global as unknown as GlobalAny;

  beforeAll(() => {
    globalAny.crypto = {
      subtle: {
        importKey: jest.fn(),
        sign: jest.fn(),
      },
    };
  });

  afterAll(() => {
    globalAny = globalOriginal;
  });

  beforeEach(() => {
    const cryptoKey = {
      algorithm: {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      extractable: false,
      type: "JWT",
      usages: ["sign"],
    };
    const signature = new Uint8Array(
      "secret".split("").map((character) => character.charCodeAt(0))
    ).buffer;

    globalAny.crypto.subtle.importKey.mockReturnValue(cryptoKey);
    globalAny.crypto.subtle.sign.mockReturnValue(signature);
  });

  it("provides expected JWT with privateKey", async () => {
    expect.assertions(1);

    const payload = { exp: 946688400 };
    const privateKey =
      "-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----\n";

    expect(await sign({ payload, privateKey })).toBe(
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjk0NjY4ODQwMH0.c2VjcmV0"
    );
  });

  it("provides expected JWT with secret", async () => {
    expect.assertions(1);

    const payload = { exp: 946688400 };
    const secret = "secret";

    expect(await sign({ payload, secret })).toBe(
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjk0NjY4ODQwMH0.c2VjcmV0"
    );
  });

  it("adds keyId to ecnoded JWT header", async () => {
    expect.assertions(1);

    const payload = { exp: 946688400 };
    const privateKey =
      "-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----\n";
    const keyId = "key123";

    expect(await sign({ payload, privateKey, keyId })).toBe(
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtleTEyMyJ9.eyJleHAiOjk0NjY4ODQwMH0.c2VjcmV0"
    );
  });
});
