import {decodeJwt} from 'jose';
import type {Credential, FirebaseAccessToken} from './credential.js';
import {getFirebaseAuth} from './index.js';

const SERVICE_ACCOUNT_EMAIL =
  'workload-identity@test-project.iam.gserviceaccount.com';
const ACCESS_TOKEN = 'CUSTOM_CREDENTIAL_ACCESS_TOKEN';
const SIGN_BLOB_URL = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT_EMAIL}:signBlob`;

class CustomCredential implements Credential {
  public getProjectId(): Promise<string> {
    return Promise.resolve('test-project');
  }

  public getServiceAccountEmail(): Promise<string | null> {
    return Promise.resolve(SERVICE_ACCOUNT_EMAIL);
  }

  public getAccessToken(): Promise<FirebaseAccessToken> {
    return Promise.resolve({
      accessToken: ACCESS_TOKEN,
      expirationTime: Date.now() + 60 * 60 * 1000
    });
  }
}

describe('getFirebaseAuth', () => {
  const actualFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(
      async () => new Response(JSON.stringify({signedBlob: 'MOCK_SIGNATURE'}))
    );
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    global.fetch = actualFetch;
  });

  it('signs custom tokens remotely with a provided custom credential', async () => {
    const {createCustomToken} = getFirebaseAuth({
      credential: new CustomCredential(),
      serviceAccountId: SERVICE_ACCOUNT_EMAIL,
      apiKey: 'API_KEY'
    });

    const customToken = await createCustomToken('test-uid');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe(SIGN_BLOB_URL);
    expect(init.headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);

    const payload = decodeJwt(customToken);

    expect(payload.uid).toBe('test-uid');
    expect(payload.iss).toBe(SERVICE_ACCOUNT_EMAIL);
    expect(payload.sub).toBe(SERVICE_ACCOUNT_EMAIL);
  });

  it('resolves the signing service account from the credential when serviceAccountId is not provided', async () => {
    const {createCustomToken} = getFirebaseAuth({
      credential: new CustomCredential(),
      apiKey: 'API_KEY'
    });

    const customToken = await createCustomToken('test-uid');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(SIGN_BLOB_URL);

    const payload = decodeJwt(customToken);

    expect(payload.iss).toBe(SERVICE_ACCOUNT_EMAIL);
  });

  it('prefers the provided credential over the service account', async () => {
    const getAccessToken = jest.spyOn(
      CustomCredential.prototype,
      'getAccessToken'
    );
    const {createCustomToken} = getFirebaseAuth({
      credential: new CustomCredential(),
      serviceAccount: {
        projectId: 'test-project',
        clientEmail: 'service-account@test-project.iam.gserviceaccount.com',
        privateKey: 'INVALID_PRIVATE_KEY'
      },
      apiKey: 'API_KEY'
    });

    await createCustomToken('test-uid');

    expect(getAccessToken).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toBe(SIGN_BLOB_URL);
  });
});
