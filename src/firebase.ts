import { AuthClientErrorCode, ErrorInfo } from './error';


export const FIREBASE_AUDIENCE = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';
export const CLIENT_CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export const ID_TOKEN_INFO: FirebaseTokenInfo = {
  url: 'https://firebase.google.com/docs/auth/admin/verify-id-tokens',
  verifyApiName: 'verifyIdToken()',
  jwtName: 'Firebase ID token',
  shortName: 'ID token',
  expiredErrorCode: AuthClientErrorCode.ID_TOKEN_EXPIRED,
};

export interface FirebaseTokenInfo {
  url: string;
  verifyApiName: string;
  jwtName: string;
  shortName: string;
  expiredErrorCode: ErrorInfo;
}

export function emulatorHost(): string | undefined {
  return process.env.FIREBASE_AUTH_EMULATOR_HOST
}

export function useEmulator(): boolean {
  return !!emulatorHost();
}
