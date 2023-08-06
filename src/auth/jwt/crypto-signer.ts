import { ServiceAccountCredential } from "../credential";
import { sign } from "./sign";
import { JWTPayload } from "jose";

export interface CryptoSigner {
  sign(payload: JWTPayload): Promise<string>;
  getAccountId(): Promise<string>;
}

export class ServiceAccountSigner implements CryptoSigner {
  constructor(private readonly credential: ServiceAccountCredential) {}

  public async sign(payload: JWTPayload): Promise<string> {
    return sign({ payload, privateKey: this.credential.privateKey });
  }

  public getAccountId(): Promise<string> {
    return Promise.resolve(this.credential.clientEmail);
  }
}
