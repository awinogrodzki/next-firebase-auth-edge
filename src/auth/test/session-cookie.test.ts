import {v4} from 'uuid';
import {customTokenToIdAndRefreshTokens, getFirebaseAuth} from '../index';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_AUTH_TENANT_ID
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
    describe(desc, () => {
      const {createCustomToken, createSessionCookie} = getFirebaseAuth(
        TEST_SERVICE_ACCOUNT,
        FIREBASE_API_KEY!,
        tenantId
      );

      it('should create session cookie', async () => {
        const userId = v4();
        const customToken = await createCustomToken(userId, {
          customClaim: 'customClaimValue'
        });

        const {idToken} = await customTokenToIdAndRefreshTokens(
          customToken,
          FIREBASE_API_KEY!,
          {tenantId, referer: REFERER}
        );
        const cookie = await createSessionCookie(idToken, 60 * 60 * 1000);

        console.log({cookie});
      });
    });
  }
});
