import {v4} from 'uuid';
import {CLIENT_CERT_URL} from '../firebase';
import {customTokenToIdAndRefreshTokens, getFirebaseAuth} from '../index';
import {InvalidTokenError, InvalidTokenReason} from '../error';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY
} = process.env;

const TEST_SERVICE_ACCOUNT = {
  clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  projectId: FIREBASE_PROJECT_ID!
};

const REFERER = 'http://localhost:3000';

describe('no matching kid integration test', () => {
  const {createCustomToken, verifyAndRefreshExpiredIdToken} = getFirebaseAuth(
    TEST_SERVICE_ACCOUNT,
    FIREBASE_API_KEY!
  );

  beforeEach(() => {
    let numberOfCalls = 0;

    const actualFetch = global.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.fetch = jest.fn((url: URL, ...args: any[]) => {
      if (url?.href === CLIENT_CERT_URL && !numberOfCalls) {
        numberOfCalls++;
        return {
          ok: true,
          headers: {
            forEach: () => {},
            has: () => false
          },
          json: () => Promise.resolve({})
        };
      }

      return actualFetch(url, ...args);
    }) as jest.Mock;
  });

  it('should throw invalid token error if kid header does not match public keys', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    });

    const {idToken, refreshToken} = await customTokenToIdAndRefreshTokens(
      customToken,
      FIREBASE_API_KEY!,
      {referer: REFERER}
    );

    return expect(() =>
      verifyAndRefreshExpiredIdToken(
        {idToken, refreshToken, customToken},
        {
          referer: REFERER
        }
      )
    ).rejects.toEqual(new InvalidTokenError(InvalidTokenReason.INVALID_KID));
  });

  it('should refresh the token if kid header does not match public keys and experimental flag is provided', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    });

    const {idToken, refreshToken} = await customTokenToIdAndRefreshTokens(
      customToken,
      FIREBASE_API_KEY!,
      {referer: REFERER}
    );

    const onTokenRefresh = jest.fn();

    const result = await verifyAndRefreshExpiredIdToken(
      {idToken, refreshToken, customToken},
      {
        referer: REFERER,
        experimental_enableTokenRefreshOnExpiredKidHeader: true,
        onTokenRefresh
      }
    );

    expect(onTokenRefresh).toHaveBeenCalledWith(result);
  });
});
