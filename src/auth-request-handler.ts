import { emulatorHost, useEmulator } from './firebase';
import { formatString } from './utils';
import { isNonNullObject, isUid } from './validator';
import { AuthClientErrorCode, FirebaseAuthError } from './error';
import { FirebaseAccessToken, getFirebaseAdminTokenProvider, ServiceAccount } from './credential';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
export type ApiCallbackFunction = (data: object) => void;

export class ApiSettings {
  private requestValidator: ApiCallbackFunction;
  private responseValidator: ApiCallbackFunction;

  constructor(private endpoint: string, private httpMethod: HttpMethod = 'POST') {
    this.setRequestValidator(null)
      .setResponseValidator(null);
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
  }

  public setRequestValidator(requestValidator: ApiCallbackFunction | null): ApiSettings {
    const nullFunction: ApiCallbackFunction = () => undefined;
    this.requestValidator = requestValidator || nullFunction;
    return this;
  }

  public getRequestValidator(): ApiCallbackFunction {
    return this.requestValidator;
  }

  public setResponseValidator(responseValidator: ApiCallbackFunction | null): ApiSettings {
    const nullFunction: ApiCallbackFunction = () => undefined;
    this.responseValidator = responseValidator || nullFunction;
    return this;
  }

  public getResponseValidator(): ApiCallbackFunction {
    return this.responseValidator;
  }
}

export function getSdkVersion(): string {
  return '11.2.0';
}


/** Firebase Auth request header. */
const FIREBASE_AUTH_HEADER = {
  'X-Client-Version': `Node/Admin/${getSdkVersion()}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

/** The Firebase Auth backend base URL format. */
const FIREBASE_AUTH_BASE_URL_FORMAT =
  'https://identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}';

/** Firebase Auth base URlLformat when using the auth emultor. */
const FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT =
  'http://{host}/identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}';


class AuthResourceUrlBuilder {

  protected urlFormat: string;

  constructor(protected version: string = 'v1', private projectId: string) {
    if (useEmulator()) {
      this.urlFormat = formatString(FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT, {
        host: emulatorHost()
      });
    } else {
      this.urlFormat = FIREBASE_AUTH_BASE_URL_FORMAT;
    }
  }


  public async getUrl(api?: string, params?: object): Promise<string> {
    const baseParams = {
      version: this.version,
      projectId: this.projectId,
      api: api || '',
    };
    const baseUrl = formatString(this.urlFormat, baseParams);
    return formatString(baseUrl, params || {});
  }
}

interface GetAccountInfoRequest {
  localId?: string[];
  email?: string[];
  phoneNumber?: string[];
  federatedUserId?: Array<{
    providerId: string;
    rawId: string;
  }>;
}

export const FIREBASE_AUTH_GET_ACCOUNT_INFO = new ApiSettings('/accounts:lookup', 'POST')
  .setRequestValidator((request: GetAccountInfoRequest) => {
    if (!request.localId && !request.email && !request.phoneNumber && !request.federatedUserId) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Server request is missing user identifier');
    }
  })
  .setResponseValidator((response: any) => {
    if (!response.users || !response.users.length) {
      throw new FirebaseAuthError(AuthClientErrorCode.USER_NOT_FOUND);
    }
  });

export const FIREBASE_AUTH_GET_ACCOUNTS_INFO = new ApiSettings('/accounts:lookup', 'POST')
  .setRequestValidator((request: GetAccountInfoRequest) => {
    if (!request.localId && !request.email && !request.phoneNumber && !request.federatedUserId) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Server request is missing user identifier');
    }
  });

export abstract class AbstractAuthRequestHandler {
  private authUrlBuilder: AuthResourceUrlBuilder;
  private getToken: (forceRefresh?: boolean) => Promise<FirebaseAccessToken>;

  private static getErrorCode(response: any): string | null {
    return (isNonNullObject(response) && response.error && response.error.message) || null;
  }

  constructor(
    serviceAccount: ServiceAccount
  ) {
    this.getToken = getFirebaseAdminTokenProvider(serviceAccount).getToken;
  }

  public getAccountInfoByUid(uid: string): Promise<object> {
    if (!isUid(uid)) {
      return Promise.reject(new FirebaseAuthError(AuthClientErrorCode.INVALID_UID));
    }

    const request = {
      localId: [uid],
    };
    return this.invokeRequestHandler(this.getAuthUrlBuilder(), FIREBASE_AUTH_GET_ACCOUNT_INFO, request);
  }

  protected async invokeRequestHandler(
    urlBuilder: AuthResourceUrlBuilder, apiSettings: ApiSettings,
    requestData: object | undefined, additionalResourceParams?: object): Promise<object> {
    const url = await urlBuilder.getUrl(apiSettings.getEndpoint(), additionalResourceParams);
    const token = await this.getToken();

    if (requestData) {
      const requestValidator = apiSettings.getRequestValidator();
      requestValidator(requestData);
    }

    const res = await fetch(url, {
      method: apiSettings.getHttpMethod(),
      headers: {
        ...FIREBASE_AUTH_HEADER,
        Authorization: `Bearer ${token.accessToken}`
      },
      body: JSON.stringify(requestData)
    })

    if (!res.ok) {
      const error = await res.json();
      const errorCode = AbstractAuthRequestHandler.getErrorCode(error);
      if (!errorCode) {
        throw new FirebaseAuthError(
          AuthClientErrorCode.INTERNAL_ERROR,
          'Error returned from server: ' + error + '. Additionally, an ' +
          'internal error occurred while attempting to extract the ' +
          'errorcode from the error.',
        );
      }
      throw FirebaseAuthError.fromServerError(errorCode, /* message */ undefined, error);
    }

    const data = await res.json();

    // Validate response.
    const responseValidator = apiSettings.getResponseValidator();
    responseValidator(data);
    // Return entire response.
    return data;
  }

  /**
   * @returns A new Auth user management resource URL builder instance.
   */
  protected abstract newAuthUrlBuilder(): AuthResourceUrlBuilder;

  /**
   * @returns The current Auth user management resource URL builder.
   */
  private getAuthUrlBuilder(): AuthResourceUrlBuilder {
    if (!this.authUrlBuilder) {
      this.authUrlBuilder = this.newAuthUrlBuilder();
    }
    return this.authUrlBuilder;
  }
}


export class AuthRequestHandler extends AbstractAuthRequestHandler {

  protected readonly authResourceUrlBuilder: AuthResourceUrlBuilder;

  constructor(private serviceAccount: ServiceAccount) {
    super(serviceAccount);
    this.authResourceUrlBuilder =  new AuthResourceUrlBuilder('v2', serviceAccount.projectId);
  }

  /**
   * @returns A new Auth user management resource URL builder instance.
   */
  protected newAuthUrlBuilder(): AuthResourceUrlBuilder {
    return new AuthResourceUrlBuilder('v1', this.serviceAccount.projectId);
  }
}
