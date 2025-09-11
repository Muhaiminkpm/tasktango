# TaskTango

This is a Next.js and Firebase-powered task management application.

## Core Features

- **Task Management**: Create, view, edit, and complete tasks.
- **AI Prioritization**: An AI-powered tool suggests task priority based on its details.
- **User Authentication**: Secure sign-up and login with email and password.
- **Real-time Database**: Tasks are stored and synced with Firestore.
- **Protected Routes**: Users can only access their own tasks.

## Getting Started

Follow these steps to get the application running locally.

### 1. Install Dependencies

First, install the project dependencies:

```bash
npm install
```

### 2. Set Up Firebase

1.  Create a new project on the [Firebase Console](https://console.firebase.google.com/).
2.  In your project, go to **Project settings** > **General** and find your web app's configuration object.
3.  Create a `.env.local` file in the root of the project and add your Firebase client configuration:

    ```env
    # Firebase Client SDK Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

4.  Set up Firebase Authentication:
    *   In the Firebase console, go to **Authentication** > **Sign-in method**.
    *   Enable the **Email/Password** provider.

5.  Set up Firestore Database:
    *   In the Firebase console, go to **Firestore Database** and create a database.
    *   Start in **production mode**.

6.  Set up Firebase Admin (for server-side authentication):
    *   In **Project settings** > **Service accounts**, click **Generate new private key**. A JSON file will be downloaded.
    *   **Do not commit this file to your repository.**
    *   Convert the content of this JSON file to a Base64 string. You can use an online converter or a command-line tool:
        ```bash
        cat /path/to/your/serviceAccountKey.json | base64
        ```
    *   Add the Base64 string to your `.env.local` file:
        ```env
        # Firebase Admin SDK Configuration
        FIREBASE_SERVICE_ACCOUNT=your-base64-encoded-service-account
        ```

7.  **Firestore Security Rules**: To ensure users can only access their own data, go to the **Firestore Database** > **Rules** tab in your Firebase console and paste the following rules:

    ```
    rules_version = '2';

    service cloud.firestore {
      match /databases/{database}/documents {
        match /tasks/{taskId} {
          allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
          allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
        }
      }
    }
    ```

### 3. Run the Development Server

Now you can run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Connection Info for External Apps (Flutter, No-Code, etc.)

It's important to understand that this project is a **full-stack Next.js application**, not a standalone backend API. The "backend" logic is handled by Next.js Server Actions, which are not exposed as REST or GraphQL endpoints that an external application can call.

**Therefore, you cannot directly connect a separate Flutter or No-Code application to this backend as you would with a traditional API.**

However, the information below explains how this Next.js application connects to Firebase, which can guide you if you choose to build a separate backend for your other applications.

### 1. Firebase Client Configuration

This is your public-facing Firebase configuration. It's safe to use in any client-side application. It is stored in your `.env.local` file and used in `src/lib/firebase/client.ts`.

```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

Here are the values for your project:
- **apiKey**: `AIzaSyCvi-Wp7wtl2y5aEcWcekm14CTjj0EiGG4`
- **authDomain**: `studio-5759297052-61ee5.firebaseapp.com`
- **projectId**: `studio-5759297052-61ee5`
- **storageBucket**: `studio-5759297052-61ee5.firebasestorage.app`
- **messagingSenderId**: `542214912337`
- **appId**: `1:542214912337:web:540de702032829801f7b70`

### 2. How Authentication is Connected

This application handles authentication in two parts:

-   **Frontend (Client-Side)**: The sign-up and login forms (`src/app/(auth)/signup/page.tsx` and `src/app/(auth)/login/page.tsx`) use the standard Firebase client-side SDK (`firebase/auth`) to sign the user in with their email and password.
    ```javascript
    // Example from src/app/(auth)/login/page.tsx
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { auth } from '@/lib/firebase/client';

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    ```
-   **Backend (Server-Side)**: After a successful client-side login, the app gets an ID token from Firebase. This token is sent to a **Server Action** (`loginWithIdToken` in `src/lib/actions/auth.ts`). This server-side function uses the Firebase Admin SDK to create a secure, HTTP-only session cookie. This cookie is what keeps the user logged in for secure server-side operations.

### 3. How the Firestore Database is Connected

**The frontend does not interact directly with Firestore.** This is a key security and architectural principle of this app.

-   **Backend (Server-Side)**: All database operations (create, read, update, delete) for tasks are handled exclusively through **Server Actions** located in `src/lib/actions/tasks.ts`. These server-side functions use the Firebase Admin SDK (which has admin privileges) to interact with the `tasks` collection in Firestore. They include logic to ensure that a user can only ever access their own data, which is then double-enforced by the Firestore Security Rules.

I hope this detailed explanation clears things up! This integrated approach is modern and secure, but it means you cannot connect a separate Flutter or No-Code application to this specific "backend" as you would with a traditional REST or GraphQL API.

Let me know if you have more questions about the application's structure.
