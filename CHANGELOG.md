# next-firebase-auth-edge

## 0.11.0

### Patch Changes

- Added App Check support

## 0.10.2

### Patch Changes

- Stop displaying middleware verification cache warning on prefetched routes

## 0.10.1

### Patch Changes

- Remove internal verification cookie on middleware request instead throwing an error
- Remove internal verification cookie on middleware request instead of throwing an error

## 0.10.0

### Minor Changes

- Next.js 14 support

## 0.9.5

### Patch Changes

- Skip response headers validation on redirect

## 0.9.4

### Patch Changes

- Add list users function support

## 0.9.3

### Patch Changes

- 964c04c: Check if the FIREBASE_AUTH_EMULATOR_HOST has already http:// added to it, otherwise you will get a cryptic fetch failed error.

## 0.9.2

### Patch Changes

- Support tenantId in refreshAuthCookies

## 0.9.1

### Patch Changes

- Return null if user was deleted from Firebase

## 0.9.0

### Minor Changes

- Added middleware token verification caching

## 0.8.8

### Patch Changes

- Add support for specifying tenantId in middleware

## 0.8.7

### Patch Changes

- Convert signature key to UInt8Array directly instead using base64url.decode due to #92

## 0.8.6

### Patch Changes

- Throw user friendly error on no matching kid in public keys response

## 0.8.5

### Patch Changes

- Revalidate token against all public keys if kid is missing

## 0.8.4

### Patch Changes

- Fix https://github.com/awinogrodzki/next-firebase-auth-edge/issues/90 by validating token against all returned public keys in case of not matching kid header

## 0.8.3

### Patch Changes

- Fix no "kid" claim in idToken error when using emulator

## 0.8.2

### Patch Changes

- Added createUser and updateUser methods

## 0.8.1

### Patch Changes

- Remove 'cache: no-store' header from refreshExpiredIdToken

## 0.8.0

### Minor Changes

- Refactor: remove custom JSON Web Token and Signature implementation in favor of jose

## 0.7.7

### Patch Changes

- Fix Node.js 18.17 native WebCrypto ArrayBuffer compatibility issue

## 0.7.6

### Patch Changes

- Import Next.js request cookie interfaces as type

## 0.7.5

### Patch Changes

- Make caches optional due to Vercel Edge middleware error https://github.com/vercel/next.js/issues/50102

## 0.7.4

### Patch Changes

- Set global cache before using ResponseCache

## 0.7.3

### Patch Changes

- Use polyfill only if runtime is defined

## 0.7.2

### Patch Changes

- Fix "body already used" error by cloning response upon rewriting

## 0.7.1

### Patch Changes

- Added @edge-runtime/primitives to dependencies

## 0.7.0

### Minor Changes

- Updated Next.js to 13.4 with stable app directory. Integrated edge-runtime and removed direct dependency to @peculiar/web-crypto. Integrated ServiceAccountCredential and PublicKeySignatureVerifier with Web APIs CacheStorage.

## 0.6.2

### Patch Changes

- Update engines to support Node 19

## 0.6.1

### Patch Changes

- Fix ReadonlyRequestCookies imports after update to Next.js 13.3.0

## 0.6.0

### Minor Changes

- Added setCustomUserClaims, getUser and refreshAuthCookies Edge-runtime compatible methods

## 0.5.1

### Patch Changes

- Handle refresh token error using handleError function
- Updated dependencies
  - next-firebase-auth-edge@0.5.1

## 0.5.0

### Minor Changes

- Rename methods from getAuthenticatedResponse, getUnauthenticatedResponse and getErrorResponse to more readable handleValidToken, handleInvalidToken and handleError functions

## 0.4.4

### Patch Changes

- Added refreshAuthCookies method to refresh cookie headers in api middleware

## 0.4.3

### Patch Changes

- Introduced getUnauthenticatedResponse middleware option to handle redirects for unauthenticated users

## 0.4.2

### Patch Changes

- getAuthenticatedResponse and getErrorResponse options are now async

## 0.4.1

### Patch Changes

- Optional redirectOptions for use-cases where authentication happens in more than one contexts

## 0.4.0

### Minor Changes

- Added authentication middleware to automatically handle redirection and authentication cookie refresh

## 0.3.1

### Patch Changes

- Re-throw INVALID_CREDENTIALS FirebaseAuthError with error details on token refresh error

## 0.3.0

### Minor Changes

- Updated peer next peer dependency to ^13.1.1 and removed allowMiddlewareResponseBody flag'

## 0.2.15

### Patch Changes

- Handle "USER_NOT_FOUND" error during token refresh

## 0.2.14

### Patch Changes

- Added Firebase Authentication Emulator support

## 0.2.13

### Patch Changes

- Fix incorrect HMAC algorithm key buffer size

## 0.2.12

### Patch Changes

- Update rotating credential HMAC key algorithm to SHA-512

## 0.2.11

### Patch Changes

- Update rotating credential HMAC key algorithm to SHA-256

## 0.2.10

### Patch Changes

- Support Next.js 18 LTS

## 0.2.9

### Patch Changes

- Update Next.js peerDependency version to ^13.0.5 to allow future minor/patch versions

## 0.2.8

### Patch Changes

- Integrated with changesets and eslint to improve transparency and legibility
