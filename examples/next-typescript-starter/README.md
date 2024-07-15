# next-firebase-auth-edge starter

This is a [Next.js](https://nextjs.org/) project showcasing `next-firebase-auth-edge` library features.

Demo of this project can be previewed at [next-firebase-auth-edge-starter.vercel.app](https://next-firebase-auth-edge-starter.vercel.app)

## Before Getting Started

To properly run this example, you will need to setup a new Firebase Project.

You will also need to:

- Create a new web app in your new Firebase Project.
- Add Firebase Auth to your project and enable Google, Email/Password and Email Link sign-in methods
- Add `localhost` and any other authorized domains in `Authentication > Settings > Authorized domains`
- Add a Firestore database
- Get your private keys from "Project settings > Service Accounts > Generate new private keys"
- Make a copy of `.env.dist` and rename it to `.env.local`
- Fill in the variables inside the `.env.local`
- Make sure to format private variable in `.env.local` as follows to avoid parsing errors `FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR KEY\n-----END PRIVATE KEY-----\n"`

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuring Firestore rules

The demo shows example usage of Firestore Client SDK

Make sure to update Firestore Database Rules of `user-counters` collection in [Firebase Console](https://console.firebase.google.com/).

The following Firestore Database Rules validates if user has access to update specific `user-counters` database entry

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /user-counters/{document} {
      allow read, write: if request.auth.uid == resource.data.id;
    }
  }
}
```


## Emulator support

Library provides Firebase Authentication Emulator support

Use [the official guide](https://firebase.google.com/docs/functions/local-emulator) to run the emulator locally.

In order to connect the example with emulator add two env variables to your `.env.local` file (you can copy them from `.env.dist`).

```shell
NEXT_PUBLIC_EMULATOR_HOST=http://127.0.0.1:9099
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

`FIREBASE_AUTH_EMULATOR_HOST` is used internally by the library
`NEXT_PUBLIC_EMULATOR_HOST` is used only by provided example

Please note that even in emulator mode, library needs actual service account credentials to sign user tokens, a step that does not currently support emulation. Make sure to provide valid service account credentials even if using emulator.

Also, don't forget to put correct Firebase Project ID in `.firebaserc` file.

## App Check support

Library provides [Firebase App Check](https://firebase.google.com/docs/app-check) support

Use [the official guide](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider) to integrate your app with App Check.

In order to integrate the example with App Check, you need to add two env variables to your `.env.local` file (you can copy them from `.env.dist`).

```shell
NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY=XXxxxxXxXXXXXXXxxxXxxxXXXxxXXXXxxxxxXX_X
NEXT_PUBLIC_FIREBASE_APP_ID=x:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY` should be an app check key obtained by following [Set up your Firebase project](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider#project-setup) step

`NEXT_PUBLIC_FIREBASE_APP_ID` can be obtained by following to `Project overview` > `Project settings`, under `Your apps` section in your Firebase Console.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
