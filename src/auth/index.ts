import {debug} from '../debug';
import {
  AuthRequestHandler,
  CreateRequest,
  UpdateRequest
} from './auth-request-handler';
import {
  ServiceAccount,
  ServiceAccountCredential,
  Credential
} from './credential';
import {getApplicationDefault} from './default-credential';
import {AuthError, AuthErrorCode} from './error';
import {useEmulator} from './firebase';
import {VerifyOptions} from './jwt/verify';
import {createFirebaseTokenGenerator} from './token-generator';
import {createIdTokenVerifier, DecodedIdToken} from './token-verifier';
import {UserRecord} from './user-record';

const getCustomTokenEndpoint = (apiKey: string) => {
  if (useEmulator() && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    let protocol = 'http://';
    if (
      (process.env.FIREBASE_AUTH_EMULATOR_HOST as string).startsWith('http://')
    ) {
      protocol = '';
    }
    return `${protocol}${process.env
      .FIREBASE_AUTH_EMULATOR_HOST!}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  }

  return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
};

const getRefreshTokenEndpoint = (apiKey: string) => {
  if (useEmulator() && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    let protocol = 'http://';
    if (
      (process.env.FIREBASE_AUTH_EMULATOR_HOST as string).startsWith('http://')
    ) {
      protocol = '';
    }

    return `${protocol}${process.env
      .FIREBASE_AUTH_EMULATOR_HOST!}/securetoken.googleapis.com/v1/token?key=${apiKey}`;
  }

  return `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
};

interface CustomTokenToIdAndRefreshTokensOptions {
  tenantId?: string;
  appCheckToken?: string;
}

export async function customTokenToIdAndRefreshTokens(
  customToken: string,
  firebaseApiKey: string,
  options: CustomTokenToIdAndRefreshTokensOptions = {}
): Promise<IdAndRefreshTokens> {
  const headers = {
    'Content-Type': 'application/json'
  };

  const body: object = {
    token: customToken,
    returnSecureToken: true
  };

  if (options.appCheckToken) {
    headers['X-Firebase-AppCheck'] = options.appCheckToken;
  }

  if (options.tenantId) {
    body['tenantId'] = options.tenantId;
  }

  const refreshTokenResponse = await fetch(
    getCustomTokenEndpoint(firebaseApiKey),
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }
  );

  const refreshTokenJSON =
    (await refreshTokenResponse.json()) as DecodedIdToken;

  if (!refreshTokenResponse.ok) {
    throw new Error(
      `Problem getting a refresh token: ${JSON.stringify(refreshTokenJSON)}`
    );
  }

  return {
    idToken: refreshTokenJSON.idToken,
    refreshToken: refreshTokenJSON.refreshToken
  };
}

interface ErrorResponse {
  error: {
    code: number;
    message: 'USER_NOT_FOUND' | 'TOKEN_EXPIRED';
    status: 'INVALID_ARGUMENT';
  };
  error_description?: string;
}

interface UserNotFoundResponse extends ErrorResponse {
  error: {
    code: 400;
    message: 'USER_NOT_FOUND';
    status: 'INVALID_ARGUMENT';
  };
}

const isUserNotFoundResponse = (
  data: unknown
): data is UserNotFoundResponse => {
  return (
    (data as UserNotFoundResponse)?.error?.code === 400 &&
    (data as UserNotFoundResponse)?.error?.message === 'USER_NOT_FOUND'
  );
};

const refreshExpiredIdToken = async (
  refreshToken: string,
  apiKey: string
): Promise<IdAndRefreshTokens> => {
  // https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
  const response = await fetch(getRefreshTokenEndpoint(apiKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  });

  if (!response.ok) {
    const data = await response.json();
    const errorMessage = `Error fetching access token: ${JSON.stringify(
      data.error
    )} ${data.error_description ? `(${data.error_description})` : ''}`;

    if (isUserNotFoundResponse(data)) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND);
    }

    throw new AuthError(AuthErrorCode.INVALID_CREDENTIAL, errorMessage);
  }

  const data = await response.json();

  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token
  };
};

export function isUserNotFoundError(error: unknown): error is AuthError {
  return (error as AuthError)?.code === AuthErrorCode.USER_NOT_FOUND;
}

export function isInvalidCredentialError(error: unknown): error is AuthError {
  return (error as AuthError)?.code === AuthErrorCode.INVALID_CREDENTIAL;
}

export async function handleExpiredToken<T>(
  verifyIdToken: () => Promise<T>,
  onExpired: (e: AuthError) => Promise<T>,
  onError: (e: unknown) => Promise<T>
): Promise<T> {
  try {
    return await verifyIdToken();
  } catch (e: any) {
    switch ((e as AuthError).code) {
      case AuthErrorCode.TOKEN_EXPIRED:
        try {
          return await onExpired(e);
        } catch (e) {
          return onError(e);
        }
      default:
        return onError(e);
    }
  }
}

export interface IdAndRefreshTokens {
  idToken: string;
  refreshToken: string;
}

export interface Tokens {
  decodedToken: DecodedIdToken;
  token: string;
}

export interface UsersList {
  users: UserRecord[];
  nextPageToken?: string;
}

export interface VerifyTokenResult {
  idToken: string;
  decodedIdToken: DecodedIdToken;
  refreshToken: string;
}

interface AuthOptions {
  credential: Credential;
  apiKey: string;
  tenantId?: string;
  serviceAccountId?: string;
  UNSAFE_expireTokenOnInvalidKidHeader?: boolean;
}

export type Auth = ReturnType<typeof getAuth>;

function getAuth(options: AuthOptions) {
  const credential = options.credential ?? getApplicationDefault();
  const authRequestHandler = new AuthRequestHandler(credential, {
    tenantId: options.tenantId
  });
  const tokenGenerator = createFirebaseTokenGenerator(
    credential,
    options.tenantId
  );

  const handleTokenRefresh = async (
    refreshToken: string
  ): Promise<VerifyTokenResult> => {
    const {idToken, refreshToken: newRefreshToken} =
      await refreshExpiredIdToken(refreshToken, options.apiKey);
    const decodedIdToken = await verifyIdToken(idToken);

    return {
      decodedIdToken,
      idToken,
      refreshToken: newRefreshToken
    };
  };

  async function getUser(uid: string): Promise<UserRecord | null> {
    return authRequestHandler.getAccountInfoByUid(uid).then((response: any) => {
      // Returns the user record populated with server response.
      return response.users?.length ? new UserRecord(response.users[0]) : null;
    });
  }

  async function listUsers(
    nextPageToken?: string,
    maxResults?: number
  ): Promise<UsersList> {
    return authRequestHandler
      .listUsers(nextPageToken, maxResults)
      .then((response) => {
        const result: UsersList = {
          users: response.users.map((user) => new UserRecord(user))
        };

        if (response.nextPageToken) {
          result.nextPageToken = response.nextPageToken;
        }

        return result;
      });
  }

  async function getUserByEmail(email: string): Promise<UserRecord> {
    return authRequestHandler.getAccountInfoByEmail(email).then((response) => {
      if (!response.users || !response.users.length) {
        throw new AuthError(AuthErrorCode.USER_NOT_FOUND);
      }

      return new UserRecord(response.users[0]);
    });
  }

  async function verifyDecodedJWTNotRevokedOrDisabled(
    decodedIdToken: DecodedIdToken
  ): Promise<DecodedIdToken> {
    return getUser(decodedIdToken.sub).then((user: UserRecord | null) => {
      if (!user) {
        throw new AuthError(AuthErrorCode.USER_NOT_FOUND);
      }

      if (user.disabled) {
        throw new AuthError(AuthErrorCode.USER_DISABLED);
      }

      if (user.tokensValidAfterTime) {
        const authTimeUtc = decodedIdToken.auth_time * 1000;
        const validSinceUtc = new Date(user.tokensValidAfterTime).getTime();
        if (authTimeUtc < validSinceUtc) {
          throw new AuthError(AuthErrorCode.TOKEN_REVOKED);
        }
      }

      return decodedIdToken;
    });
  }

  async function verifyIdToken(
    idToken: string,
    checkRevoked = false,
    options?: VerifyOptions
  ): Promise<DecodedIdToken> {
    const projectId = await credential.getProjectId();
    const idTokenVerifier = createIdTokenVerifier(projectId);
    const decodedIdToken = await idTokenVerifier.verifyJWT(idToken, options);

    if (checkRevoked) {
      return verifyDecodedJWTNotRevokedOrDisabled(decodedIdToken);
    }

    return decodedIdToken;
  }

  async function verifyAndRefreshExpiredIdToken(
    idToken: string,
    refreshToken: string,
    options?: VerifyOptions
  ): Promise<VerifyTokenResult | null> {
    return await handleExpiredToken(
      async () => {
        const decodedIdToken = await verifyIdToken(idToken, false, options);
        return {idToken, decodedIdToken, refreshToken};
      },
      async () => {
        if (refreshToken) {
          return handleTokenRefresh(refreshToken);
        }

        return null;
      },
      async () => {
        return null;
      }
    );
  }

  function createCustomToken(
    uid: string,
    developerClaims?: object
  ): Promise<string> {
    return tokenGenerator.createCustomToken(uid, developerClaims);
  }

  async function getCustomIdAndRefreshTokens(
    idToken: string,
    appCheckToken?: string
  ) {
    const decodedToken = await verifyIdToken(idToken);
    const customToken = await createCustomToken(decodedToken.uid, {
      email_verified: decodedToken.email_verified,
      source_sign_in_provider: decodedToken.firebase.sign_in_provider
    });

    debug('Generated custom token based on provided idToken', {customToken});

    return customTokenToIdAndRefreshTokens(customToken, options.apiKey, {
      tenantId: options.tenantId,
      appCheckToken
    });
  }

  async function deleteUser(uid: string): Promise<void> {
    await authRequestHandler.deleteAccount(uid);
  }

  async function setCustomUserClaims(
    uid: string,
    customUserClaims: object | null
  ) {
    await authRequestHandler.setCustomUserClaims(uid, customUserClaims);
  }

  async function createUser(properties: CreateRequest): Promise<UserRecord> {
    return authRequestHandler
      .createNewAccount(properties)
      .then((uid) => getUser(uid))
      .then((user) => {
        if (!user) {
          throw new AuthError(
            AuthErrorCode.INTERNAL_ERROR,
            'Could not get recently created user from database. Most likely it was deleted.'
          );
        }
        return user;
      });
  }

  async function updateUser(
    uid: string,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    return authRequestHandler
      .updateExistingAccount(uid, properties)
      .then((existingUid) => getUser(existingUid))
      .then((user) => {
        if (!user) {
          throw new AuthError(
            AuthErrorCode.INTERNAL_ERROR,
            'Could not get recently updated user from database. Most likely it was deleted.'
          );
        }

        return user;
      });
  }

  return {
    verifyAndRefreshExpiredIdToken,
    verifyIdToken,
    createCustomToken,
    getCustomIdAndRefreshTokens,
    handleTokenRefresh,
    deleteUser,
    setCustomUserClaims,
    getUser,
    getUserByEmail,
    updateUser,
    createUser,
    listUsers
  };
}

function isFirebaseAuthOptions(
  options: FirebaseAuthOptions | ServiceAccount
): options is FirebaseAuthOptions {
  const serviceAccount = options as ServiceAccount;

  return (
    !serviceAccount.privateKey ||
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail
  );
}

export interface FirebaseAuthOptions {
  serviceAccount?: ServiceAccount;
  apiKey: string;
  tenantId?: string;
  serviceAccountId?: string;
  UNSAFE_expireTokenOnInvalidKidHeader?: boolean;
}
export function getFirebaseAuth(options: FirebaseAuthOptions): Auth;
/** @deprecated Use `FirebaseAuthOptions` configuration object instead */
export function getFirebaseAuth(
  serviceAccount: ServiceAccount,
  apiKey: string,
  tenantId?: string
): Auth;
export function getFirebaseAuth(
  serviceAccount: ServiceAccount | FirebaseAuthOptions,
  apiKey?: string,
  tenantId?: string
): Auth {
  if (!isFirebaseAuthOptions(serviceAccount)) {
    const credential = new ServiceAccountCredential(serviceAccount);

    return getAuth({credential, apiKey: apiKey!, tenantId});
  }

  const options = serviceAccount;

  return getAuth({
    credential: options.serviceAccount
      ? new ServiceAccountCredential(options.serviceAccount)
      : getApplicationDefault(),
    apiKey: options.apiKey,
    tenantId: options.tenantId,
    serviceAccountId: options.serviceAccountId,
    UNSAFE_expireTokenOnInvalidKidHeader:
      options.UNSAFE_expireTokenOnInvalidKidHeader
  });
}
