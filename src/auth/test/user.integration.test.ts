import {getFirebaseAuth} from '../index';

const {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_AUTH_TENANT_ID
} = process.env;

const TEST_USER_ID = '39d14e52-6e22-4afd-a844-c8aa2e685224';

jest.setTimeout(30000);

describe('user integration test', () => {
  const scenarios = [
    {
      desc: 'single-tenant'
    },
    {
      desc: 'multi-tenant',
      tenantId: FIREBASE_AUTH_TENANT_ID
    }
  ];
  for (const {desc, tenantId} of scenarios) {
    describe(desc, () => {
      const {createUser, getUser, deleteUser, updateUser, listUsers} =
        getFirebaseAuth(
          {
            clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
            privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
            projectId: FIREBASE_PROJECT_ID!
          },
          FIREBASE_API_KEY!,
          tenantId
        );

      beforeEach(async () => {
        try {
          await deleteUser(TEST_USER_ID);
        } catch (e) {}
      });

      it('should create user', async () => {
        await createUser({
          uid: TEST_USER_ID,
          displayName: 'John Doe',
          email: 'user-integration-test@next-firebase-auth-edge.github'
        });

        expect(await getUser(TEST_USER_ID)).toEqual(
          expect.objectContaining({
            displayName: 'John Doe',
            email: 'user-integration-test@next-firebase-auth-edge.github',
            uid: TEST_USER_ID,
            tenantId
          })
        );

        /**
         * Firebase returns list of all users in not defined order
         *
         * @TODO:
         * This test needs to be improved. Currently, Github Actions is using next-firebase-auth-edge-starter Firebase credentials for running tests.
         *
         * 1. Create separate Firebase credentials for local and test environment
         * 2. Cleanup users from Firebase after each integration test
         * 3. Add new test that covers listing of users with and without tenantId
         */
        const listUserResponse = await listUsers();

        expect(listUserResponse.users.length).toBeGreaterThan(0);
        expect(listUserResponse.users[0]).toEqual(
          expect.objectContaining({
            uid: expect.any(String)
          })
        );
      });

      it('should update user', async () => {
        await createUser({
          uid: TEST_USER_ID,
          displayName: 'John Doe',
          email: 'john-doe@next-firebase-auth-edge.github'
        });

        await updateUser(TEST_USER_ID, {
          displayName: 'John Smith',
          email: 'john-smith@next-firebase-auth-edge.github'
        });

        expect(await getUser(TEST_USER_ID)).toEqual(
          expect.objectContaining({
            displayName: 'John Smith',
            email: 'john-smith@next-firebase-auth-edge.github',
            uid: TEST_USER_ID,
            tenantId
          })
        );
      });
    });
  }

  it('should get user by email', async () => {
    const {createUser, getUser, getUserByEmail, deleteUser} = getFirebaseAuth(
      {
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        projectId: FIREBASE_PROJECT_ID!
      },
      FIREBASE_API_KEY!
    );

    try {
      await deleteUser(TEST_USER_ID);
    } catch (e) {}

    await createUser({
      uid: TEST_USER_ID,
      displayName: 'John Doe',
      email: 'john-doe@ensite.in',
      emailVerified: true
    });

    const user = await getUserByEmail('john-doe@ensite.in');

    expect(await getUser(TEST_USER_ID)).toEqual(user);
  });
});
