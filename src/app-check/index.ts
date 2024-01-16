import {AppCheckApiClient} from './api-client';
import {AppCheckTokenGenerator} from './token-generator';
import {AppCheckTokenVerifier} from './token-verifier';
import {ServiceAccount, ServiceAccountCredential} from '../auth/credential';
import {ServiceAccountSigner} from '../auth/jwt/crypto-signer';
import {
  AppCheckToken,
  AppCheckTokenOptions,
  VerifyAppCheckTokenResponse
} from './types';
import {VerifyOptions} from '../auth/jwt/verify';

class AppCheck {
  private readonly client: AppCheckApiClient;
  private readonly tokenGenerator: AppCheckTokenGenerator;
  private readonly appCheckTokenVerifier: AppCheckTokenVerifier;

  constructor(credential: ServiceAccountCredential, tenantId?: string) {
    this.client = new AppCheckApiClient(credential);
    this.tokenGenerator = new AppCheckTokenGenerator(
      new ServiceAccountSigner(credential, tenantId)
    );
    this.appCheckTokenVerifier = new AppCheckTokenVerifier(
      credential.projectId
    );
  }

  public createToken = (
    appId: string,
    options?: AppCheckTokenOptions
  ): Promise<AppCheckToken> => {
    return this.tokenGenerator
      .createCustomToken(appId, options)
      .then((customToken) => {
        return this.client.exchangeToken(customToken, appId);
      });
  };

  public verifyToken = (
    appCheckToken: string,
    options?: VerifyOptions
  ): Promise<VerifyAppCheckTokenResponse> => {
    return this.appCheckTokenVerifier
      .verifyToken(appCheckToken, options)
      .then((decodedToken) => {
        return {
          appId: decodedToken.app_id,
          token: decodedToken
        };
      });
  };
}

export function getAppCheck(serviceAccount: ServiceAccount, tenantId?: string) {
  return new AppCheck(new ServiceAccountCredential(serviceAccount), tenantId);
}
