import { useEmulator } from "./firebase";
import { createIdTokenVerifier, DecodedIdToken } from "./token-verifier";
import {
  AuthRequestHandler,
  CreateRequest,
  UpdateRequest,
} from "./auth-request-handler";
import { ServiceAccount, ServiceAccountCredential } from "./credential";
import { UserRecord } from "./user-record";
import { createFirebaseTokenGenerator } from "./token-generator";
import { AuthError, AuthErrorCode } from "./error";
import { VerifyOptions } from "./jwt/verify";

const getCustomTokenEndpoint = (apiKey: string) => {
  if (useEmulator()) {
    return `http://${process.env
      .FIREBASE_AUTH_EMULATOR_HOST!}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  }

  return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
};

const getRefreshTokenEndpoint = (apiKey: string) => {
  if (useEmulator()) {
    return `http://${process.env
      .FIREBASE_AUTH_EMULATOR_HOST!}/securetoken.googleapis.com/v1/token?key=${apiKey}`;
  }

  return `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
};

export async function customTokenToIdAndRefreshTokens(
  customToken: string,
  firebaseApiKey: string,
  tenantId?: string
): Promise<IdAndRefreshTokens> {
  const refreshTokenResponse = await fetch(
    getCustomTokenEndpoint(firebaseApiKey),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId,
        token: customToken,
        returnSecureToken: true,
      }),
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
    refreshToken: refreshTokenJSON.refreshToken,
  };
}

interface ErrorResponse {
  error: {
    code: number;
    message: "USER_NOT_FOUND" | "TOKEN_EXPIRED";
    status: "INVALID_ARGUMENT";
  };
  error_description?: string;
}

interface UserNotFoundResponse extends ErrorResponse {
  error: {
    code: 400;
    message: "USER_NOT_FOUND";
    status: "INVALID_ARGUMENT";
  };
}

const isUserNotFoundResponse = (
  data: unknown
): data is UserNotFoundResponse => {
  return (
    (data as UserNotFoundResponse)?.error?.code === 400 &&
    (data as UserNotFoundResponse)?.error?.message === "USER_NOT_FOUND"
  );
};

const refreshExpiredIdToken = async (
  refreshToken: string,
  apiKey: string
): Promise<string> => {
  // https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
  const response = await fetch(getRefreshTokenEndpoint(apiKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });

  if (!response.ok) {
    const data = await response.json();
    const errorMessage = `Error fetching access token: ${JSON.stringify(
      data.error
    )} ${data.error_description ? `(${data.error_description})` : ""}`;

    if (isUserNotFoundResponse(data)) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND);
    }

    throw new AuthError(AuthErrorCode.INVALID_CREDENTIAL, errorMessage);
  }

  const data = await response.json();

  return data.id_token;
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

export function getFirebaseAuth(
  serviceAccount: ServiceAccount,
  apiKey: string,
  tenantId?: string
) {
  const authRequestHandler = new AuthRequestHandler(serviceAccount, tenantId);
  const credential = new ServiceAccountCredential(serviceAccount);
  const tokenGenerator = createFirebaseTokenGenerator(credential, tenantId);

  const handleTokenRefresh = async (
    refreshToken: string,
    firebaseApiKey: string
  ): Promise<Tokens> => {
    const newToken = await refreshExpiredIdToken(refreshToken, firebaseApiKey);
    const decodedToken = await verifyIdToken(newToken);

    return {
      decodedToken: decodedToken,
      token: newToken,
    };
  };

  async function getUser(uid: string): Promise<UserRecord | null> {
    return authRequestHandler.getAccountInfoByUid(uid).then((response: any) => {
      // Returns the user record populated with server response.
      return response.users?.length ? new UserRecord(response.users[0]) : null;
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
    const idTokenVerifier = createIdTokenVerifier(serviceAccount.projectId);
    const decodedIdToken = await idTokenVerifier.verifyJWT(idToken, options);

    if (checkRevoked) {
      return verifyDecodedJWTNotRevokedOrDisabled(decodedIdToken);
    }

    return decodedIdToken;
  }

  async function verifyAndRefreshExpiredIdToken(
    token: string,
    refreshToken: string,
    options?: VerifyOptions
  ): Promise<Tokens | null> {
    return await handleExpiredToken(
      async () => {
        const decodedToken = await verifyIdToken(token, false, options);
        return { token, decodedToken };
      },
      async () => {
        if (refreshToken) {
          return handleTokenRefresh(refreshToken, apiKey);
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
    firebaseApiKey: string
  ) {
    const tenant = await verifyIdToken(idToken);
    const customToken = await createCustomToken(tenant.uid);

    return customTokenToIdAndRefreshTokens(
      customToken,
      firebaseApiKey,
      tenantId
    );
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
    return authRequestHandler.createNewAccount(properties).then((uid) => {
      return getUser(uid);
    });
  }

  async function updateUser(
    uid: string,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    return authRequestHandler
      .updateExistingAccount(uid, properties)
      .then((existingUid) => {
        return getUser(existingUid);
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
    updateUser,
    createUser,
  };
}
