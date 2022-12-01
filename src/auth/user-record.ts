import { AuthClientErrorCode, FirebaseAuthError } from './error';
import { addReadonlyGetter, deepCopy } from './utils';
import { isNonNullObject } from './validator';
import { stringToBase64 } from './jwt/utils';

const B64_REDACTED = stringToBase64('REDACTED');

function parseDate(time: any): string | null {
  try {
    const date = new Date(parseInt(time, 10));
    if (!isNaN(date.getTime())) {
      return date.toUTCString();
    }
  } catch (e) {
  }
  return null;
}

export interface MultiFactorInfoResponse {
  mfaEnrollmentId: string;
  displayName?: string;
  phoneInfo?: string;
  enrolledAt?: string;
  [key: string]: any;
}

export interface ProviderUserInfoResponse {
  rawId: string;
  displayName?: string;
  email?: string;
  photoUrl?: string;
  phoneNumber?: string;
  providerId: string;
  federatedId?: string;
}

export interface GetAccountInfoUserResponse {
  localId: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  disabled?: boolean;
  passwordHash?: string;
  salt?: string;
  customAttributes?: string;
  validSince?: string;
  tenantId?: string;
  providerUserInfo?: ProviderUserInfoResponse[];
  mfaInfo?: MultiFactorInfoResponse[];
  createdAt?: string;
  lastLoginAt?: string;
  lastRefreshAt?: string;
  [key: string]: any;
}

enum MultiFactorId {
  Phone = 'phone',
}


export abstract class MultiFactorInfo {
  public readonly uid!: string;
  public readonly displayName?: string;
  public readonly factorId!: string;
  public readonly enrollmentTime?: string;
  public static initMultiFactorInfo(response: MultiFactorInfoResponse): MultiFactorInfo | null {
    let multiFactorInfo: MultiFactorInfo | null = null;
    try {
      multiFactorInfo = new PhoneMultiFactorInfo(response);
    } catch (e) {}

    return multiFactorInfo;
  }

  constructor(response: MultiFactorInfoResponse) {
    this.initFromServerResponse(response);
  }

  public toJSON(): object {
    return {
      uid: this.uid,
      displayName: this.displayName,
      factorId: this.factorId,
      enrollmentTime: this.enrollmentTime,
    };
  }

  protected abstract getFactorId(response: MultiFactorInfoResponse): string | null;

  private initFromServerResponse(response: MultiFactorInfoResponse): void {
    const factorId = response && this.getFactorId(response);
    if (!factorId || !response || !response.mfaEnrollmentId) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Invalid multi-factor info response');
    }
    addReadonlyGetter(this, 'uid', response.mfaEnrollmentId);
    addReadonlyGetter(this, 'factorId', factorId);
    addReadonlyGetter(this, 'displayName', response.displayName);
    if (response.enrolledAt) {
      addReadonlyGetter(
        this, 'enrollmentTime', new Date(response.enrolledAt).toUTCString());
    } else {
      addReadonlyGetter(this, 'enrollmentTime', null);
    }
  }
}

export class PhoneMultiFactorInfo extends MultiFactorInfo {
  public readonly phoneNumber!: string;

  constructor(response: MultiFactorInfoResponse) {
    super(response);
    addReadonlyGetter(this, 'phoneNumber', response.phoneInfo);
  }

  public toJSON(): object {
    return Object.assign(
      super.toJSON(),
      {
        phoneNumber: this.phoneNumber,
      });
  }

  protected getFactorId(response: MultiFactorInfoResponse): string | null {
    return (response && response.phoneInfo) ? MultiFactorId.Phone : null;
  }
}

export class MultiFactorSettings {
  public enrolledFactors!: MultiFactorInfo[];

  constructor(response: GetAccountInfoUserResponse) {
    const parsedEnrolledFactors: MultiFactorInfo[] = [];
    if (!isNonNullObject(response)) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Invalid multi-factor response');
    } else if (response.mfaInfo) {
      response.mfaInfo.forEach((factorResponse) => {
        const multiFactorInfo = MultiFactorInfo.initMultiFactorInfo(factorResponse);
        if (multiFactorInfo) {
          parsedEnrolledFactors.push(multiFactorInfo);
        }
      });
    }

    addReadonlyGetter(
      this, 'enrolledFactors', Object.freeze(parsedEnrolledFactors));
  }

  public toJSON(): object {
    return {
      enrolledFactors: this.enrolledFactors.map((info) => info.toJSON()),
    };
  }
}

export class UserMetadata {
  public readonly creationTime!: string;
  public readonly lastSignInTime!: string;
  public readonly lastRefreshTime?: string | null;

  constructor(response: GetAccountInfoUserResponse) {
    addReadonlyGetter(this, 'creationTime', parseDate(response.createdAt));
    addReadonlyGetter(this, 'lastSignInTime', parseDate(response.lastLoginAt));
    const lastRefreshAt = response.lastRefreshAt ? new Date(response.lastRefreshAt).toUTCString() : null;
    addReadonlyGetter(this, 'lastRefreshTime', lastRefreshAt);
  }

  public toJSON(): object {
    return {
      lastSignInTime: this.lastSignInTime,
      creationTime: this.creationTime,
      lastRefreshTime: this.lastRefreshTime,
    };
  }
}

export class UserInfo {

  public readonly uid!: string;
  public readonly displayName!: string;
  public readonly email!: string;
  public readonly photoURL!: string;
  public readonly providerId!: string;
  public readonly phoneNumber!: string;

  constructor(response: ProviderUserInfoResponse) {
    if (!response.rawId || !response.providerId) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Invalid user info response');
    }

    addReadonlyGetter(this, 'uid', response.rawId);
    addReadonlyGetter(this, 'displayName', response.displayName);
    addReadonlyGetter(this, 'email', response.email);
    addReadonlyGetter(this, 'photoURL', response.photoUrl);
    addReadonlyGetter(this, 'providerId', response.providerId);
    addReadonlyGetter(this, 'phoneNumber', response.phoneNumber);
  }

  public toJSON(): object {
    return {
      uid: this.uid,
      displayName: this.displayName,
      email: this.email,
      photoURL: this.photoURL,
      providerId: this.providerId,
      phoneNumber: this.phoneNumber,
    };
  }
}

export class UserRecord {
  public readonly uid!: string;
  public readonly email?: string;
  public readonly emailVerified!: boolean;
  public readonly displayName?: string;
  public readonly photoURL?: string;
  public readonly phoneNumber?: string;
  public readonly disabled!: boolean;
  public readonly metadata!: UserMetadata;
  public readonly providerData!: UserInfo[];
  public readonly passwordHash?: string;
  public readonly passwordSalt?: string;
  public readonly customClaims?: {[key: string]: any};
  public readonly tenantId?: string | null;
  public readonly tokensValidAfterTime?: string;
  public readonly multiFactor?: MultiFactorSettings;

  constructor(response: GetAccountInfoUserResponse) {
    if (!response.localId) {
      throw new FirebaseAuthError(
        AuthClientErrorCode.INTERNAL_ERROR,
        'INTERNAL ASSERT FAILED: Invalid user response');
    }

    addReadonlyGetter(this, 'uid', response.localId);
    addReadonlyGetter(this, 'email', response.email);
    addReadonlyGetter(this, 'emailVerified', !!response.emailVerified);
    addReadonlyGetter(this, 'displayName', response.displayName);
    addReadonlyGetter(this, 'photoURL', response.photoUrl);
    addReadonlyGetter(this, 'phoneNumber', response.phoneNumber);
    addReadonlyGetter(this, 'disabled', response.disabled || false);
    addReadonlyGetter(this, 'metadata', new UserMetadata(response));
    const providerData: UserInfo[] = [];
    for (const entry of (response.providerUserInfo || [])) {
      providerData.push(new UserInfo(entry));
    }
    addReadonlyGetter(this, 'providerData', providerData);

    if (response.passwordHash === B64_REDACTED) {
      addReadonlyGetter(this, 'passwordHash', undefined);
    } else {
      addReadonlyGetter(this, 'passwordHash', response.passwordHash);
    }

    addReadonlyGetter(this, 'passwordSalt', response.salt);
    if (response.customAttributes) {
      addReadonlyGetter(
        this, 'customClaims', JSON.parse(response.customAttributes));
    }

    let validAfterTime: string | null = null;
    if (typeof response.validSince !== 'undefined') {
      validAfterTime = parseDate(parseInt(response.validSince, 10) * 1000);
    }
    addReadonlyGetter(this, 'tokensValidAfterTime', validAfterTime || undefined);
    addReadonlyGetter(this, 'tenantId', response.tenantId);
    const multiFactor = new MultiFactorSettings(response);
    if (multiFactor.enrolledFactors.length > 0) {
      addReadonlyGetter(this, 'multiFactor', multiFactor);
    }
  }

  public toJSON(): object {
    const json: any = {
      uid: this.uid,
      email: this.email,
      emailVerified: this.emailVerified,
      displayName: this.displayName,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      disabled: this.disabled,
      metadata: this.metadata.toJSON(),
      passwordHash: this.passwordHash,
      passwordSalt: this.passwordSalt,
      customClaims: deepCopy(this.customClaims),
      tokensValidAfterTime: this.tokensValidAfterTime,
      tenantId: this.tenantId,
    };
    if (this.multiFactor) {
      json.multiFactor =  this.multiFactor.toJSON();
    }
    json.providerData = [];
    for (const entry of this.providerData) {
      json.providerData.push(entry.toJSON());
    }
    return json;
  }
}
