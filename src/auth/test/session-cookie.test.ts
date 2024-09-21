import {v4} from 'uuid';
import {getAppCheck} from '../../app-check';
import {AppCheckToken} from '../../app-check/types';
import {customTokenToIdAndRefreshTokens, getFirebaseAuth} from '../index';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_AUTH_TENANT_ID,
  FIREBASE_APP_ID
} = process.env;

const TEST_SERVICE_ACCOUNT = {
  clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  projectId: FIREBASE_PROJECT_ID!
};

const REFERER = 'http://localhost:3000';

describe('session cookie integration test', () => {
  const scenarios = [
    {
      desc: 'single-tenant',
      tenantID: undefined
    },
    {
      desc: 'multi-tenant',
      tenantId: FIREBASE_AUTH_TENANT_ID
    }
  ];
  for (const {desc, tenantId} of scenarios) {
    let appCheckToken: AppCheckToken = {token: '', ttlMillis: 0};

    beforeAll(async () => {
      const {createToken} = getAppCheck(TEST_SERVICE_ACCOUNT, tenantId);

      appCheckToken = await createToken(FIREBASE_APP_ID!);
    });

    describe(desc, () => {
      const {createCustomToken, verifyIdToken} = getFirebaseAuth(
        TEST_SERVICE_ACCOUNT,
        FIREBASE_API_KEY!,
        tenantId
      );

      it('should create and verify custom token', async () => {
        const userId = v4();
        const customToken = await createCustomToken(userId, {
          customClaim: 'customClaimValue'
        });

        const {idToken} = await customTokenToIdAndRefreshTokens(
          customToken,
          FIREBASE_API_KEY!,
          {tenantId, appCheckToken: appCheckToken.token, referer: REFERER}
        );
        const tenant = await verifyIdToken(idToken, {
          referer: REFERER
        });

        expect(tenant.uid).toEqual(userId);
        expect(tenant.customClaim).toEqual('customClaimValue');
        expect(tenant.firebase.tenant).toEqual(tenantId);
      });
    });
  }
});
