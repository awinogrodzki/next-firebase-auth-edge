import { getFirebaseAuth } from "../index";

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_AUTH_TENANT_ID,
} = process.env;

const TEST_USER_ID = "39d14e52-6e22-4afd-a844-c8aa2e685224";

describe("user integration test", () => {
  const scenarios = [
    {
      desc: "single-tenant",
    },
    {
      desc: "multi-tenant",
      tenantId: FIREBASE_AUTH_TENANT_ID,
    },
  ];
  for (const { desc, tenantId } of scenarios) {
    describe(desc, () => {
      const { createUser, getUser, deleteUser, updateUser, listUsers } =
        getFirebaseAuth(
          {
            clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
            privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            projectId: FIREBASE_PROJECT_ID!,
          },
          FIREBASE_API_KEY!,
          tenantId
        );

      beforeEach(async () => {
        try {
          await deleteUser(TEST_USER_ID);
        } catch (e) {}
      });

      it("should create user", async () => {
        await createUser({
          uid: TEST_USER_ID,
          displayName: "John Doe",
          email: "user-integration-test@next-firebase-auth-edge.github",
        });

        expect(await getUser(TEST_USER_ID)).toEqual(
          expect.objectContaining({
            displayName: "John Doe",
            email: "user-integration-test@next-firebase-auth-edge.github",
            uid: TEST_USER_ID,
            tenantId,
          })
        );

        expect(await listUsers()).toEqual({
          users: [
            expect.objectContaining({
              displayName: "John Smith",
              email: "john-smith@next-firebase-auth-edge.github",
              uid: TEST_USER_ID,
              tenantId,
            }),
          ],
        });
      });

      it("should update user", async () => {
        await createUser({
          uid: TEST_USER_ID,
          displayName: "John Doe",
          email: "john-doe@next-firebase-auth-edge.github",
        });

        await updateUser(TEST_USER_ID, {
          displayName: "John Smith",
          email: "john-smith@next-firebase-auth-edge.github",
        });

        expect(await getUser(TEST_USER_ID)).toEqual(
          expect.objectContaining({
            displayName: "John Smith",
            email: "john-smith@next-firebase-auth-edge.github",
            uid: TEST_USER_ID,
            tenantId,
          })
        );
      });
    });
  }
});
