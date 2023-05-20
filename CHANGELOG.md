# next-firebase-auth-edge

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
