import {
  adaptBufferForNodeJS,
  arrayBufferToBase64,
  stringToArrayBuffer,
} from "./jwt/utils";

export class RotatingCredential {
  private digestAlgorithm = "SHA-1";

  constructor(private keys: string[]) {}

  private getSignAlgorithm(length: number): HmacKeyAlgorithm {
    return {
      name: "HMAC",
      hash: {
        name: "SHA-1",
      },
      length,
    };
  }

  private async signKey(data: string, keyValue: string) {
    const keyBuffer = stringToArrayBuffer(keyValue);
    const dataBuffer = stringToArrayBuffer(data);
    const keyBitLength = keyBuffer.byteLength * 8;
    const digest = await crypto.subtle.digest(
      this.digestAlgorithm,
      adaptBufferForNodeJS(dataBuffer)
    );
    const key = await crypto.subtle.importKey(
      "raw",
      adaptBufferForNodeJS(keyBuffer),
      this.getSignAlgorithm(keyBitLength),
      false,
      ["sign"]
    );

    const signed = await crypto.subtle.sign(
      this.getSignAlgorithm(keyBitLength),
      key,
      digest
    );

    return arrayBufferToBase64(signed);
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
