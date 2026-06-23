# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Seed Firebase

Create `.env` from `.env.example`, fill in the Firebase web app values, then run:

```bash
npm run seed:firestore
```

The seed creates:

- one admin user in `users`
- four owner users in `users`
- four salon documents in `salons`
- eight service documents in `services`

Default seeded accounts:

- admin: `admin@bookme.local` / `BookMeAdmin123!`
- owners: `luna.owner@bookme.local`, `rose.owner@bookme.local`, `glow.owner@bookme.local`, `velvet.owner@bookme.local`
- owner password: `BookMeOwner123!`

## Firebase Storage

Salon images are uploaded to Firebase Storage under:

```text
salons/{salonId}/{timestamp}.{extension}
```

In Firebase Console:

1. Open Build > Storage.
2. Create/enable the default Storage bucket for the same Firebase project.
3. Keep `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` in `.env` equal to the bucket from the Firebase web app config.
4. Use Storage rules that allow authenticated owners to upload salon images. For development you can start with authenticated writes, then tighten ownership rules before production.

Example development rule:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /salons/{salonId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
