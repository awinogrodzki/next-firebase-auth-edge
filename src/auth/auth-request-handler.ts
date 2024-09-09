import {
  Credential,
  FirebaseAccessToken,
  getFirebaseAdminTokenProvider
} from './credential';
import {AuthError, AuthErrorCode} from './error';
import {emulatorHost, useEmulator} from './firebase';
import {GetAccountInfoUserResponse} from './user-record';
import {formatString} from './utils';
import {isEmail, isNonNullObject} from './validator';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

export class ApiSettings {
  constructor(
    private endpoint: string,
    private httpMethod: HttpMethod = 'POST'
  ) {}

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
  }
}

export function getSdkVersion(): string {
  return '11.2.0';
}

/** Firebase Auth request header. */
const FIREBASE_AUTH_HEADER = {
  'X-Client-Version': `Node/Admin/${getSdkVersion()}`,
  Accept: 'application/json',
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

  constructor(
    protected version: string = 'v1',
    private credential: Credential
  ) {
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
      projectId: await this.credential.getProjectId(),
      api: api || ''
    };
    const baseUrl = formatString(this.urlFormat, baseParams);
    return formatString(baseUrl, params || {});
  }
}

export const FIREBASE_AUTH_GET_ACCOUNT_INFO = new ApiSettings(
  '/accounts:lookup',
  'POST'
);

export const FIREBASE_AUTH_DELETE_ACCOUNT = new ApiSettings(
  '/accounts:delete',
  'POST'
);

export const FIREBASE_AUTH_SET_ACCOUNT_INFO = new ApiSettings(
  '/accounts:update',
  'POST'
);

export const FIREBASE_AUTH_SIGN_UP_NEW_USER = new ApiSettings(
  '/accounts',
  'POST'
);

export const FIREBASE_AUTH_LIST_USERS_INFO = new ApiSettings(
  '/accounts:batchGet',
  'GET'
);

export type ListUsersResponse = {
  kind: string;
  users: GetAccountInfoUserResponse[];
  nextPageToken: string;
};

export type GetAccountInfoByEmailResponse = {
  users: GetAccountInfoUserResponse[];
};

type ResponseObject = {
  localId: string;
};

export interface AuthRequestHandlerOptions {
  tenantId?: string;
}

export interface ErrorResponse {
  error: Error;
}

export abstract class AbstractAuthRequestHandler {
  private authUrlBuilder: AuthResourceUrlBuilder | undefined;
  private getToken: (forceRefresh?: boolean) => Promise<FirebaseAccessToken>;

  private static getErrorCode(response: unknown): string | null {
    return (
      (isNonNullObject(response) &&
        (response as ErrorResponse).error &&
        (response as ErrorResponse).error.message) ||
      null
    );
  }

  constructor(
    credential: Credential,
    protected options: AuthRequestHandlerOptions = {}
  ) {
    this.getToken = getFirebaseAdminTokenProvider(credential).getToken;
  }

  private prepareRequest(request: object) {
    if (!this.options.tenantId) {
      return request;
    }

    return {
      ...request,
      tenantId: this.options.tenantId
    };
  }

  public getAccountInfoByUid(
    uid: string
  ): Promise<{users?: GetAccountInfoUserResponse[]}> {
    const request = {
      localId: [uid]
    };

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_GET_ACCOUNT_INFO,
      request
    );
  }

  public deleteAccount(uid: string): Promise<ResponseObject> {
    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_DELETE_ACCOUNT,
      {
        localId: uid
      }
    );
  }

  public getAccountInfoByEmail(
    email: string
  ): Promise<GetAccountInfoByEmailResponse> {
    if (!isEmail(email)) {
      return Promise.reject(
        new AuthError(AuthErrorCode.INVALID_ARGUMENT, 'Invalid e-mail address')
      );
    }

    const request = {
      email: [email]
    };

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_GET_ACCOUNT_INFO,
      request
    );
  }

  public createNewAccount(properties: CreateRequest): Promise<string> {
    type SignUpNewUserRequest = CreateRequest & {
      photoUrl?: string | null;
      localId?: string;
      mfaInfo?: AuthFactorInfo[];
    };

    const request: SignUpNewUserRequest = {
      ...properties
    };

    if (typeof request.photoURL !== 'undefined') {
      request.photoUrl = request.photoURL;
      delete request.photoURL;
    }

    if (typeof request.uid !== 'undefined') {
      request.localId = request.uid;
      delete request.uid;
    }
    if (request.multiFactor) {
      if (
        Array.isArray(request.multiFactor.enrolledFactors) &&
        request.multiFactor.enrolledFactors.length > 0
      ) {
        const mfaInfo: AuthFactorInfo[] = [];
        try {
          request.multiFactor.enrolledFactors.forEach((multiFactorInfo) => {
            if ('enrollmentTime' in multiFactorInfo) {
              throw new AuthError(
                AuthErrorCode.INVALID_ARGUMENT,
                '"enrollmentTime" is not supported when adding second factors via "createUser()"'
              );
            } else if ('uid' in multiFactorInfo) {
              throw new AuthError(
                AuthErrorCode.INVALID_ARGUMENT,
                '"uid" is not supported when adding second factors via "createUser()"'
              );
            }
            mfaInfo.push(convertMultiFactorInfoToServerFormat(multiFactorInfo));
          });
        } catch (e) {
          return Promise.reject(e);
        }
        request.mfaInfo = mfaInfo;
      }
      delete request.multiFactor;
    }

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_SIGN_UP_NEW_USER,
      request
    ).then((response) => {
      return response.localId;
    });
  }

  public updateExistingAccount(
    uid: string,
    properties: UpdateRequest
  ): Promise<string> {
    const request: UpdateRequest & {
      deleteAttribute?: string[];
      deleteProvider?: string[];
      linkProviderUserInfo?: UserProvider & {rawId?: string};
      photoUrl?: string | null;
      disableUser?: boolean;
      mfa?: {
        enrollments?: AuthFactorInfo[];
      };
      localId: string;
    } = {
      ...properties,
      deleteAttribute: [],
      localId: uid
    };

    const deletableParams: {[key: string]: string} = {
      displayName: 'DISPLAY_NAME',
      photoURL: 'PHOTO_URL'
    };

    request.deleteAttribute = [];
    for (const key in deletableParams) {
      if (request[key as keyof UpdateRequest] === null) {
        request.deleteAttribute.push(deletableParams[key]);
        delete request[key as keyof UpdateRequest];
      }
    }
    if (request.deleteAttribute.length === 0) {
      delete request.deleteAttribute;
    }

    if (request.phoneNumber === null) {
      if (request.deleteProvider) {
        request.deleteProvider.push('phone');
      } else {
        request.deleteProvider = ['phone'];
      }

      delete request.phoneNumber;
    }

    if (typeof request.providerToLink !== 'undefined') {
      request.linkProviderUserInfo = {...request.providerToLink};
      delete request.providerToLink;

      request.linkProviderUserInfo.rawId = request.linkProviderUserInfo.uid;
      delete request.linkProviderUserInfo.uid;
    }

    if (typeof request.providersToUnlink !== 'undefined') {
      if (!Array.isArray(request.deleteProvider)) {
        request.deleteProvider = [];
      }
      request.deleteProvider = request.deleteProvider.concat(
        request.providersToUnlink
      );
      delete request.providersToUnlink;
    }

    if (typeof request.photoURL !== 'undefined') {
      request.photoUrl = request.photoURL;
      delete request.photoURL;
    }

    if (typeof request.disabled !== 'undefined') {
      request.disableUser = request.disabled;
      delete request.disabled;
    }

    if (request.multiFactor) {
      if (request.multiFactor.enrolledFactors === null) {
        request.mfa = {};
      } else if (Array.isArray(request.multiFactor.enrolledFactors)) {
        request.mfa = {
          enrollments: []
        };
        try {
          request.multiFactor.enrolledFactors.forEach(
            (multiFactorInfo: UpdateMultiFactorInfoRequest) => {
              request.mfa!.enrollments!.push(
                convertMultiFactorInfoToServerFormat(multiFactorInfo)
              );
            }
          );
        } catch (e) {
          return Promise.reject(e);
        }
        if (request.mfa!.enrollments!.length === 0) {
          delete request.mfa.enrollments;
        }
      }
      delete request.multiFactor;
    }

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_SET_ACCOUNT_INFO,
      request
    ).then((response) => {
      return response.localId;
    });
  }

  public setCustomUserClaims(
    uid: string,
    customUserClaims: object | null
  ): Promise<string> {
    if (customUserClaims === null) {
      customUserClaims = {};
    }

    const request = {
      localId: uid,
      customAttributes: JSON.stringify(customUserClaims)
    };

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_SET_ACCOUNT_INFO,
      request
    ).then((response) => {
      return response.localId;
    });
  }

  public listUsers(nextPageToken?: string, maxResults?: number) {
    const request = {
      nextPageToken,
      maxResults
    };

    return this.invokeRequestHandler<ListUsersResponse>(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_LIST_USERS_INFO,
      request
    );
  }

  private getSearchParams(requestData: object) {
    const searchParams = new URLSearchParams();

    for (const key in requestData) {
      if (!requestData[key as keyof object]) {
        continue;
      }

      searchParams.append(key, requestData[key as keyof object]);
    }

    return searchParams;
  }

  private decorateUrlWithParams(url: string, requestData: object) {
    const params = this.getSearchParams(requestData);
    const paramsString = params.toString();

    if (!paramsString) {
      return url;
    }

    return `${url}?${paramsString}`;
  }

  protected async invokeRequestHandler<T = ResponseObject>(
    urlBuilder: AuthResourceUrlBuilder,
    apiSettings: ApiSettings,
    requestData: object | undefined,
    additionalResourceParams?: object
  ): Promise<T> {
    let url = await urlBuilder.getUrl(
      apiSettings.getEndpoint(),
      additionalResourceParams
    );
    const token = await this.getToken();
    const init: RequestInit = {
      method: apiSettings.getHttpMethod(),
      headers: {
        ...FIREBASE_AUTH_HEADER,
        Authorization: `Bearer ${token.accessToken}`
      }
    };

    if (requestData && !['GET', 'HEAD'].includes(apiSettings.getHttpMethod())) {
      init.body = JSON.stringify(this.prepareRequest(requestData));
    }

    if (requestData && ['GET', 'HEAD'].includes(apiSettings.getHttpMethod())) {
      url = this.decorateUrlWithParams(url, this.prepareRequest(requestData));
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      const error = await res.json();
      const errorCode = AbstractAuthRequestHandler.getErrorCode(error);
      if (!errorCode) {
        throw new AuthError(
          AuthErrorCode.INTERNAL_ERROR,
          `Error returned from server: ${JSON.stringify(error)}.`
        );
      }
      throw new AuthError(
        AuthErrorCode.INTERNAL_ERROR,
        `Error returned from server: ${JSON.stringify(
          error
        )}. Code: ${errorCode}`
      );
    }

    return await res.json();
  }

  protected abstract newAuthUrlBuilder(): AuthResourceUrlBuilder;

  private getAuthUrlBuilder(): AuthResourceUrlBuilder {
    if (!this.authUrlBuilder) {
      this.authUrlBuilder = this.newAuthUrlBuilder();
    }
    return this.authUrlBuilder;
  }
}

export class AuthRequestHandler extends AbstractAuthRequestHandler {
  protected readonly authResourceUrlBuilder: AuthResourceUrlBuilder;

  constructor(
    private credential: Credential,
    options?: AuthRequestHandlerOptions
  ) {
    super(credential, options);
    this.authResourceUrlBuilder = new AuthResourceUrlBuilder('v2', credential);
  }

  protected newAuthUrlBuilder(): AuthResourceUrlBuilder {
    return new AuthResourceUrlBuilder('v1', this.credential);
  }
}

function isPhoneFactor(
  multiFactorInfo: UpdateMultiFactorInfoRequest
): multiFactorInfo is UpdatePhoneMultiFactorInfoRequest {
  return multiFactorInfo.factorId === 'phone';
}

function isUTCDateString(dateString: string): boolean {
  try {
    return (
      Boolean(dateString) && new Date(dateString).toUTCString() === dateString
    );
  } catch {
    return false;
  }
}

export function convertMultiFactorInfoToServerFormat(
  multiFactorInfo: UpdateMultiFactorInfoRequest
): AuthFactorInfo {
  let enrolledAt;
  if (typeof multiFactorInfo.enrollmentTime !== 'undefined') {
    if (isUTCDateString(multiFactorInfo.enrollmentTime)) {
      enrolledAt = new Date(multiFactorInfo.enrollmentTime).toISOString();
    } else {
      throw new AuthError(
        AuthErrorCode.INVALID_ARGUMENT,
        `The second factor "enrollmentTime" for "${multiFactorInfo.uid}" must be a valid ` +
          'UTC date string.'
      );
    }
  }
  if (isPhoneFactor(multiFactorInfo)) {
    const authFactorInfo: AuthFactorInfo = {
      mfaEnrollmentId: multiFactorInfo.uid,
      displayName: multiFactorInfo.displayName,
      phoneInfo: multiFactorInfo.phoneNumber,
      enrolledAt
    };
    for (const objKey in authFactorInfo) {
      if (typeof authFactorInfo[objKey] === 'undefined') {
        delete authFactorInfo[objKey];
      }
    }
    return authFactorInfo;
  } else {
    throw new AuthError(
      AuthErrorCode.INVALID_ARGUMENT,
      `Unsupported second factor "${JSON.stringify(multiFactorInfo)}" provided.`
    );
  }
}

export interface AuthFactorInfo {
  mfaEnrollmentId?: string;
  displayName?: string;
  phoneInfo?: string;
  enrolledAt?: string;
  [key: string]: unknown;
}

export interface BaseUpdateMultiFactorInfoRequest {
  uid?: string;
  displayName?: string;
  enrollmentTime?: string;
  factorId: string;
}

export interface UpdatePhoneMultiFactorInfoRequest
  extends BaseUpdateMultiFactorInfoRequest {
  phoneNumber: string;
}

export type UpdateMultiFactorInfoRequest = UpdatePhoneMultiFactorInfoRequest;

export interface MultiFactorUpdateSettings {
  enrolledFactors: UpdateMultiFactorInfoRequest[] | null;
}

export interface UpdateRequest {
  disabled?: boolean;
  displayName?: string | null;
  email?: string;
  emailVerified?: boolean;
  password?: string;
  phoneNumber?: string | null;
  photoURL?: string | null;
  multiFactor?: MultiFactorUpdateSettings;
  providerToLink?: UserProvider;
  providersToUnlink?: string[];
  tenantId?: string;
}

export interface UserProvider {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  providerId?: string;
}

export interface BaseCreateMultiFactorInfoRequest {
  displayName?: string;
  factorId: string;
}

export interface CreatePhoneMultiFactorInfoRequest
  extends BaseCreateMultiFactorInfoRequest {
  phoneNumber: string;
}

export type CreateMultiFactorInfoRequest = CreatePhoneMultiFactorInfoRequest;

export interface MultiFactorCreateSettings {
  enrolledFactors: CreateMultiFactorInfoRequest[];
}

export interface CreateRequest extends UpdateRequest {
  uid?: string;
  multiFactor?: MultiFactorCreateSettings;
}
