import {customTokenToIdAndRefreshTokens, getFirebaseAuth} from '../index.js';
import {v4} from 'uuid';
import {AppCheckToken} from '../../app-check/types.js';
import {getAppCheck} from '../../app-check/index.js';

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

describe('create custom token integration test', () => {
  let appCheckToken: AppCheckToken = {token: '', ttlMillis: 0};

  beforeAll(async () => {
    const {createToken} = getAppCheck(TEST_SERVICE_ACCOUNT);

    appCheckToken = await createToken(FIREBASE_APP_ID!);
  });

  const {createCustomToken, getCustomIdAndRefreshTokens, verifyIdToken} =
    getFirebaseAuth(TEST_SERVICE_ACCOUNT, FIREBASE_API_KEY!);

  it('should propagate custom claims when exchanging id tokens', async () => {
    const userId = v4();

    const customToken = await createCustomToken(userId, {
      paswordless_sign_in: true
    });

    const {idToken} = await customTokenToIdAndRefreshTokens(
      customToken,
      FIREBASE_API_KEY!,
      {appCheckToken: appCheckToken.token, referer: REFERER}
    );

    const customIdAndRefreshTokens = await getCustomIdAndRefreshTokens(
      idToken,
      {
        appCheckToken: appCheckToken.token
      }
    );

    const decodedCustomIdToken = await verifyIdToken(
      customIdAndRefreshTokens.idToken,
      {referer: REFERER}
    );

    expect(decodedCustomIdToken.paswordless_sign_in).toBe(true);
  });
});
