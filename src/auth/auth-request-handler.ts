import { emulatorHost, useEmulator } from "./firebase";
import { formatString } from "./utils";
import { isNonNullObject } from "./validator";
import {
  FirebaseAccessToken,
  getFirebaseAdminTokenProvider,
  ServiceAccount,
} from "./credential";
import { AuthError, AuthErrorCode } from "./error";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

export class ApiSettings {
  constructor(
    private endpoint: string,
    private httpMethod: HttpMethod = "POST"
  ) {}

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getHttpMethod(): HttpMethod {
    return this.httpMethod;
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

export const FIREBASE_AUTH_GET_ACCOUNT_INFO = new ApiSettings(
  "/accounts:lookup",
  "POST"
);

export const FIREBASE_AUTH_DELETE_ACCOUNT = new ApiSettings(
  "/accounts:delete",
  "POST"
);

export const FIREBASE_AUTH_SET_ACCOUNT_INFO = new ApiSettings(
  "/accounts:update",
  "POST"
);

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
        throw new AuthError(
          AuthErrorCode.INTERNAL_ERROR,
          `Error returned from server: ${error}.`
        );
      }
      throw new AuthError(
        AuthErrorCode.INTERNAL_ERROR,
        `Error returned from server: ${error}. Code: ${errorCode}`
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
