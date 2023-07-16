import type { Auth, AuthError, AuthProvider, User } from "firebase/auth";
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  useDeviceLanguage,
} from "firebase/auth";

const CREDENTIAL_ALREADY_IN_USE_ERROR = "auth/credential-already-in-use";
export const isCredentialAlreadyInUseError = (e: AuthError) =>
  e?.code === CREDENTIAL_ALREADY_IN_USE_ERROR;

export const logout = async (auth: Auth): Promise<void> => {
  return signOut(auth);
};

export const getGoogleProvider = (auth: Auth) => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  useDeviceLanguage(auth);
  provider.setCustomParameters({
    display: "popup",
  });

  return provider;
};

export const loginWithProvider = async (
  auth: Auth,
  provider: AuthProvider
): Promise<User> => {
  const result = await signInWithPopup(
    auth,
    provider,
    browserPopupRedirectResolver
  );

  return result.user;
};
