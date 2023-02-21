import type {
  Auth,
  AuthError,
  AuthProvider,
  OAuthCredential,
} from "firebase/auth";
import { IdTokenResult } from "firebase/auth";
import { User as FirebaseUser } from "@firebase/auth";
import { Tenant } from "../../auth/types";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/tenant";

const CREDENTIAL_ALREADY_IN_USE_ERROR = "auth/credential-already-in-use";
export const isCredentialAlreadyInUseError = (e: AuthError) =>
  e?.code === CREDENTIAL_ALREADY_IN_USE_ERROR;

export const mapFirebaseResponseToTenant = async (
  result: IdTokenResult,
  user: FirebaseUser
): Promise<Tenant> => {
  const providerData = user.providerData && user.providerData[0];
  const tokenResult = await user.getIdTokenResult();

  if (!user.isAnonymous && user.emailVerified && providerData) {
    return {
      id: user.uid,
      name: providerData.displayName || user.displayName || user.email || null,
      email: providerData.email || null,
      isAnonymous: false,
      emailVerified: user.emailVerified,
      customClaims: filterStandardClaims(tokenResult.claims),
      photoUrl: providerData.photoURL || user.photoURL || null,
    };
  }

  return {
    id: user.uid,
    name: user.displayName || providerData?.displayName || user.email || null,
    email: user.email || null,
    isAnonymous: true,
    emailVerified: user.emailVerified,
    photoUrl: user.photoURL || providerData?.photoURL || null,
    customClaims: filterStandardClaims(tokenResult.claims),
  };
};

export const logout = async (auth: Auth): Promise<void> => {
  const { signOut } = await import("firebase/auth");
  return signOut(auth);
};

export const getGoogleProvider = async (auth: Auth) => {
  const { GoogleAuthProvider, useDeviceLanguage } = await import(
    "firebase/auth"
  );

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
  provider: AuthProvider,
  credentialFromError: (error: AuthError) => OAuthCredential | null
): Promise<Tenant> => {
  const user = auth.currentUser;

  if (user?.isAnonymous) {
    try {
      // Link anonymous user with given provider
      const { linkWithPopup, browserPopupRedirectResolver } = await import(
        "firebase/auth"
      );
      const result = await linkWithPopup(
        user,
        provider,
        browserPopupRedirectResolver
      );
      const idTokenResult = await result.user.getIdTokenResult();
      return mapFirebaseResponseToTenant(idTokenResult, result.user!);
    } catch (error: any) {
      // If provider account is already linked with other anonymous user,
      // delete anonymous user, and then login with provider credential
      if (isCredentialAlreadyInUseError(error)) {
        const credential = credentialFromError(error as AuthError);

        await user.delete();

        const { signInWithCredential } = await import("firebase/auth");
        const result = await signInWithCredential(auth, credential!);
        const idTokenResult = await result.user.getIdTokenResult();
        return mapFirebaseResponseToTenant(idTokenResult, result.user!);
      }

      throw error;
    }
  }

  const { signInWithPopup, browserPopupRedirectResolver } = await import(
    "firebase/auth"
  );
  const result = await signInWithPopup(
    auth,
    provider,
    browserPopupRedirectResolver
  );
  const idTokenResult = await result.user.getIdTokenResult();
  return mapFirebaseResponseToTenant(idTokenResult, result.user!);
};
