import { getAppCheck } from "../index";
import { FirebaseAppCheckError } from "../api-client";

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_AUTH_TENANT_ID,
  FIREBASE_APP_ID,
} = process.env;

const TEST_SERVICE_ACCOUNT = {
  clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
  privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  projectId: FIREBASE_PROJECT_ID!,
};

describe("app check integration test", () => {
  const scenarios = [
    {
      desc: "single-tenant",
      tenantID: undefined,
    },
    {
      desc: "multi-tenant",
      tenantId: FIREBASE_AUTH_TENANT_ID,
    },
  ];
  for (const { desc, tenantId } of scenarios) {
    describe(desc, () => {
      const { createToken, verifyToken } = getAppCheck(
        TEST_SERVICE_ACCOUNT,
        tenantId
      );

      it("should create and verify app check token", async () => {
        const { token } = await createToken(FIREBASE_APP_ID!);

        await verifyToken(token);
      });

      it("should throw app check expired error if token is expired", async () => {
        const { token } = await createToken(FIREBASE_APP_ID!);

        return expect(() =>
          verifyToken(token, {
            currentDate: new Date(Date.now() + 7200 * 1000),
          })
        ).rejects.toEqual(
          new FirebaseAppCheckError(
            "app-check-token-expired",
            "The provided App Check token has expired. Get a fresh App Check token from your client app and try again."
          )
        );
      });
    });
  }
});
