import { useEmulator } from "./firebase";
import { createIdTokenVerifier, DecodedIdToken } from "./token-verifier";
import { AuthClientErrorCode, ErrorInfo, FirebaseAuthError } from "./error";
import { AuthRequestHandler } from "./auth-request-handler";
import { ServiceAccount, ServiceAccountCredential } from "./credential";
import { UserRecord } from "./user-record";
import { createFirebaseTokenGenerator } from "./token-generator";

if (typeof crypto === "undefined" || typeof global.crypto === "undefined") {
  const { Crypto } = require("@peculiar/webcrypto");
  (global as any).crypto = new Crypto();
}

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
  firebaseApiKey: string
): Promise<IdAndRefreshTokens> {
  const refreshTokenResponse = await fetch(
    getCustomTokenEndpoint(firebaseApiKey),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
    throw new Error(
      "Error during refreshing expired token: " + JSON.stringify(data)
    );
  }

  const data = await response.json();

  return data.id_token;
};

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
  apiKey: string
) {
  const authRequestHandler = new AuthRequestHandler(serviceAccount);
  const credential = new ServiceAccountCredential(serviceAccount);
  const tokenGenerator = createFirebaseTokenGenerator(credential);

  const getTokens = async (
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

  async function getUser(uid: string): Promise<UserRecord> {
    return authRequestHandler.getAccountInfoByUid(uid).then((response: any) => {
      // Returns the user record populated with server response.
      return new UserRecord(response.users[0]);
    });
  }

  async function verifyDecodedJWTNotRevokedOrDisabled(
    decodedIdToken: DecodedIdToken,
    revocationErrorInfo: ErrorInfo
  ): Promise<DecodedIdToken> {
    // Get tokens valid after time for the corresponding user.
    return getUser(decodedIdToken.sub).then((user: UserRecord) => {
      if (user.disabled) {
        throw new FirebaseAuthError(
          AuthClientErrorCode.USER_DISABLED,
          "The user record is disabled."
        );
      }
      // If no tokens valid after time available, token is not revoked.
      if (user.tokensValidAfterTime) {
        // Get the ID token authentication time and convert to milliseconds UTC.
        const authTimeUtc = decodedIdToken.auth_time * 1000;
        // Get user tokens valid after time in milliseconds UTC.
        const validSinceUtc = new Date(user.tokensValidAfterTime).getTime();
        // Check if authentication time is older than valid since time.
        if (authTimeUtc < validSinceUtc) {
          throw new FirebaseAuthError(revocationErrorInfo);
        }
      }
      // All checks above passed. Return the decoded token.
      return decodedIdToken;
    });
  }

  async function verifyIdToken(
    idToken: string,
    checkRevoked = false
  ): Promise<DecodedIdToken> {
    const isEmulator = useEmulator();
    const idTokenVerifier = createIdTokenVerifier(serviceAccount.projectId);

    const decodedIdToken = await idTokenVerifier.verifyJWT(idToken, isEmulator);

    if (checkRevoked || isEmulator) {
      return verifyDecodedJWTNotRevokedOrDisabled(
        decodedIdToken,
        AuthClientErrorCode.ID_TOKEN_REVOKED
      );
    }
    return decodedIdToken;
  }

  async function verifyAndRefreshExpiredIdToken(
    token: string,
    refreshToken: string
  ): Promise<Tokens | null> {
    try {
      const decodedToken = await verifyIdToken(token);

      return {
        decodedToken,
        token,
      };
    } catch (e: any) {
      // https://firebase.google.com/docs/reference/node/firebase.auth.Error
      switch ((e as FirebaseAuthError).code) {
        case "auth/invalid-user-token":
        case "auth/user-token-expired":
        case "auth/user-disabled":
          return null;

        case "auth/id-token-expired":
        case "auth/argument-error":
          if (refreshToken) {
            return getTokens(refreshToken, apiKey);
          }

          return null;
        default:
          return null;
      }
    }
  }

  function createCustomToken(
    uid: string,
    developerClaims?: object
  ): Promise<string> {
    return tokenGenerator.createCustomToken(uid, developerClaims);
  }

  async function getCustomIdAndRefreshTokens(
    token: string,
    firebaseApiKey: string
  ) {
    const tenant = await verifyIdToken(token);
    const customToken = await createCustomToken(tenant.uid);

    return customTokenToIdAndRefreshTokens(customToken, firebaseApiKey);
  }

  return {
    verifyAndRefreshExpiredIdToken,
    verifyIdToken,
    createCustomToken,
    getCustomIdAndRefreshTokens,
    getTokens,
  };
}
