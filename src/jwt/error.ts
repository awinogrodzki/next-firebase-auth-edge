export class JwtError extends Error {
  constructor(readonly code: JwtErrorCode, readonly message: string) {
    super(message);
    Object.setPrototypeOf(this, JwtError.prototype);
  }
}

export enum JwtErrorCode {
  INVALID_ARGUMENT = 'invalid-argument',
  INVALID_CREDENTIAL = 'invalid-credential',
  TOKEN_EXPIRED = 'token-expired',
  INVALID_SIGNATURE = 'invalid-token',
  NO_MATCHING_KID = 'no-matching-kid-error',
  NO_KID_IN_HEADER = 'no-kid-error',
  KEY_FETCH_ERROR = 'key-fetch-error',
}
