export enum AuthErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_DISABLED = 'USER_DISABLED',
  INVALID_CREDENTIAL = 'INVALID_CREDENTIAL',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NO_KID_IN_HEADER = 'NO_KID_IN_HEADER',
  NO_MATCHING_KID = 'NO_MATCHING_KID',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE'
}

const AuthErrorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCode.USER_NOT_FOUND]: 'User not found',
  [AuthErrorCode.INVALID_CREDENTIAL]: 'Invalid credentials',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Token expired',
  [AuthErrorCode.USER_DISABLED]: 'User disabled',
  [AuthErrorCode.TOKEN_REVOKED]: 'Token revoked',
  [AuthErrorCode.INVALID_ARGUMENT]: 'Invalid argument',
  [AuthErrorCode.INTERNAL_ERROR]: 'Internal error',
  [AuthErrorCode.NO_KID_IN_HEADER]: 'No kid in jwt header',
  [AuthErrorCode.NO_MATCHING_KID]: 'Kid is not matching any certificate',
  [AuthErrorCode.INVALID_SIGNATURE]: 'Invalid token signature.'
};

function getErrorMessage(code: AuthErrorCode, customMessage?: string) {
  if (!customMessage) {
    return AuthErrorMessages[code];
  }

  return `${AuthErrorMessages[code]}: ${customMessage}`;
}

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode, customMessage?: string) {
    super(getErrorMessage(code, customMessage));
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  public toJSON(): object {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export enum InvalidTokenReason {
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',
  MISSING_REFRESH_TOKEN = 'MISSING_REFRESH_TOKEN',
  MALFORMED_CREDENTIALS = 'MALFORMED_CREDENTIALS',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
}

const InvalidTokenMessages: Record<InvalidTokenReason, string> = {
  [InvalidTokenReason.MISSING_CREDENTIALS]: 'Missing credentials',
  [InvalidTokenReason.MALFORMED_CREDENTIALS]: 'Credentials are incorrectly formatted',
  [InvalidTokenReason.INVALID_SIGNATURE]: 'Credentials have invalid signature',
  [InvalidTokenReason.MISSING_REFRESH_TOKEN]: 'Refresh token is missing',
  [InvalidTokenReason.INVALID_CREDENTIALS]: 'Invalid credentials'
};

export class InvalidTokenError extends Error {
  constructor(public readonly reason: InvalidTokenReason) {
    super(`${reason}: ${InvalidTokenMessages[reason]}`);
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}
