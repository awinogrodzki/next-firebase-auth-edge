import { customTokenToIdAndRefreshTokens, getFirebaseAuth } from '../index';
import { v4 } from 'uuid';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY
} = process.env;

describe('verify token integration test', () => {
  const {
    getTokens,
    createCustomToken,
    verifyAndRefreshExpiredIdToken,
    verifyIdToken,
  } = getFirebaseAuth(
    {
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      projectId: FIREBASE_PROJECT_ID!
    },
    FIREBASE_API_KEY!
  );

  it('should create and verify custom token', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    })

    const {idToken} = await customTokenToIdAndRefreshTokens(customToken, FIREBASE_API_KEY!);
    const tenant = await verifyIdToken(idToken);

    expect(tenant.uid).toEqual(userId);
    expect(tenant.customClaim).toEqual('customClaimValue');
  });

  it('should verify and refresh token', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    })

    const {idToken, refreshToken} = await customTokenToIdAndRefreshTokens(customToken, FIREBASE_API_KEY!);
    const tokens = await verifyAndRefreshExpiredIdToken(idToken, refreshToken);

    expect(tokens?.decodedToken.uid).toEqual(userId);
    expect(tokens?.decodedToken.customClaim).toEqual('customClaimValue');
  });

  it('should checked revoked token', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    })

    const {idToken} = await customTokenToIdAndRefreshTokens(customToken, FIREBASE_API_KEY!);
    const tenant = await verifyIdToken(idToken, true);

    expect(tenant.uid).toEqual(userId);
    expect(tenant.customClaim).toEqual('customClaimValue');
  });

  it('should refresh token', async () => {
    const userId = v4();
    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    })

    const {idToken,refreshToken} = await customTokenToIdAndRefreshTokens(customToken, FIREBASE_API_KEY!);
    const {decodedToken} = await getTokens(refreshToken, FIREBASE_API_KEY!);

    expect(decodedToken.uid).toEqual(userId);
    expect(decodedToken.customClaim).toEqual('customClaimValue');
    expect(decodedToken.token).not.toEqual(idToken)
  });
});
