import { useEmulator } from './firebase';
import { createIdTokenVerifier, DecodedIdToken } from './token-verifier';
import { AuthClientErrorCode, ErrorInfo, FirebaseAuthError } from './error';
import { AuthRequestHandler } from './auth-request-handler';
import { ServiceAccount, ServiceAccountCredential } from './credential';
import { UserRecord } from './user-record';
import { createTenant } from './tenant';
import { createFirebaseTokenGenerator } from './token-generator';

const refreshExpiredIdToken = async (refreshToken: string, apiKey: string): Promise<string> => {
  // https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
  const endpoint = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

  const response = await fetch(
    endpoint,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error('Error during refreshing expired token: ' + JSON.stringify(data));
  }

  const data = await response.json();

  return data.id_token;
};


export function getFirebaseAuth(serviceAccount: ServiceAccount, apiKey: string) {
  const authRequestHandler = new AuthRequestHandler(serviceAccount);
  const credential = new ServiceAccountCredential(serviceAccount);
  const tokenGenerator = createFirebaseTokenGenerator(credential);

  const createTenantFromRefreshToken = async (
    refreshToken: string,
    firebaseApiKey: string
  ) => {
    const newToken = await refreshExpiredIdToken(refreshToken, firebaseApiKey);
    const decodedToken = await verifyIdToken(newToken);

    return createTenant({
      decodedToken: decodedToken,
      token: newToken,
    });
  };

  async function getUser(uid: string): Promise<UserRecord> {
    return authRequestHandler.getAccountInfoByUid(uid)
      .then((response: any) => {
        // Returns the user record populated with server response.
        return new UserRecord(response.users[0]);
      });
  }

  async function verifyDecodedJWTNotRevokedOrDisabled(
    decodedIdToken: DecodedIdToken, revocationErrorInfo: ErrorInfo): Promise<DecodedIdToken> {
    // Get tokens valid after time for the corresponding user.
    return getUser(decodedIdToken.sub)
      .then((user: UserRecord) => {
        if (user.disabled) {
          throw new FirebaseAuthError(
            AuthClientErrorCode.USER_DISABLED,
            'The user record is disabled.');
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

  async function verifyIdToken(idToken: string, checkRevoked = false): Promise<DecodedIdToken> {
    const isEmulator = useEmulator();
    const idTokenVerifier = createIdTokenVerifier(serviceAccount.projectId);

    const decodedIdToken = await idTokenVerifier.verifyJWT(idToken, isEmulator)

    if (checkRevoked || isEmulator) {
      return verifyDecodedJWTNotRevokedOrDisabled(
        decodedIdToken,
        AuthClientErrorCode.ID_TOKEN_REVOKED);
    }
    return decodedIdToken;
  }

  async function verifyAndRefreshExpiredIdToken(token: string, refreshToken: string) {
    try {
      const decodedToken = await verifyIdToken(token);

      return createTenant({
        decodedToken,
        token,
      });
    } catch (e) {
      // https://firebase.google.com/docs/reference/node/firebase.auth.Error
      switch (e.code) {
        case 'auth/invalid-user-token':
        case 'auth/user-token-expired':
        case 'auth/user-disabled':
          return createTenant();

        case 'auth/id-token-expired':
        case 'auth/argument-error':
          if (refreshToken) {
            return createTenantFromRefreshToken(refreshToken, apiKey);
          }

          return createTenant();
        default:
          return createTenant();
      }
    }
  }

  function createCustomToken(uid: string, developerClaims?: object): Promise<string> {
    return tokenGenerator.createCustomToken(uid, developerClaims);
  }

  async function getCustomIdAndRefreshTokens(
    token: string,
    firebaseApiKey: string
  ) {
    const tenant = await verifyIdToken(token);
    const customToken = await createCustomToken(tenant.uid);
    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`;
    const refreshTokenResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    });
    const refreshTokenJSON = (await refreshTokenResponse.json()) as DecodedIdToken;
    if (!refreshTokenResponse.ok) {
      throw new Error(`Problem getting a refresh token: ${JSON.stringify(refreshTokenJSON)}`);
    }

    return {
      idToken: refreshTokenJSON.idToken,
      refreshToken: refreshTokenJSON.refreshToken,
    };
  };

  return { verifyAndRefreshExpiredIdToken, verifyIdToken, createCustomToken, getCustomIdAndRefreshTokens }
}
