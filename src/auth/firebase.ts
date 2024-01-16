export const FIREBASE_AUDIENCE =
  'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';
export const CLIENT_CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export function emulatorHost(): string | undefined {
  return process.env.FIREBASE_AUTH_EMULATOR_HOST;
}

export function useEmulator(): boolean {
  return !!emulatorHost();
}
