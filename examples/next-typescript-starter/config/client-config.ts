export const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  // Optional – required if your app uses AppCheck – https://firebase.google.com/docs/app-check
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // Optional – required if your app uses Multi-Tenancy – https://cloud.google.com/identity-platform/docs/multi-tenancy-authentication
  tenantId: process.env.NEXT_PUBLIC_FIREBASE_AUTH_TENANT_ID
};
