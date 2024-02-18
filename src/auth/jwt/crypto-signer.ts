import {JWTPayload} from 'jose';
import {Credential, ServiceAccountCredential} from '../credential';
import {ALGORITHM_RS256} from '../signature-verifier';
import {fetchText} from '../utils';
import {sign, signBlob} from './sign';

export interface CryptoSigner {
  sign(payload: JWTPayload): Promise<string>;
  getAccountId(): Promise<string>;
}

export class ServiceAccountSigner implements CryptoSigner {
  constructor(
    private readonly credential: ServiceAccountCredential,
    private readonly tenantId?: string
  ) {}

  public async sign(payload: JWTPayload): Promise<string> {
    if (this.tenantId) {
      payload.tenant_id = this.tenantId;
    }

    return sign({payload, privateKey: this.credential.privateKey});
  }

  public getAccountId(): Promise<string> {
    return Promise.resolve(this.credential.clientEmail);
  }
}

export class IAMSigner implements CryptoSigner {
  algorithm = ALGORITHM_RS256;

  private credential: Credential;
  private tenantId?: string;
  private serviceAccountId?: string;

  constructor(
    credential: Credential,
    tenantId?: string,
    serviceAccountId?: string
  ) {
    this.credential = credential;
    this.tenantId = tenantId;
    this.serviceAccountId = serviceAccountId;
  }

  public async sign(payload: JWTPayload): Promise<string> {
    if (this.tenantId) {
      payload.tenant_id = this.tenantId;
    }

    const serviceAccount = await this.getAccountId();
    const accessToken = await this.credential.getAccessToken();

    return signBlob({
      accessToken: accessToken.accessToken,
      serviceAccountId: serviceAccount,
      payload
    });
  }

  public async getAccountId(): Promise<string> {
    if (this.serviceAccountId) {
      return this.serviceAccountId;
    }

    const token = await this.credential.getAccessToken();
    const url =
      'http://metadata/computeMetadata/v1/instance/service-accounts/default/email';
    const request: RequestInit = {
      method: 'GET',
      headers: {
        'Metadata-Flavor': 'Google',
        Authorization: `Bearer ${token.accessToken}`
      }
    };

    return (this.serviceAccountId = await fetchText(url, request));
  }
}
