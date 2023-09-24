import { FlattenedSign, base64url } from "jose";

function toUint8Array(key: string) {
  return Uint8Array.from(key.split("").map((x) => x.charCodeAt(0)));
}

export class RotatingCredential {
  constructor(private keys: string[]) {}

  private async signKey(data: string, keyValue: string) {
    const jws = await new FlattenedSign(base64url.decode(data))
      .setProtectedHeader({ alg: "HS256" })
      .sign(toUint8Array(keyValue));

    return jws.signature;
  }

  public async sign(data: string) {
    return this.signKey(data, this.keys[0]);
  }

  public async verify(data: string, digest: string) {
    return (await this.index(data, digest)) > -1;
  }

  public async index(data: string, digest: string): Promise<number> {
    for (const key of this.keys) {
      const signedKey = await this.signKey(data, key);
      if (signedKey === digest) {
        return this.keys.findIndex((it) => it === key);
      }
    }

    return -1;
  }
}
