export interface Tenant {
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  customClaims: CustomClaims;
}

export type CustomClaims = { [key: string]: any };
