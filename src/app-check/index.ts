import {
  Credential,
  ServiceAccount,
  ServiceAccountCredential
} from '../auth/credential';
import {getApplicationDefault} from '../auth/default-credential';
import {VerifyOptions} from '../auth/jwt/verify';
import {cryptoSignerFromCredential} from '../auth/token-generator';
import {AppCheckApiClient} from './api-client';
import {AppCheckTokenGenerator} from './token-generator';
import {AppCheckTokenVerifier} from './token-verifier';
import {
  AppCheckToken,
  AppCheckTokenOptions,
  VerifyAppCheckTokenResponse
} from './types';

class AppCheck {
  private readonly client: AppCheckApiClient;
  private readonly tokenGenerator: AppCheckTokenGenerator;
  private readonly appCheckTokenVerifier: AppCheckTokenVerifier;

  constructor(credential: Credential, tenantId?: string) {
    this.client = new AppCheckApiClient(credential);
    this.tokenGenerator = new AppCheckTokenGenerator(
      cryptoSignerFromCredential(credential, tenantId)
    );
    this.appCheckTokenVerifier = new AppCheckTokenVerifier(credential);
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
    options: VerifyOptions
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

export interface AppCheckOptions {
  serviceAccount?: ServiceAccount;
  tenantId?: string;
}

function isAppCheckOptions(
  options: ServiceAccount | AppCheckOptions
): options is AppCheckOptions {
  const serviceAccount = options as ServiceAccount;

  return (
    !serviceAccount.privateKey ||
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail
  );
}

export function getAppCheck(options: AppCheckOptions): AppCheck;
/** @deprecated Use `AppCheckOptions` configuration object instead */
export function getAppCheck(
  serviceAccount: ServiceAccount,
  tenantId?: string
): AppCheck;
export function getAppCheck(
  serviceAccount: ServiceAccount | AppCheckOptions,
  tenantId?: string
) {
  if (!isAppCheckOptions(serviceAccount)) {
    return new AppCheck(new ServiceAccountCredential(serviceAccount), tenantId);
  }

  const options = serviceAccount;
  const credential = options.serviceAccount
    ? new ServiceAccountCredential(options.serviceAccount)
    : getApplicationDefault();

  return new AppCheck(credential, tenantId);
}
