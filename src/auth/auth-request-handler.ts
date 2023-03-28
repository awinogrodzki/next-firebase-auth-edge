import { emulatorHost, useEmulator } from "./firebase";
import { formatString } from "./utils";
import {
  isArray,
  isEmail,
  isISODateString,
  isNonEmptyString,
  isNonNullObject,
  isNumber,
  isObject,
  isPassword,
  isPhoneNumber,
  isString,
  isUid,
  isURL,
} from "./validator";
import { AuthClientErrorCode, FirebaseAuthError } from "./error";
import {
  FirebaseAccessToken,
  getFirebaseAdminTokenProvider,
  ServiceAccount,
} from "./credential";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
export type ApiCallbackFunction = (data: object) => void;

export class ApiSettings {
  private requestValidator: ApiCallbackFunction | undefined;
  private responseValidator: ApiCallbackFunction | undefined;

  constructor(
    private endpoint: string,
    private httpMethod: HttpMethod = "POST"
  ) {
    this.setRequestValidator(null).setResponseValidator(null);
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
  }

  public setRequestValidator(
    requestValidator: ApiCallbackFunction | null
  ): ApiSettings {
    const nullFunction: ApiCallbackFunction = () => undefined;
    this.requestValidator = requestValidator || nullFunction;
    return this;
  }

  public getRequestValidator(): ApiCallbackFunction {
    return this.requestValidator!;
  }

  public setResponseValidator(
    responseValidator: ApiCallbackFunction | null
  ): ApiSettings {
    const nullFunction: ApiCallbackFunction = () => undefined;
    this.responseValidator = responseValidator || nullFunction;
    return this;
  }

  public getResponseValidator(): ApiCallbackFunction {
    return this.responseValidator!;
  }
}

export function getSdkVersion(): string {
  return "11.2.0";
}

/** Firebase Auth request header. */
const FIREBASE_AUTH_HEADER = {
  "X-Client-Version": `Node/Admin/${getSdkVersion()}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** The Firebase Auth backend base URL format. */
const FIREBASE_AUTH_BASE_URL_FORMAT =
  "https://identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}";

/** Firebase Auth base URlLformat when using the auth emultor. */
const FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT =
  "http://{host}/identitytoolkit.googleapis.com/{version}/projects/{projectId}{api}";

class AuthResourceUrlBuilder {
  protected urlFormat: string;

  constructor(protected version: string = "v1", private projectId: string) {
    if (useEmulator()) {
      this.urlFormat = formatString(FIREBASE_AUTH_EMULATOR_BASE_URL_FORMAT, {
        host: emulatorHost(),
      });
    } else {
      this.urlFormat = FIREBASE_AUTH_BASE_URL_FORMAT;
    }
  }

  public async getUrl(api?: string, params?: object): Promise<string> {
    const baseParams = {
      version: this.version,
      projectId: this.projectId,
      api: api || "",
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

export const FIREBASE_AUTH_GET_ACCOUNT_INFO = new ApiSettings(
  "/accounts:lookup",
  "POST"
)
  .setRequestValidator((request: GetAccountInfoRequest) => {
    if (
      !request.localId &&
      !request.email &&
      !request.phoneNumber &&
      !request.federatedUserId
    ) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        "INTERNAL ASSERT FAILED: Server request is missing user identifier"
      );
    }
  })
  .setResponseValidator((response: any) => {
    if (!response.users || !response.users.length) {
      throw new FirebaseAuthError(AuthClientErrorCode.USER_NOT_FOUND);
    }
  });

export const FIREBASE_AUTH_DELETE_ACCOUNT = new ApiSettings(
  "/accounts:delete",
  "POST"
).setRequestValidator((request: any) => {
  if (!request.localId) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INTERNAL_ERROR,
      "INTERNAL ASSERT FAILED: Server request is missing user identifier"
    );
  }
});

enum WriteOperationType {
  Create = "create",
  Update = "update",
  Upload = "upload",
}

export interface AuthFactorInfo {
  // Not required for signupNewUser endpoint.
  mfaEnrollmentId?: string;
  displayName?: string;
  phoneInfo?: string;
  enrolledAt?: string;
  [key: string]: any;
}

const MAX_CLAIMS_PAYLOAD_SIZE = 1000;
export const RESERVED_CLAIMS = [
  "acr",
  "amr",
  "at_hash",
  "aud",
  "auth_time",
  "azp",
  "cnf",
  "c_hash",
  "exp",
  "iat",
  "iss",
  "jti",
  "nbf",
  "nonce",
  "sub",
  "firebase",
];

function validateProviderUserInfo(request: any): void {
  const validKeys = {
    rawId: true,
    providerId: true,
    email: true,
    displayName: true,
    photoUrl: true,
  };
  for (const key in request) {
    if (!(key in validKeys)) {
      delete request[key];
    }
  }

  if (!isNonEmptyString(request.providerId)) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PROVIDER_ID);
  }

  if (
    typeof request.displayName !== "undefined" &&
    typeof request.displayName !== "string"
  ) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_DISPLAY_NAME,
      `The provider "displayName" for "${request.providerId}" must be a valid string.`
    );
  }

  if (!isNonEmptyString(request.rawId)) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_UID,
      `The provider "uid" for "${request.providerId}" must be a valid non-empty string.`
    );
  }

  if (typeof request.email !== "undefined" && !isEmail(request.email)) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_EMAIL,
      `The provider "email" for "${request.providerId}" must be a valid email string.`
    );
  }

  if (typeof request.photoUrl !== "undefined" && !isURL(request.photoUrl)) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_PHOTO_URL,
      `The provider "photoURL" for "${request.providerId}" must be a valid URL string.`
    );
  }
}

function validateAuthFactorInfo(request: AuthFactorInfo): void {
  const validKeys = {
    mfaEnrollmentId: true,
    displayName: true,
    phoneInfo: true,
    enrolledAt: true,
  };

  for (const key in request) {
    if (!(key in validKeys)) {
      delete request[key];
    }
  }

  const authFactorInfoIdentifier =
    request.mfaEnrollmentId || request.phoneInfo || JSON.stringify(request);

  if (
    typeof request.mfaEnrollmentId !== "undefined" &&
    !isNonEmptyString(request.mfaEnrollmentId)
  ) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_UID,
      'The second factor "uid" must be a valid non-empty string.'
    );
  }
  if (
    typeof request.displayName !== "undefined" &&
    !isString(request.displayName)
  ) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_DISPLAY_NAME,
      `The second factor "displayName" for "${authFactorInfoIdentifier}" must be a valid string.`
    );
  }

  if (
    typeof request.enrolledAt !== "undefined" &&
    !isISODateString(request.enrolledAt)
  ) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_ENROLLMENT_TIME,
      `The second factor "enrollmentTime" for "${authFactorInfoIdentifier}" must be a valid ` +
        "UTC date string."
    );
  }

  if (typeof request.phoneInfo !== "undefined") {
    if (!isPhoneNumber(request.phoneInfo)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_PHONE_NUMBER,
        `The second factor "phoneNumber" for "${authFactorInfoIdentifier}" must be a non-empty ` +
          "E.164 standard compliant identifier string."
      );
    }
  } else {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_ENROLLED_FACTORS,
      "MFAInfo object provided is invalid."
    );
  }
}

function validateCreateEditRequest(
  request: any,
  writeOperationType: WriteOperationType
): void {
  const uploadAccountRequest = writeOperationType === WriteOperationType.Upload;

  const validKeys = {
    displayName: true,
    localId: true,
    email: true,
    password: true,
    rawPassword: true,
    emailVerified: true,
    photoUrl: true,
    disabled: true,
    disableUser: true,
    deleteAttribute: true,
    deleteProvider: true,
    sanityCheck: true,
    phoneNumber: true,
    customAttributes: true,
    validSince: true,
    linkProviderUserInfo: !uploadAccountRequest,
    tenantId: uploadAccountRequest,
    passwordHash: uploadAccountRequest,
    salt: uploadAccountRequest,
    createdAt: uploadAccountRequest,
    lastLoginAt: uploadAccountRequest,
    providerUserInfo: uploadAccountRequest,
    mfaInfo: uploadAccountRequest,
    mfa: !uploadAccountRequest,
  };

  for (const key in request) {
    if (!(key in validKeys)) {
      delete request[key];
    }
  }

  if (
    typeof request.tenantId !== "undefined" &&
    !isNonEmptyString(request.tenantId)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_TENANT_ID);
  }

  if (
    typeof request.displayName !== "undefined" &&
    !isString(request.displayName)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_DISPLAY_NAME);
  }

  if (
    (typeof request.localId !== "undefined" || uploadAccountRequest) &&
    !isUid(request.localId)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_UID);
  }

  if (typeof request.email !== "undefined" && !isEmail(request.email)) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_EMAIL);
  }

  if (
    typeof request.phoneNumber !== "undefined" &&
    !isPhoneNumber(request.phoneNumber)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PHONE_NUMBER);
  }

  if (
    typeof request.password !== "undefined" &&
    !isPassword(request.password)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PASSWORD);
  }

  if (
    typeof request.rawPassword !== "undefined" &&
    !isPassword(request.rawPassword)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PASSWORD);
  }

  if (
    typeof request.emailVerified !== "undefined" &&
    typeof request.emailVerified !== "boolean"
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_EMAIL_VERIFIED);
  }

  if (typeof request.photoUrl !== "undefined" && !isURL(request.photoUrl)) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PHOTO_URL);
  }

  if (
    typeof request.disabled !== "undefined" &&
    typeof request.disabled !== "boolean"
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_DISABLED_FIELD);
  }

  if (
    typeof request.validSince !== "undefined" &&
    !isNumber(request.validSince)
  ) {
    throw new FirebaseAuthError(
      AuthClientErrorCode.INVALID_TOKENS_VALID_AFTER_TIME
    );
  }

  if (
    typeof request.createdAt !== "undefined" &&
    !isNumber(request.createdAt)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_CREATION_TIME);
  }

  if (
    typeof request.lastLoginAt !== "undefined" &&
    !isNumber(request.lastLoginAt)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_LAST_SIGN_IN_TIME);
  }

  if (
    typeof request.disableUser !== "undefined" &&
    typeof request.disableUser !== "boolean"
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_DISABLED_FIELD);
  }

  if (typeof request.customAttributes !== "undefined") {
    let developerClaims: object;
    try {
      developerClaims = JSON.parse(request.customAttributes);
    } catch (error: unknown) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_CLAIMS,
        (error as Error).message
      );
    }

    const invalidClaims: string[] = [];
    RESERVED_CLAIMS.forEach((blacklistedClaim) => {
      if (
        Object.prototype.hasOwnProperty.call(developerClaims, blacklistedClaim)
      ) {
        invalidClaims.push(blacklistedClaim);
      }
    });

    if (invalidClaims.length > 0) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.FORBIDDEN_CLAIM,
        invalidClaims.length > 1
          ? `Developer claims "${invalidClaims.join(
              '", "'
            )}" are reserved and cannot be specified.`
          : `Developer claim "${invalidClaims[0]}" is reserved and cannot be specified.`
      );
    }

    if (request.customAttributes.length > MAX_CLAIMS_PAYLOAD_SIZE) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.CLAIMS_TOO_LARGE,
        `Developer claims payload should not exceed ${MAX_CLAIMS_PAYLOAD_SIZE} characters.`
      );
    }
  }

  if (
    typeof request.passwordHash !== "undefined" &&
    !isString(request.passwordHash)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PASSWORD_HASH);
  }

  if (typeof request.salt !== "undefined" && !isString(request.salt)) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PASSWORD_SALT);
  }

  if (
    typeof request.providerUserInfo !== "undefined" &&
    !isArray(request.providerUserInfo)
  ) {
    throw new FirebaseAuthError(AuthClientErrorCode.INVALID_PROVIDER_DATA);
  } else if (isArray(request.providerUserInfo)) {
    request.providerUserInfo.forEach((providerUserInfoEntry: any) => {
      validateProviderUserInfo(providerUserInfoEntry);
    });
  }

  if (typeof request.linkProviderUserInfo !== "undefined") {
    validateProviderUserInfo(request.linkProviderUserInfo);
  }

  let enrollments: AuthFactorInfo[] | null = null;
  if (request.mfaInfo) {
    enrollments = request.mfaInfo;
  } else if (request.mfa && request.mfa.enrollments) {
    enrollments = request.mfa.enrollments;
  }
  if (enrollments) {
    if (!isArray(enrollments)) {
      throw new FirebaseAuthError(AuthClientErrorCode.INVALID_ENROLLED_FACTORS);
    }
    enrollments.forEach((authFactorInfoEntry: AuthFactorInfo) => {
      validateAuthFactorInfo(authFactorInfoEntry);
    });
  }
}

export const FIREBASE_AUTH_SET_ACCOUNT_INFO = new ApiSettings(
  "/accounts:update",
  "POST"
)
  .setRequestValidator((request: any) => {
    if (typeof request.localId === "undefined") {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        "INTERNAL ASSERT FAILED: Server request is missing user identifier"
      );
    }
    if (typeof request.tenantId !== "undefined") {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INVALID_ARGUMENT,
        '"tenantId" is an invalid "UpdateRequest" property.'
      );
    }
    validateCreateEditRequest(request, WriteOperationType.Update);
  })
  .setResponseValidator((response: any) => {
    if (!response.localId) {
      throw new FirebaseAuthError(AuthClientErrorCode.USER_NOT_FOUND);
    }
  });

export abstract class AbstractAuthRequestHandler {
  private authUrlBuilder: AuthResourceUrlBuilder | undefined;
  private getToken: (forceRefresh?: boolean) => Promise<FirebaseAccessToken>;

  private static getErrorCode(response: any): string | null {
    return (
      (isNonNullObject(response) && response.error && response.error.message) ||
      null
    );
  }

  constructor(serviceAccount: ServiceAccount) {
    this.getToken = getFirebaseAdminTokenProvider(serviceAccount).getToken;
  }

  public getAccountInfoByUid(uid: string): Promise<object> {
    if (!isUid(uid)) {
      return Promise.reject(
        new FirebaseAuthError(AuthClientErrorCode.INVALID_UID)
      );
    }

    const request = {
      localId: [uid],
    };
    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_GET_ACCOUNT_INFO,
      request
    );
  }

  public deleteAccount(uid: string): Promise<object> {
    if (!isUid(uid)) {
      return Promise.reject(
        new FirebaseAuthError(AuthClientErrorCode.INVALID_UID)
      );
    }

    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_DELETE_ACCOUNT,
      {
        localId: uid,
      }
    );
  }

  public setCustomUserClaims(
    uid: string,
    customUserClaims: object | null
  ): Promise<string> {
    if (!isUid(uid)) {
      return Promise.reject(
        new FirebaseAuthError(AuthClientErrorCode.INVALID_UID)
      );
    } else if (!isObject(customUserClaims)) {
      return Promise.reject(
        new FirebaseAuthError(
          AuthClientErrorCode.INVALID_ARGUMENT,
          "CustomUserClaims argument must be an object or null."
        )
      );
    }

    if (customUserClaims === null) {
      customUserClaims = {};
    }

    const request: any = {
      localId: uid,
      customAttributes: JSON.stringify(customUserClaims),
    };
    return this.invokeRequestHandler(
      this.getAuthUrlBuilder(),
      FIREBASE_AUTH_SET_ACCOUNT_INFO,
      request
    ).then((response: any) => {
      return response.localId as string;
    });
  }

  protected async invokeRequestHandler(
    urlBuilder: AuthResourceUrlBuilder,
    apiSettings: ApiSettings,
    requestData: object | undefined,
    additionalResourceParams?: object
  ): Promise<object> {
    const url = await urlBuilder.getUrl(
      apiSettings.getEndpoint(),
      additionalResourceParams
    );
    const token = await this.getToken();

    if (requestData) {
      const requestValidator = apiSettings.getRequestValidator();
      requestValidator(requestData);
    }

    const res = await fetch(url, {
      method: apiSettings.getHttpMethod(),
      headers: {
        ...FIREBASE_AUTH_HEADER,
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!res.ok) {
      const error = await res.json();
      const errorCode = AbstractAuthRequestHandler.getErrorCode(error);
      if (!errorCode) {
        throw new FirebaseAuthError(
          AuthClientErrorCode.INTERNAL_ERROR,
          "Error returned from server: " +
            error +
            ". Additionally, an " +
            "internal error occurred while attempting to extract the " +
            "errorcode from the error."
        );
      }
      throw FirebaseAuthError.fromServerError(errorCode, undefined, error);
    }

    const data = await res.json();

    const responseValidator = apiSettings.getResponseValidator();
    responseValidator(data);
    return data;
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

  constructor(private serviceAccount: ServiceAccount) {
    super(serviceAccount);
    this.authResourceUrlBuilder = new AuthResourceUrlBuilder(
      "v2",
      serviceAccount.projectId
    );
  }

  protected newAuthUrlBuilder(): AuthResourceUrlBuilder {
    return new AuthResourceUrlBuilder("v1", this.serviceAccount.projectId);
  }
}
