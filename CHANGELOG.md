## [1.9.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0...v1.9.1) (2025-02-18)


### Bug Fixes

* **dynamic-custom-claims:** allow to update claims after token refresh ([475e767](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/475e76709ece48294746b334522c0c16dbc5ce6d))

# [1.9.0](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2...v1.9.0) (2025-02-18)


### Bug Fixes

* **#297:** propagate custom claims when exchanging id token for custom, id and refresh tokens ([55254b8](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/55254b87196c9fb7f16c36785131b34edd3b219e)), closes [#297](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/297)
* **#303:** support npm 11 ([88328e5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/88328e51abfebf2eef63895b37d91784a0e982ce)), closes [#303](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/303)
* **#306:** support Node.js 23 ([f27d210](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f27d21023b8f0120fd7ddfd17e9c9d42b2a28f31)), closes [#306](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/306)
* return cached token or server token ([c1a04a9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c1a04a96f12aea574aa5c44b2d41a053bf746f6c))
* return cached valid token ([a73f9ec](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a73f9ecd04860c72613664c3ab857fe4efd46954))


### Features

* **#300:** added removeServerCookies method to logout from Server Actions ([cab2d23](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/cab2d238012ed7fb20cdbb09da7e69eab3867c14)), closes [#300](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/300)
* full firebase emulator support ([9dcf5e9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9dcf5e94be548b0f3bb0277bee6abce43592a7d2))

# [1.9.0-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0-canary.5...v1.9.0-canary.6) (2025-01-28)


### Bug Fixes

* **#306:** support Node.js 23 ([f27d210](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f27d21023b8f0120fd7ddfd17e9c9d42b2a28f31)), closes [#306](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/306)

# [1.9.0-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0-canary.4...v1.9.0-canary.5) (2025-01-23)


### Bug Fixes

* **#303:** support npm 11 ([88328e5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/88328e51abfebf2eef63895b37d91784a0e982ce)), closes [#303](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/303)

# [1.9.0-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0-canary.3...v1.9.0-canary.4) (2025-01-22)


### Features

* **#300:** added removeServerCookies method to logout from Server Actions ([cab2d23](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/cab2d238012ed7fb20cdbb09da7e69eab3867c14)), closes [#300](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/300)

# [1.9.0-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0-canary.2...v1.9.0-canary.3) (2025-01-21)


### Bug Fixes

* **#297:** propagate custom claims when exchanging id token for custom, id and refresh tokens ([55254b8](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/55254b87196c9fb7f16c36785131b34edd3b219e)), closes [#297](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/297)

# [1.9.0-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.9.0-canary.1...v1.9.0-canary.2) (2024-12-16)


### Bug Fixes

* return cached token or server token ([c1a04a9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c1a04a96f12aea574aa5c44b2d41a053bf746f6c))
* return cached valid token ([a73f9ec](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a73f9ecd04860c72613664c3ab857fe4efd46954))

# [1.9.0-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2...v1.9.0-canary.1) (2024-11-15)


### Features

* full firebase emulator support ([9dcf5e9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9dcf5e94be548b0f3bb0277bee6abce43592a7d2))

## [1.8.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.1...v1.8.2) (2024-11-07)


### Bug Fixes

* **docs:** added `await` before calling `cookies` and `headers` due to change in Next.js 15 ([d14c9df](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d14c9df55aa3476ea30d56b884599f4e8af9e3ff))
* add logs to invalid token comparator func ([11eaede](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/11eaedee236b4cf93f5b2542ae10eebbe0c86884))
* added additional logs around cookie parser ([1550c80](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1550c80e504e7e49ff44a89dd20c59c2878b6dbc))
* added additional logs to debug a failed verification in auth middleware ([30ddc5e](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/30ddc5e6f4cb7c7d713cc210d77648d8722d924c))
* await on parse cookie result to work around [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271) ([f6b5106](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f6b51062b4308e32d1ef1d123912d21dc93d3f85))
* debug Vercel logging by removing inheritance from Error ([46ca356](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/46ca35632f46d92dc4f0229552c09e4f455fee58))
* export error module explicitly ([575281c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/575281c45e037eccdf48c833ae605cd373388896))
* remove console.log and improve debug logs around token fetching ([31dfbd2](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/31dfbd2226dcd775bd4a76cdb4a5c5f04f72954e))
* remove debug logs from cookie parser ([2ce3190](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2ce3190cbffa476fd228f6cc1bf578cae6c8591f))
* remove unnecessary async in get tokens functions ([c0f530c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c0f530c3ecfe9c0e120f20d4a9e3bcab264a28db))
* work around [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271) in getCookiesTokens ([5fef799](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5fef799648daa2a0fcf20829dd82b443b9f511e7))
* **#271:** use runtime flag to identify invalid token error ([d7220b0](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d7220b0e1dd642385d3320efd812b2e08117e51e)), closes [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271)

## [1.8.2-canary.11](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.10...v1.8.2-canary.11) (2024-11-07)


### Bug Fixes

* **docs:** added `await` before calling `cookies` and `headers` due to change in Next.js 15 ([d14c9df](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d14c9df55aa3476ea30d56b884599f4e8af9e3ff))

## [1.8.2-canary.10](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.9...v1.8.2-canary.10) (2024-11-06)


### Bug Fixes

* remove unnecessary async in get tokens functions ([c0f530c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c0f530c3ecfe9c0e120f20d4a9e3bcab264a28db))
* work around [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271) in getCookiesTokens ([5fef799](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5fef799648daa2a0fcf20829dd82b443b9f511e7))

## [1.8.2-canary.9](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.8...v1.8.2-canary.9) (2024-11-06)


### Bug Fixes

* await on parse cookie result to work around [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271) ([f6b5106](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f6b51062b4308e32d1ef1d123912d21dc93d3f85))

## [1.8.2-canary.8](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.7...v1.8.2-canary.8) (2024-11-06)


### Bug Fixes

* remove debug logs from cookie parser ([2ce3190](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2ce3190cbffa476fd228f6cc1bf578cae6c8591f))

## [1.8.2-canary.7](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.6...v1.8.2-canary.7) (2024-11-06)


### Bug Fixes

* added additional logs around cookie parser ([1550c80](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1550c80e504e7e49ff44a89dd20c59c2878b6dbc))

## [1.8.2-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.5...v1.8.2-canary.6) (2024-11-06)


### Bug Fixes

* debug Vercel logging by removing inheritance from Error ([46ca356](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/46ca35632f46d92dc4f0229552c09e4f455fee58))

## [1.8.2-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.4...v1.8.2-canary.5) (2024-11-06)


### Bug Fixes

* remove console.log and improve debug logs around token fetching ([31dfbd2](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/31dfbd2226dcd775bd4a76cdb4a5c5f04f72954e))

## [1.8.2-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.3...v1.8.2-canary.4) (2024-11-06)


### Bug Fixes

* add logs to invalid token comparator func ([11eaede](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/11eaedee236b4cf93f5b2542ae10eebbe0c86884))

## [1.8.2-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.2...v1.8.2-canary.3) (2024-11-06)


### Bug Fixes

* **#271:** use runtime flag to identify invalid token error ([d7220b0](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d7220b0e1dd642385d3320efd812b2e08117e51e)), closes [#271](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/271)

## [1.8.2-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.2-canary.1...v1.8.2-canary.2) (2024-11-06)


### Bug Fixes

* export error module explicitly ([575281c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/575281c45e037eccdf48c833ae605cd373388896))

## [1.8.2-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.1...v1.8.2-canary.1) (2024-11-06)


### Bug Fixes

* added additional logs to debug a failed verification in auth middleware ([30ddc5e](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/30ddc5e6f4cb7c7d713cc210d77648d8722d924c))

## [1.8.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0...v1.8.1) (2024-11-05)


### Bug Fixes

* update cookie library to avoid vulnerability in cookie < 0.7.0 ([0940e28](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/0940e2875a3f8d0b9769317914df074d70caa741))

# [1.8.0](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.1...v1.8.0) (2024-10-28)


### Bug Fixes

* added circular import validation ([deaa2e3](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/deaa2e393b4e7630090d0dce96ed9e7e6b7fa8e0))
* automated release build cache ([b6abf5a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b6abf5aea77efdfb3827b18864fe0d08c8a2f7e6))
* create request cookies provider from cloned headers ([d17c376](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d17c3762807ccba180116612c0463dec4357b0e9))
* include missing directories in package.json exports ([668ae8b](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/668ae8bc4dc55b05623de71e97a2faf1eb417928))
* remove declarations from esm build ([025e4c8](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/025e4c8a501201618df4fb77a6532d22aed9ddaf))


### Features

* make custom token optional ([4a18cb7](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/4a18cb7ed6aca3e8e72819437939fae1bc9eeffc))
* refactor cookies to separate multiple from single type ([9aba786](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9aba786f04ab20c8e57e1daeacab670d59c770f0))
* support esm, commonjs and browser build targets ([93a17bd](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/93a17bde917817d7191cfaf5bce4f17a836c454b))
* validate tenantId when verifying id token ([798d0f1](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/798d0f1037b387a691284b22f6a092dfbfd0d156))

# [1.8.0-canary.9](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.8...v1.8.0-canary.9) (2024-10-09)


### Features

* make custom token optional ([4a18cb7](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/4a18cb7ed6aca3e8e72819437939fae1bc9eeffc))

# [1.8.0-canary.8](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.7...v1.8.0-canary.8) (2024-09-30)


### Bug Fixes

* create request cookies provider from cloned headers ([d17c376](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d17c3762807ccba180116612c0463dec4357b0e9))

# [1.8.0-canary.7](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.6...v1.8.0-canary.7) (2024-09-30)


### Bug Fixes

* added circular import validation ([deaa2e3](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/deaa2e393b4e7630090d0dce96ed9e7e6b7fa8e0))

# [1.8.0-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.5...v1.8.0-canary.6) (2024-09-29)


### Features

* refactor cookies to separate multiple from single type ([9aba786](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9aba786f04ab20c8e57e1daeacab670d59c770f0))

# [1.8.0-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.4...v1.8.0-canary.5) (2024-09-22)


### Bug Fixes

* include missing directories in package.json exports ([668ae8b](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/668ae8bc4dc55b05623de71e97a2faf1eb417928))

# [1.8.0-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.3...v1.8.0-canary.4) (2024-09-22)


### Bug Fixes

* automated release build cache ([b6abf5a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b6abf5aea77efdfb3827b18864fe0d08c8a2f7e6))

# [1.8.0-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.2...v1.8.0-canary.3) (2024-09-22)


### Bug Fixes

* remove declarations from esm build ([025e4c8](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/025e4c8a501201618df4fb77a6532d22aed9ddaf))

# [1.8.0-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.8.0-canary.1...v1.8.0-canary.2) (2024-09-22)


### Features

* support esm, commonjs and browser build targets ([93a17bd](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/93a17bde917817d7191cfaf5bce4f17a836c454b))

# [1.8.0-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.1...v1.8.0-canary.1) (2024-09-21)


### Features

* validate tenantId when verifying id token ([798d0f1](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/798d0f1037b387a691284b22f6a092dfbfd0d156))

## [1.7.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0...v1.7.1) (2024-09-13)


### Bug Fixes

* handle switch from multiple to single cookie ([9b18bd5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9b18bd58ed0b765c19727d8aaf8f1f45299623d0))

# [1.7.0](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.2...v1.7.0) (2024-09-09)


### Bug Fixes

* add debug logs for experimental feature ([41ef1df](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/41ef1dfcf6fe23a7dabfa4e8d3cc5e2c1172b31e))
* **#242:** use TextEncoder when mapping token to UInt8Array ([23b04dc](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/23b04dcd8867fd7c6b108c41496cb19930e5cc16)), closes [#242](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/242)
* **#246:** re-throw invalid PKCS8 error as AuthError with user-friendly message ([a7d7a22](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a7d7a228733e67525b001cff70a523880d858e01)), closes [#246](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/246)
* **#249:** merge error stack trace in token verifier to improve visibility on fetch errors ([6bce756](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6bce7564216dff60fe736ef85e8508d2df686eaf)), closes [#249](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/249)
* add missing name property to decoded id token type ([39b086d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/39b086db222f619a8b4cf0365895f33c6832e3fc))
* pass cookie serialization options to cookie setter ([b28ce7a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b28ce7a866318f958e58b14e4adfcc85a47e5bef))
* recreate canary tags after force push ([c9b7c18](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c9b7c18e5cb4f8a31e5388e0bfd23665e8b5674e))
* semantic-release rate exceeded error ([676b602](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/676b6021a013c0afdddd75a0cea71b2a8b4786e2))
* semantic-version git history issue ([d514f57](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d514f5713883e1713f265b07a4670518af646a6b))
* update next.js peer dependency to rc ([f2953fd](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f2953fd38bdd6df9b4b535a21abb47793249752b))


### Features

* **middleware:** introduced `redirectToPath` method and RegExp support in `redirectToLogin` method ([21024bb](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/21024bb02f6f0300301e7822751e047caef745c0))
* added `path` option to `redirectToHome` helper function ([54f07f4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/54f07f4a09fad3e46fc089e5d762afa4df5eb1f5))
* allow setAuthCookies to accept custom auth headers or fall back ([b1d169b](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b1d169b13d1c6132799aed23ef1c6da3698ba080))
* experimental option to refresh token on expired kid header ([2869531](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/28695315164fffee7b3a08879e95033c44b8a197))
* introduced `refreshCookiesWithIdToken` function to enable login using Server Actions ([#212](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/212)) ([6cd0b13](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6cd0b138036ff0f4fcfa91d786fca5255cfa2654))
* next.js 15 rc support ([a994dd0](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a994dd07bce5420049573b2651b08ecb1a82b63c))
* pass custom auth header from authMiddleware ([71286af](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/71286afe6c7faebf2cdcd568e507a5e0739720f0))
* **getTokens:** introduced optional `cookieSerializeOptions` option ([e041542](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/e041542c6b2f4380fcc7f803f7e1c8d5c14bc6e1))
* replaced no matching kid auth error with invalid token error ([9d2d0fc](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9d2d0fcb49374d0bb6b260c43d8a2409377b0144))
* support Node.js 22 ([6c7f435](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6c7f435485391a4d987f0bc3d0653536d4ef93ff))

# [1.7.0-canary.17](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.16...v1.7.0-canary.17) (2024-09-07)


### Features

* **middleware:** introduced `redirectToPath` method and RegExp support in `redirectToLogin` method ([21024bb](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/21024bb02f6f0300301e7822751e047caef745c0))

# [1.7.0-canary.16](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.15...v1.7.0-canary.16) (2024-09-06)


### Features

* allow setAuthCookies to accept custom auth headers or fall back ([b1d169b](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b1d169b13d1c6132799aed23ef1c6da3698ba080))
* pass custom auth header from authMiddleware ([71286af](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/71286afe6c7faebf2cdcd568e507a5e0739720f0))

# [1.7.0-canary.15](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.14...v1.7.0-canary.15) (2024-09-06)


### Bug Fixes

* add debug logs for experimental feature ([41ef1df](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/41ef1dfcf6fe23a7dabfa4e8d3cc5e2c1172b31e))

# [1.7.0-canary.14](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.13...v1.7.0-canary.14) (2024-09-06)


### Features

* experimental option to refresh token on expired kid header ([2869531](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/28695315164fffee7b3a08879e95033c44b8a197))

# [1.7.0-canary.13](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.12...v1.7.0-canary.13) (2024-09-03)


### Bug Fixes

* **#249:** merge error stack trace in token verifier to improve visibility on fetch errors ([6bce756](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6bce7564216dff60fe736ef85e8508d2df686eaf)), closes [#249](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/249)

# [1.7.0-canary.12](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.11...v1.7.0-canary.12) (2024-09-03)


### Bug Fixes

* **#242:** use TextEncoder when mapping token to UInt8Array ([23b04dc](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/23b04dcd8867fd7c6b108c41496cb19930e5cc16)), closes [#242](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/242)

# [1.7.0-canary.11](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.10...v1.7.0-canary.11) (2024-08-30)


### Bug Fixes

* **#246:** re-throw invalid PKCS8 error as AuthError with user-friendly message ([a7d7a22](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a7d7a228733e67525b001cff70a523880d858e01)), closes [#246](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/246)

# [1.7.0-canary.10](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.9...v1.7.0-canary.10) (2024-08-22)


### Features

* **getTokens:** introduced optional `cookieSerializeOptions` option ([e041542](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/e041542c6b2f4380fcc7f803f7e1c8d5c14bc6e1))

# [1.7.0-canary.9](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.8...v1.7.0-canary.9) (2024-08-21)


### Bug Fixes

* pass cookie serialization options to cookie setter ([b28ce7a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/b28ce7a866318f958e58b14e4adfcc85a47e5bef))

# [1.7.0-canary.8](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.7...v1.7.0-canary.8) (2024-08-21)


### Features

* replaced no matching kid auth error with invalid token error ([9d2d0fc](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9d2d0fcb49374d0bb6b260c43d8a2409377b0144))

# [1.7.0-canary.7](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.6...v1.7.0-canary.7) (2024-08-21)


### Features

* support Node.js 22 ([6c7f435](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6c7f435485391a4d987f0bc3d0653536d4ef93ff))

# [1.7.0-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.5...v1.7.0-canary.6) (2024-08-10)


### Bug Fixes

* semantic-release rate exceeded error ([676b602](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/676b6021a013c0afdddd75a0cea71b2a8b4786e2))

# [1.7.0-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.4...v1.7.0-canary.5) (2024-08-10)


### Bug Fixes

* update next.js peer dependency to rc ([f2953fd](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f2953fd38bdd6df9b4b535a21abb47793249752b))

# [1.7.0-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.3...v1.7.0-canary.4) (2024-08-10)


### Bug Fixes

* add missing name property to decoded id token type ([39b086d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/39b086db222f619a8b4cf0365895f33c6832e3fc))


### Features

* next.js 15 rc support ([a994dd0](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/a994dd07bce5420049573b2651b08ecb1a82b63c))

# [1.7.0-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.7.0-canary.2...v1.7.0-canary.3) (2024-08-08)


### Bug Fixes

* recreate canary tags after force push ([c9b7c18](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c9b7c18e5cb4f8a31e5388e0bfd23665e8b5674e))
* semantic-version git history issue ([d514f57](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d514f5713883e1713f265b07a4670518af646a6b))

# [1.7.0-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.2...v1.7.0-canary.2) (2024-07-25)


### Features

* added `path` option to `redirectToHome` helper function ([54f07f4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/54f07f4a09fad3e46fc089e5d762afa4df5eb1f5))


# [1.7.0-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.1...v1.7.0-canary.1) (2024-07-16)


### Features

* introduced `refreshCookiesWithIdToken` function to enable login using Server Actions ([#212](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/212)) ([fd6b193](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/fd6b193d345af85e7cca502640b98e2c93aebadc))

## [1.6.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.1...v1.6.2) (2024-07-16)


### Bug Fixes

* fix `JWSInvalid: Invalid Compact JWS` error when migrating between token formats ([#214](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/214)) ([5b6b0c3](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5b6b0c3c0eeb62e1f28c7e48c73ad93bee3c0bbc))

## [1.6.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0...v1.6.1) (2024-07-15)


### Bug Fixes

* rename appendEmptyResponseHeaders to removeCookies ([498d044](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/498d0443b7981776cc7091049ac83a92a4d8d81b))

# [1.6.0](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.3...v1.6.0) (2024-07-15)


### Bug Fixes

* enable refresh token route ([d081c22](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d081c22f67bdde49211ac6053011901c616f99d6))
* fix "process is not defined" error in cloudflare worker [#192](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/192) ([6a94587](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6a9458774da1ec8a026a223ffd9204eb5c11915f))
* return null from getValidIdToken if provided server token is empty ([613f230](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/613f230504e30e8329eb1c1be008fadbf4347c96))
* store latest valid id token on client ([5764a33](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5764a33ae8cadff6e48f5e7cb6d31e977e4d8ab9))
* suppress unknown headers property error ([1459ba9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1459ba99703ba7a6b3e9f10f59304d0974ccc652))


### Features

* added `getValidCustomToken` method and documented client-side SDK usage ([2261ef9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2261ef9321a0e3974456af2db11915a128d69421))
* exposed customToken in handleValidToken, getTokens and getFirebaseAuth methods ([f95c34c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f95c34cafb5f87b3afe60130a1631e3c337f2d34))
* introduced `enableMultipleCookies` auth middleware option to increase token capacity ([23ee02f](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/23ee02f2160faee133127dfb8808b1977dba4593))
* introduced refreshTokenPath middleware option and getValidIdToken client method ([56e07c5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/56e07c59cc9b6da45fd818c0600638bb9258bafa))
* introduced removeCookie method ([f108984](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f108984a9c74ed8cf2cf26133a8f3f8f65c905f9))
* support for async response factory in refreshCredentials method ([25bf5c4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/25bf5c46f68bc0f8cdd6cfd480802f3d23922a4d))

# [1.6.0-canary.9](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.8...v1.6.0-canary.9) (2024-07-14)


### Features

* introduced `enableMultipleCookies` auth middleware option to increase token capacity ([23ee02f](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/23ee02f2160faee133127dfb8808b1977dba4593))

# [1.6.0-canary.8](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.7...v1.6.0-canary.8) (2024-07-14)


### Features

* added `getValidCustomToken` method and documented client-side SDK usage ([2261ef9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2261ef9321a0e3974456af2db11915a128d69421))

# [1.6.0-canary.7](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.6...v1.6.0-canary.7) (2024-07-07)


### Bug Fixes

* suppress unknown headers property error ([1459ba9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1459ba99703ba7a6b3e9f10f59304d0974ccc652))


### Features

* exposed customToken in handleValidToken, getTokens and getFirebaseAuth methods ([f95c34c](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f95c34cafb5f87b3afe60130a1631e3c337f2d34))

# [1.6.0-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.5...v1.6.0-canary.6) (2024-06-17)


### Bug Fixes

* return null from getValidIdToken if provided server token is empty ([613f230](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/613f230504e30e8329eb1c1be008fadbf4347c96))

# [1.6.0-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.4...v1.6.0-canary.5) (2024-06-15)


### Bug Fixes

* store latest valid id token on client ([5764a33](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5764a33ae8cadff6e48f5e7cb6d31e977e4d8ab9))

# [1.6.0-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.3...v1.6.0-canary.4) (2024-06-15)


### Bug Fixes

* enable refresh token route ([d081c22](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/d081c22f67bdde49211ac6053011901c616f99d6))

# [1.6.0-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.2...v1.6.0-canary.3) (2024-06-15)


### Features

* introduced refreshTokenPath middleware option and getValidIdToken client method ([56e07c5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/56e07c59cc9b6da45fd818c0600638bb9258bafa))

# [1.6.0-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.6.0-canary.1...v1.6.0-canary.2) (2024-06-05)


### Features

* introduced removeCookie method ([f108984](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f108984a9c74ed8cf2cf26133a8f3f8f65c905f9))

# [1.6.0-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.4-canary.1...v1.6.0-canary.1) (2024-06-05)


### Features

* support for async response factory in refreshCredentials method ([25bf5c4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/25bf5c46f68bc0f8cdd6cfd480802f3d23922a4d))

## [1.5.4-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.3...v1.5.4-canary.1) (2024-06-01)


### Bug Fixes

* fix "process is not defined" error in cloudflare worker [#192](https://github.com/awinogrodzki/next-firebase-auth-edge/issues/192) ([6a94587](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6a9458774da1ec8a026a223ffd9204eb5c11915f))

## [1.5.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.2...v1.5.3) (2024-05-31)


### Bug Fixes

* referer is now based on caller host ([2f75386](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2f75386de3d91aea42345771c006221eff819104))

## [1.5.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.1...v1.5.2) (2024-05-30)


### Bug Fixes

* expose tokens in refreshCredentials response factory callback ([644b8a2](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/644b8a272cb48e830d21344f12bae9e3082ae1f4))

## [1.5.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.0...v1.5.1) (2024-05-30)


### Bug Fixes

* reintroduce refreshAuthCookies as refreshNextResponseCookiesWithToken ([620f986](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/620f98682b9002837bfca287d32ea0371f2b2017))

# [1.5.0](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5...v1.5.0) (2024-05-30)


### Bug Fixes

* remove fetch `cache: no-store` due to https://github.com/awinogrodzki/next-firebase-auth-edge/issues/173 ([6fb8143](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6fb81430b580b586f5a27c5b36624a441aa68e82))


### Features

* added refreshCredentials method that allows to pass modified request headers to NextResponse constructor ([2bf2877](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2bf2877f5b12456c5e8125d5fa1babfc0074edaf))
* extract referer from Next.js request headers ([bc666fa](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/bc666fa887b81adbf91681faa7d1974417b20988))
* introduced Firebase API Key domain restriction support. Introduced changes to advanced methods and removed APIs deprecated in 1.0 ([67dbb9a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/67dbb9a2908d62d90fb40a5a154cd2a7d8b14626))


### Performance Improvements

* **refreshCredentials:** slightly improve performance by generating signed tokens only once ([da2fc3e](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/da2fc3e164da0d5015e4d484813cafce2f033ea2))

# [1.5.0-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.0-canary.4...v1.5.0-canary.5) (2024-05-30)


### Features

* extract referer from Next.js request headers ([bc666fa](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/bc666fa887b81adbf91681faa7d1974417b20988))

# [1.5.0-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.0-canary.3...v1.5.0-canary.4) (2024-05-27)


### Performance Improvements

* **refreshCredentials:** slightly improve performance by generating signed tokens only once ([da2fc3e](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/da2fc3e164da0d5015e4d484813cafce2f033ea2))

# [1.5.0-canary.3](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.0-canary.2...v1.5.0-canary.3) (2024-05-27)


### Features

* added refreshCredentials method that allows to pass modified request headers to NextResponse constructor ([2bf2877](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2bf2877f5b12456c5e8125d5fa1babfc0074edaf))

# [1.5.0-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.5.0-canary.1...v1.5.0-canary.2) (2024-05-26)


### Bug Fixes

* remove fetch `cache: no-store` due to https://github.com/awinogrodzki/next-firebase-auth-edge/issues/173 ([6fb8143](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/6fb81430b580b586f5a27c5b36624a441aa68e82))

# [1.5.0-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5...v1.5.0-canary.1) (2024-05-26)


### Features

* introduced Firebase API Key domain restriction support. Introduced changes to advanced methods and removed APIs deprecated in 1.0 ([67dbb9a](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/67dbb9a2908d62d90fb40a5a154cd2a7d8b14626))

## [1.4.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.4...v1.4.5) (2024-05-26)


### Bug Fixes

* /api/login endpoint now fails with 400: Missing Token error when called without credentials ([2997fc5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2997fc51c503400fb9068750374797993f4a61d8))
* exclude lib folder from npmignore file ([f7ef2d5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f7ef2d5249d7183f3f1204a34c540e03392943a4))
* fix build cache path in github workflows ([df4c98d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/df4c98dfe7176029743a04513aa5b67c60a453a3))
* remove .env.dist from npm package ([5c136f9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5c136f9e2e7d2f3bc0427f21a91c7ff36a87d0d0))
* remove tests and lint steps from semantic release pipeline ([160662d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/160662d53077e7cfdd69f194eb1d89e31a7e8d55))
* semantic release npm publish initialization ([3ed6ef5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/3ed6ef591ced2613d3936aea7dd28140605ca167))
* semantic release package configuration ([ec93cc6](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/ec93cc67ed5a8a2a624cef526de88d7601829aec))
* set correct pkgRoot in semantic releases configuration ([9c36948](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9c3694839088fee50e1362537cc7ad3e345d7763))

## [1.4.5-canary.7](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5-canary.6...v1.4.5-canary.7) (2024-05-26)


### Bug Fixes

* fix build cache path in github workflows ([df4c98d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/df4c98dfe7176029743a04513aa5b67c60a453a3))

## [1.4.5-canary.6](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5-canary.5...v1.4.5-canary.6) (2024-05-26)


### Bug Fixes

* exclude lib folder from npmignore file ([f7ef2d5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/f7ef2d5249d7183f3f1204a34c540e03392943a4))

## [1.4.5-canary.5](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5-canary.4...v1.4.5-canary.5) (2024-05-26)


### Bug Fixes

* remove tests and lint steps from semantic release pipeline ([160662d](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/160662d53077e7cfdd69f194eb1d89e31a7e8d55))

## [1.4.5-canary.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5-canary.3...v1.4.5-canary.4) (2024-05-26)


### Bug Fixes

* set correct pkgRoot in semantic releases configuration ([9c36948](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/9c3694839088fee50e1362537cc7ad3e345d7763))

## [1.4.5-canary.2](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.5-canary.1...v1.4.5-canary.2) (2024-05-26)


### Bug Fixes

* remove .env.dist from npm package ([5c136f9](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/5c136f9e2e7d2f3bc0427f21a91c7ff36a87d0d0))

## [1.4.5-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.4...v1.4.5-canary.1) (2024-05-26)


### Bug Fixes

* /api/login endpoint now fails with 400: Missing Token error when called without credentials ([2997fc5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/2997fc51c503400fb9068750374797993f4a61d8))
* semantic release npm publish initialization ([3ed6ef5](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/3ed6ef591ced2613d3936aea7dd28140605ca167))

## [1.4.4](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.3...v1.4.4) (2024-05-26)


### Bug Fixes

* disable default tag behavior in yarn publish ([1661468](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1661468a501ad759ac55ce66d3eb0c8bab496b13))
* lint ([c703cfb](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c703cfb9a4c5afc67165366fd1bcaa3651c67a73))
* semantic release publish step authorization ([232f624](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/232f6244e0126b0112cc4a0255780b070049910d))
* semantic release publish step git author ([c917de4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c917de4227f432e0aeefdcdc1fd6b38a0d79d7bf))

## [1.4.4-canary.1](https://github.com/awinogrodzki/next-firebase-auth-edge/compare/v1.4.3...v1.4.4-canary.1) (2024-05-26)


### Bug Fixes

* disable default tag behavior in yarn publish ([1661468](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/1661468a501ad759ac55ce66d3eb0c8bab496b13))
* lint ([c703cfb](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c703cfb9a4c5afc67165366fd1bcaa3651c67a73))
* semantic release publish step authorization ([232f624](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/232f6244e0126b0112cc4a0255780b070049910d))
* semantic release publish step git author ([c917de4](https://github.com/awinogrodzki/next-firebase-auth-edge/commit/c917de4227f432e0aeefdcdc1fd6b38a0d79d7bf))

## 1.4.3

### Patch Changes

- Remove digest from debug logs

## 1.4.2

### Patch Changes

- Fetch Google public keys with cache: "no-store" to fix #159

## 1.4.1

### Patch Changes

- Improve cookieSignatureKeys input validation

## 1.4.0

### Minor Changes

- `handleInvalidToken` is now called with `InvalidTokenReason` as the first argument. It gives developers more inslight and control over authentication flow

## 1.3.0

### Minor Changes

- The library now stores tokens and signature in a single cookie, allowing to run in Firebase Hosting environment
- Use the library without service account in authenticated Google Cloud Run environment
- Added debug mode option

## 1.2.0

### Minor Changes

- Introduced refreshServerCookies method to refresh credentials from inside Server Actions

## 1.1.0

### Minor Changes

- Deprecated refreshAuthCookies methods in favor of refreshNextResponseCookies and refreshApiResponseCookies

## 1.0.1

### Patch Changes

- Update middleware token verification caching doc link

## 1.0.0

### Major Changes

- Reworked APIs

## 0.11.2

### Patch Changes

- Added getUserByEmail method

## 0.11.1

### Patch Changes

- Added Node.js 20 support

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
