import {customTokenToIdAndRefreshTokens, getFirebaseAuth} from '../index.js';
import {v4} from 'uuid';
import {AppCheckToken} from '../../app-check/types.js';
import {getAppCheck} from '../../app-check.js';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_APP_ID
} = process.env;

const TEST_SERVICE_ACCOUNT = {
  clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  projectId: FIREBASE_PROJECT_ID!
};

const REFERER = 'http://localhost:3000';

describe('set custom user claims integration test', () => {
  let appCheckToken: AppCheckToken = {token: '', ttlMillis: 0};

  beforeAll(async () => {
    const {createToken} = getAppCheck(TEST_SERVICE_ACCOUNT);

    appCheckToken = await createToken(FIREBASE_APP_ID!);
  });

  const {createCustomToken, getUser, setCustomUserClaims, verifyIdToken} =
    getFirebaseAuth(TEST_SERVICE_ACCOUNT, FIREBASE_API_KEY!);

  it('should create custom user claims', async () => {
    const userId = v4();

    const customToken = await createCustomToken(userId, {
      customClaim: 'customClaimValue'
    });

    const {idToken} = await customTokenToIdAndRefreshTokens(
      customToken,
      FIREBASE_API_KEY!,
      {appCheckToken: appCheckToken.token, referer: REFERER}
    );

    await verifyIdToken(idToken, {referer: REFERER});

    await setCustomUserClaims(userId, {
      newCustomClaim: 'newCustomClaimValue'
    });

    const user = await getUser(userId);
    expect(user?.uid).toEqual(userId);
    expect(user?.customClaims).toEqual({
      newCustomClaim: 'newCustomClaimValue'
    });
  });
});
