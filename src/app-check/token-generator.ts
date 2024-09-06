import {CryptoSigner} from '../auth/jwt/crypto-signer';
import {AppCheckTokenOptions} from './types';
import {FirebaseAppCheckError} from './api-client';

const ONE_MINUTE_IN_SECONDS = 60;
const ONE_MINUTE_IN_MILLIS = ONE_MINUTE_IN_SECONDS * 1000;
const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

const FIREBASE_APP_CHECK_AUDIENCE =
  'https://firebaseappcheck.googleapis.com/google.firebase.appcheck.v1.TokenExchangeService';

function transformMillisecondsToSecondsString(milliseconds: number): string {
  let duration: string;
  const seconds = Math.floor(milliseconds / 1000);
  const nanos = Math.floor((milliseconds - seconds * 1000) * 1000000);
  if (nanos > 0) {
    let nanoString = nanos.toString();
    while (nanoString.length < 9) {
      nanoString = '0' + nanoString;
    }
    duration = `${seconds}.${nanoString}s`;
  } else {
    duration = `${seconds}s`;
  }
  return duration;
}

export class AppCheckTokenGenerator {
  private readonly signer: CryptoSigner;

  constructor(signer: CryptoSigner) {
    this.signer = signer;
  }

  public async createCustomToken(
    appId: string,
    options?: AppCheckTokenOptions
  ): Promise<string> {
    if (!appId) {
      throw new FirebaseAppCheckError(
        'invalid-argument',
        '`appId` must be a non-empty string.'
      );
    }
    let customOptions = {};
    if (typeof options !== 'undefined') {
      customOptions = this.validateTokenOptions(options);
    }

    const account = await this.signer.getAccountId();

    const iat = Math.floor(Date.now() / 1000);
    const body = {
      iss: account,
      sub: account,
      app_id: appId,
      aud: FIREBASE_APP_CHECK_AUDIENCE,
      exp: iat + ONE_MINUTE_IN_SECONDS * 5,
      iat,
      ...customOptions
    };

    return this.signer.sign(body);
  }

  private validateTokenOptions(options: AppCheckTokenOptions): {
    [key: string]: unknown;
  } {
    if (typeof options.ttlMillis !== 'undefined') {
      if (
        options.ttlMillis < ONE_MINUTE_IN_MILLIS * 30 ||
        options.ttlMillis > ONE_DAY_IN_MILLIS * 7
      ) {
        throw new FirebaseAppCheckError(
          'invalid-argument',
          'ttlMillis must be a duration in milliseconds between 30 minutes and 7 days (inclusive).'
        );
      }

      return {ttl: transformMillisecondsToSecondsString(options.ttlMillis)};
    }
    return {};
  }
}
