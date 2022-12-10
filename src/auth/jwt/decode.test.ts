import { decode } from "./decode";

const fakeJWT =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjk0NjY4ODQwMH0.c2VjcmV0";

describe("decode", () => {
  it("should return decoded payload", () => {
    expect.assertions(1);

    expect(decode(fakeJWT)).toStrictEqual({ exp: 946688400 });
  });

  describe("options.complete", () => {
    it("should return object containing header, payload and signature when complete = true", () => {
      expect.assertions(1);

      expect(decode(fakeJWT, { complete: true })).toStrictEqual({
        header: { typ: "JWT", alg: "RS256" },
        payload: { exp: 946688400 },
        signature: "c2VjcmV0",
      });
    });

    it("should return payload only when complete = false", () => {
      expect.assertions(1);

      expect(decode(fakeJWT, { complete: false })).toStrictEqual({
        exp: 946688400,
      });
    });
  });
});
