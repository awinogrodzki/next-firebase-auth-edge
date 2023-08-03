import { errors } from "jose";

export class FirebaseError extends Error {
  constructor(private errorInfo: ErrorInfo) {
    super(errorInfo.message);
    Object.setPrototypeOf(this, FirebaseError.prototype);
  }

  public get code(): string {
    return this.errorInfo.code;
  }

  public get message(): string {
    return this.errorInfo.message;
  }

  public toJSON(): object {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export interface ErrorInfo {
  code: string;
  message: string;
}

interface ServerToClientCode {
  [code: string]: string;
}

export class PrefixedFirebaseError extends FirebaseError {
  constructor(private prefix: string, code: string, message: string) {
    super({
      code: `${prefix}/${code}`,
      message,
    });
    Object.setPrototypeOf(this, PrefixedFirebaseError.prototype);
  }

  public hasCode(code: string): boolean {
    return `${this.prefix}/${code}` === this.code;
  }
}

export class FirebaseAuthError extends PrefixedFirebaseError {
  public static fromServerError(
    serverErrorCode: string,
    message?: string,
    rawServerResponse?: object
  ): FirebaseAuthError {
    const colonSeparator = (serverErrorCode || "").indexOf(":");
    let customMessage = null;

    if (colonSeparator !== -1) {
      customMessage = serverErrorCode.substring(colonSeparator + 1).trim();
      serverErrorCode = serverErrorCode.substring(0, colonSeparator).trim();
    }

    const clientCodeKey =
      AUTH_SERVER_TO_CLIENT_CODE[serverErrorCode] || "INTERNAL_ERROR";
    const error: ErrorInfo = JSON.parse(
      JSON.stringify(
        AuthClientErrorCode[clientCodeKey as keyof AuthClientErrorCode]
      )
    );
    error.message = customMessage || message || error.message;

    if (
      clientCodeKey === "INTERNAL_ERROR" &&
      typeof rawServerResponse !== "undefined"
    ) {
      try {
        error.message += ` Raw server response: "${JSON.stringify(
          rawServerResponse
        )}"`;
      } catch (e) {
        // Ignore JSON parsing error.
      }
    }

    return new FirebaseAuthError(error);
  }

  constructor(info: ErrorInfo, message?: string) {
    super("auth", info.code, message || info.message);

    Object.setPrototypeOf(this, FirebaseAuthError.prototype);
  }

  public static toAuthErrorWithStack(
    code: ErrorInfo,
    message: string,
    jwtError: errors.JOSEError
  ) {
    const error = new FirebaseAuthError(code, message);

    error.stack = jwtError.stack;
    return error;
  }

  public static fromJOSEError(error: errors.JOSEError): FirebaseAuthError {
    if (error instanceof errors.JWTExpired) {
      const errorMessage = `idToken has expired. Get a fresh token from your client app and try again (auth/${AuthClientErrorCode.ID_TOKEN_EXPIRED}).`;

      return FirebaseAuthError.toAuthErrorWithStack(
        AuthClientErrorCode.ID_TOKEN_EXPIRED,
        errorMessage,
        error
      );
    } else if (error instanceof errors.JWTInvalid) {
      const errorMessage = `idToken is invalid`;

      return FirebaseAuthError.toAuthErrorWithStack(
        AuthClientErrorCode.INVALID_ARGUMENT,
        errorMessage,
        error
      );
    }

    return FirebaseAuthError.toAuthErrorWithStack(
      AuthClientErrorCode.INVALID_ARGUMENT,
      error.message,
      error
    );
  }
}

export class AuthClientErrorCode {
  public static AUTH_BLOCKING_TOKEN_EXPIRED = {
    code: "auth-blocking-token-expired",
    message: "The provided Firebase Auth Blocking token is expired.",
  };
  public static BILLING_NOT_ENABLED = {
    code: "billing-not-enabled",
    message: "Feature requires billing to be enabled.",
  };
  public static CLAIMS_TOO_LARGE = {
    code: "claims-too-large",
    message: "Developer claims maximum payload size exceeded.",
  };
  public static CONFIGURATION_EXISTS = {
    code: "configuration-exists",
    message: "A configuration already exists with the provided identifier.",
  };
  public static CONFIGURATION_NOT_FOUND = {
    code: "configuration-not-found",
    message:
      "There is no configuration corresponding to the provided identifier.",
  };
  public static ID_TOKEN_EXPIRED = {
    code: "id-token-expired",
    message: "The provided Firebase ID token is expired.",
  };
  public static INVALID_ARGUMENT = {
    code: "argument-error",
    message: "Invalid argument provided.",
  };
  public static INVALID_CONFIG = {
    code: "invalid-config",
    message: "The provided configuration is invalid.",
  };
  public static EMAIL_ALREADY_EXISTS = {
    code: "email-already-exists",
    message: "The email address is already in use by another account.",
  };
  public static EMAIL_NOT_FOUND = {
    code: "email-not-found",
    message: "There is no user record corresponding to the provided email.",
  };
  public static FORBIDDEN_CLAIM = {
    code: "reserved-claim",
    message:
      "The specified developer claim is reserved and cannot be specified.",
  };
  public static INVALID_ID_TOKEN = {
    code: "invalid-id-token",
    message: "The provided ID token is not a valid Firebase ID token.",
  };
  public static ID_TOKEN_REVOKED = {
    code: "id-token-revoked",
    message: "The Firebase ID token has been revoked.",
  };
  public static INTERNAL_ERROR = {
    code: "internal-error",
    message: "An internal error has occurred.",
  };
  public static INVALID_CLAIMS = {
    code: "invalid-claims",
    message: "The provided custom claim attributes are invalid.",
  };
  public static INVALID_CONTINUE_URI = {
    code: "invalid-continue-uri",
    message: "The continue URL must be a valid URL string.",
  };
  public static INVALID_CREATION_TIME = {
    code: "invalid-creation-time",
    message: "The creation time must be a valid UTC date string.",
  };
  public static INVALID_CREDENTIAL = {
    code: "invalid-credential",
    message: "Invalid credential object provided.",
  };
  public static INVALID_DISABLED_FIELD = {
    code: "invalid-disabled-field",
    message: "The disabled field must be a boolean.",
  };
  public static INVALID_DISPLAY_NAME = {
    code: "invalid-display-name",
    message: "The displayName field must be a valid string.",
  };
  public static INVALID_DYNAMIC_LINK_DOMAIN = {
    code: "invalid-dynamic-link-domain",
    message:
      "The provided dynamic link domain is not configured or authorized " +
      "for the current project.",
  };
  public static INVALID_EMAIL_VERIFIED = {
    code: "invalid-email-verified",
    message: "The emailVerified field must be a boolean.",
  };
  public static INVALID_EMAIL = {
    code: "invalid-email",
    message: "The email address is improperly formatted.",
  };
  public static INVALID_NEW_EMAIL = {
    code: "invalid-new-email",
    message: "The new email address is improperly formatted.",
  };
  public static INVALID_ENROLLED_FACTORS = {
    code: "invalid-enrolled-factors",
    message:
      "The enrolled factors must be a valid array of MultiFactorInfo objects.",
  };
  public static INVALID_ENROLLMENT_TIME = {
    code: "invalid-enrollment-time",
    message:
      "The second factor enrollment time must be a valid UTC date string.",
  };
  public static INVALID_HASH_ALGORITHM = {
    code: "invalid-hash-algorithm",
    message:
      "The hash algorithm must match one of the strings in the list of " +
      "supported algorithms.",
  };
  public static INVALID_HASH_BLOCK_SIZE = {
    code: "invalid-hash-block-size",
    message: "The hash block size must be a valid number.",
  };
  public static INVALID_HASH_DERIVED_KEY_LENGTH = {
    code: "invalid-hash-derived-key-length",
    message: "The hash derived key length must be a valid number.",
  };
  public static INVALID_HASH_KEY = {
    code: "invalid-hash-key",
    message: "The hash key must a valid byte buffer.",
  };
  public static INVALID_HASH_MEMORY_COST = {
    code: "invalid-hash-memory-cost",
    message: "The hash memory cost must be a valid number.",
  };
  public static INVALID_HASH_PARALLELIZATION = {
    code: "invalid-hash-parallelization",
    message: "The hash parallelization must be a valid number.",
  };
  public static INVALID_HASH_ROUNDS = {
    code: "invalid-hash-rounds",
    message: "The hash rounds must be a valid number.",
  };
  public static INVALID_HASH_SALT_SEPARATOR = {
    code: "invalid-hash-salt-separator",
    message:
      "The hashing algorithm salt separator field must be a valid byte buffer.",
  };
  public static INVALID_LAST_SIGN_IN_TIME = {
    code: "invalid-last-sign-in-time",
    message: "The last sign-in time must be a valid UTC date string.",
  };
  public static INVALID_NAME = {
    code: "invalid-name",
    message: "The resource name provided is invalid.",
  };
  public static INVALID_OAUTH_CLIENT_ID = {
    code: "invalid-oauth-client-id",
    message: "The provided OAuth client ID is invalid.",
  };
  public static INVALID_PAGE_TOKEN = {
    code: "invalid-page-token",
    message: "The page token must be a valid non-empty string.",
  };
  public static INVALID_PASSWORD = {
    code: "invalid-password",
    message: "The password must be a string with at least 6 characters.",
  };
  public static INVALID_PASSWORD_HASH = {
    code: "invalid-password-hash",
    message: "The password hash must be a valid byte buffer.",
  };
  public static INVALID_PASSWORD_SALT = {
    code: "invalid-password-salt",
    message: "The password salt must be a valid byte buffer.",
  };
  public static INVALID_PHONE_NUMBER = {
    code: "invalid-phone-number",
    message:
      "The phone number must be a non-empty E.164 standard compliant identifier " +
      "string.",
  };
  public static INVALID_PHOTO_URL = {
    code: "invalid-photo-url",
    message: "The photoURL field must be a valid URL.",
  };
  public static INVALID_PROJECT_ID = {
    code: "invalid-project-id",
    message:
      "Invalid parent project. Either parent project doesn't exist or didn't enable multi-tenancy.",
  };
  public static INVALID_PROVIDER_DATA = {
    code: "invalid-provider-data",
    message: "The providerData must be a valid array of UserInfo objects.",
  };
  public static INVALID_PROVIDER_ID = {
    code: "invalid-provider-id",
    message:
      "The providerId must be a valid supported provider identifier string.",
  };
  public static INVALID_PROVIDER_UID = {
    code: "invalid-provider-uid",
    message: "The providerUid must be a valid provider uid string.",
  };
  public static INVALID_OAUTH_RESPONSETYPE = {
    code: "invalid-oauth-responsetype",
    message: "Only exactly one OAuth responseType should be set to true.",
  };
  public static INVALID_SESSION_COOKIE_DURATION = {
    code: "invalid-session-cookie-duration",
    message:
      "The session cookie duration must be a valid number in milliseconds " +
      "between 5 minutes and 2 weeks.",
  };
  public static INVALID_TENANT_ID = {
    code: "invalid-tenant-id",
    message: "The tenant ID must be a valid non-empty string.",
  };
  public static INVALID_TENANT_TYPE = {
    code: "invalid-tenant-type",
    message: 'Tenant type must be either "full_service" or "lightweight".',
  };
  public static INVALID_TESTING_PHONE_NUMBER = {
    code: "invalid-testing-phone-number",
    message: "Invalid testing phone number or invalid test code provided.",
  };
  public static INVALID_UID = {
    code: "invalid-uid",
    message: "The uid must be a non-empty string with at most 128 characters.",
  };
  public static INVALID_USER_IMPORT = {
    code: "invalid-user-import",
    message: "The user record to import is invalid.",
  };
  public static INVALID_TOKENS_VALID_AFTER_TIME = {
    code: "invalid-tokens-valid-after-time",
    message: "The tokensValidAfterTime must be a valid UTC number in seconds.",
  };
  public static MISMATCHING_TENANT_ID = {
    code: "mismatching-tenant-id",
    message:
      "User tenant ID does not match with the current TenantAwareAuth tenant ID.",
  };
  public static MISSING_ANDROID_PACKAGE_NAME = {
    code: "missing-android-pkg-name",
    message:
      "An Android Package Name must be provided if the Android App is " +
      "required to be installed.",
  };
  public static MISSING_CONFIG = {
    code: "missing-config",
    message: "The provided configuration is missing required attributes.",
  };
  public static MISSING_CONTINUE_URI = {
    code: "missing-continue-uri",
    message: "A valid continue URL must be provided in the request.",
  };
  public static MISSING_DISPLAY_NAME = {
    code: "missing-display-name",
    message:
      "The resource being created or edited is missing a valid display name.",
  };
  public static MISSING_EMAIL = {
    code: "missing-email",
    message:
      "The email is required for the specified action. For example, a multi-factor user " +
      "requires a verified email.",
  };
  public static MISSING_IOS_BUNDLE_ID = {
    code: "missing-ios-bundle-id",
    message: "The request is missing an iOS Bundle ID.",
  };
  public static MISSING_ISSUER = {
    code: "missing-issuer",
    message: "The OAuth/OIDC configuration issuer must not be empty.",
  };
  public static MISSING_HASH_ALGORITHM = {
    code: "missing-hash-algorithm",
    message:
      "Importing users with password hashes requires that the hashing " +
      "algorithm and its parameters be provided.",
  };
  public static MISSING_OAUTH_CLIENT_ID = {
    code: "missing-oauth-client-id",
    message: "The OAuth/OIDC configuration client ID must not be empty.",
  };
  public static MISSING_OAUTH_CLIENT_SECRET = {
    code: "missing-oauth-client-secret",
    message:
      "The OAuth configuration client secret is required to enable OIDC code flow.",
  };
  public static MISSING_PROVIDER_ID = {
    code: "missing-provider-id",
    message: "A valid provider ID must be provided in the request.",
  };
  public static MISSING_SAML_RELYING_PARTY_CONFIG = {
    code: "missing-saml-relying-party-config",
    message:
      "The SAML configuration provided is missing a relying party configuration.",
  };
  public static MAXIMUM_TEST_PHONE_NUMBER_EXCEEDED = {
    code: "test-phone-number-limit-exceeded",
    message:
      "The maximum allowed number of test phone number / code pairs has been exceeded.",
  };
  public static MAXIMUM_USER_COUNT_EXCEEDED = {
    code: "maximum-user-count-exceeded",
    message: "The maximum allowed number of users to import has been exceeded.",
  };
  public static MISSING_UID = {
    code: "missing-uid",
    message: "A uid identifier is required for the current operation.",
  };
  public static OPERATION_NOT_ALLOWED = {
    code: "operation-not-allowed",
    message:
      "The given sign-in provider is disabled for this Firebase project. " +
      "Enable it in the Firebase console, under the sign-in method tab of the " +
      "Auth section.",
  };
  public static PHONE_NUMBER_ALREADY_EXISTS = {
    code: "phone-number-already-exists",
    message: "The user with the provided phone number already exists.",
  };
  public static PROJECT_NOT_FOUND = {
    code: "project-not-found",
    message: "No Firebase project was found for the provided credential.",
  };
  public static INSUFFICIENT_PERMISSION = {
    code: "insufficient-permission",
    message:
      'Credential implementation provided to initializeApp() via the "credential" property ' +
      "has insufficient permission to access the requested resource. See " +
      "https://firebase.google.com/docs/admin/setup for details on how to authenticate this SDK " +
      "with appropriate permissions.",
  };
  public static QUOTA_EXCEEDED = {
    code: "quota-exceeded",
    message: "The project quota for the specified operation has been exceeded.",
  };
  public static SECOND_FACTOR_LIMIT_EXCEEDED = {
    code: "second-factor-limit-exceeded",
    message:
      "The maximum number of allowed second factors on a user has been exceeded.",
  };
  public static SECOND_FACTOR_UID_ALREADY_EXISTS = {
    code: "second-factor-uid-already-exists",
    message: 'The specified second factor "uid" already exists.',
  };
  public static SESSION_COOKIE_EXPIRED = {
    code: "session-cookie-expired",
    message: "The Firebase session cookie is expired.",
  };
  public static SESSION_COOKIE_REVOKED = {
    code: "session-cookie-revoked",
    message: "The Firebase session cookie has been revoked.",
  };
  public static TENANT_NOT_FOUND = {
    code: "tenant-not-found",
    message: "There is no tenant corresponding to the provided identifier.",
  };
  public static UID_ALREADY_EXISTS = {
    code: "uid-already-exists",
    message: "The user with the provided uid already exists.",
  };
  public static UNAUTHORIZED_DOMAIN = {
    code: "unauthorized-continue-uri",
    message:
      "The domain of the continue URL is not whitelisted. Whitelist the domain in the " +
      "Firebase console.",
  };
  public static UNSUPPORTED_FIRST_FACTOR = {
    code: "unsupported-first-factor",
    message: "A multi-factor user requires a supported first factor.",
  };
  public static UNSUPPORTED_SECOND_FACTOR = {
    code: "unsupported-second-factor",
    message: "The request specified an unsupported type of second factor.",
  };
  public static UNSUPPORTED_TENANT_OPERATION = {
    code: "unsupported-tenant-operation",
    message: "This operation is not supported in a multi-tenant context.",
  };
  public static UNVERIFIED_EMAIL = {
    code: "unverified-email",
    message:
      "A verified email is required for the specified action. For example, a multi-factor user " +
      "requires a verified email.",
  };
  public static USER_NOT_FOUND = {
    code: "user-not-found",
    message:
      "There is no user record corresponding to the provided identifier.",
  };
  public static NOT_FOUND = {
    code: "not-found",
    message: "The requested resource was not found.",
  };
  public static USER_DISABLED = {
    code: "user-disabled",
    message: "The user record is disabled.",
  };
  public static USER_NOT_DISABLED = {
    code: "user-not-disabled",
    message:
      "The user must be disabled in order to bulk delete it (or you must pass force=true).",
  };
}

const AUTH_SERVER_TO_CLIENT_CODE: ServerToClientCode = {
  BILLING_NOT_ENABLED: "BILLING_NOT_ENABLED",
  CLAIMS_TOO_LARGE: "CLAIMS_TOO_LARGE",
  CONFIGURATION_EXISTS: "CONFIGURATION_EXISTS",
  CONFIGURATION_NOT_FOUND: "CONFIGURATION_NOT_FOUND",
  INSUFFICIENT_PERMISSION: "INSUFFICIENT_PERMISSION",
  INVALID_CONFIG: "INVALID_CONFIG",
  INVALID_CONFIG_ID: "INVALID_PROVIDER_ID",
  INVALID_CONTINUE_URI: "INVALID_CONTINUE_URI",
  INVALID_DYNAMIC_LINK_DOMAIN: "INVALID_DYNAMIC_LINK_DOMAIN",
  DUPLICATE_EMAIL: "EMAIL_ALREADY_EXISTS",
  DUPLICATE_LOCAL_ID: "UID_ALREADY_EXISTS",
  DUPLICATE_MFA_ENROLLMENT_ID: "SECOND_FACTOR_UID_ALREADY_EXISTS",
  EMAIL_EXISTS: "EMAIL_ALREADY_EXISTS",
  EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
  FORBIDDEN_CLAIM: "FORBIDDEN_CLAIM",
  INVALID_CLAIMS: "INVALID_CLAIMS",
  INVALID_DURATION: "INVALID_SESSION_COOKIE_DURATION",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_NEW_EMAIL: "INVALID_NEW_EMAIL",
  INVALID_DISPLAY_NAME: "INVALID_DISPLAY_NAME",
  INVALID_ID_TOKEN: "INVALID_ID_TOKEN",
  INVALID_NAME: "INVALID_NAME",
  INVALID_OAUTH_CLIENT_ID: "INVALID_OAUTH_CLIENT_ID",
  INVALID_PAGE_SELECTION: "INVALID_PAGE_TOKEN",
  INVALID_PHONE_NUMBER: "INVALID_PHONE_NUMBER",
  INVALID_PROJECT_ID: "INVALID_PROJECT_ID",
  INVALID_PROVIDER_ID: "INVALID_PROVIDER_ID",
  INVALID_SERVICE_ACCOUNT: "INVALID_SERVICE_ACCOUNT",
  INVALID_TESTING_PHONE_NUMBER: "INVALID_TESTING_PHONE_NUMBER",
  INVALID_TENANT_TYPE: "INVALID_TENANT_TYPE",
  MISSING_ANDROID_PACKAGE_NAME: "MISSING_ANDROID_PACKAGE_NAME",
  MISSING_CONFIG: "MISSING_CONFIG",
  MISSING_CONFIG_ID: "MISSING_PROVIDER_ID",
  MISSING_DISPLAY_NAME: "MISSING_DISPLAY_NAME",
  MISSING_EMAIL: "MISSING_EMAIL",
  MISSING_IOS_BUNDLE_ID: "MISSING_IOS_BUNDLE_ID",
  MISSING_ISSUER: "MISSING_ISSUER",
  MISSING_LOCAL_ID: "MISSING_UID",
  MISSING_OAUTH_CLIENT_ID: "MISSING_OAUTH_CLIENT_ID",
  MISSING_PROVIDER_ID: "MISSING_PROVIDER_ID",
  MISSING_SAML_RELYING_PARTY_CONFIG: "MISSING_SAML_RELYING_PARTY_CONFIG",
  MISSING_USER_ACCOUNT: "MISSING_UID",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  PERMISSION_DENIED: "INSUFFICIENT_PERMISSION",
  PHONE_NUMBER_EXISTS: "PHONE_NUMBER_ALREADY_EXISTS",
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  SECOND_FACTOR_LIMIT_EXCEEDED: "SECOND_FACTOR_LIMIT_EXCEEDED",
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
  TENANT_ID_MISMATCH: "MISMATCHING_TENANT_ID",
  TOKEN_EXPIRED: "ID_TOKEN_EXPIRED",
  UNAUTHORIZED_DOMAIN: "UNAUTHORIZED_DOMAIN",
  UNSUPPORTED_FIRST_FACTOR: "UNSUPPORTED_FIRST_FACTOR",
  UNSUPPORTED_SECOND_FACTOR: "UNSUPPORTED_SECOND_FACTOR",
  UNSUPPORTED_TENANT_OPERATION: "UNSUPPORTED_TENANT_OPERATION",
  UNVERIFIED_EMAIL: "UNVERIFIED_EMAIL",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_DISABLED: "USER_DISABLED",
  WEAK_PASSWORD: "INVALID_PASSWORD",
};
