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

## Connection & Architecture Info

This is a full-stack Next.js application, not a standalone backend. The backend logic is tightly integrated with the Next.js frontend using Server Actions and Server Components.

### 1. Firebase Configuration

The client-side Firebase configuration is managed in `src/lib/firebase/client.ts` and uses the environment variables from your `.env.local` file:

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

The server-side configuration uses the `FIREBASE_SERVICE_ACCOUNT` environment variable for the Admin SDK, as detailed in the setup steps.

### 2. Authentication (Email & Password)

- **Frontend Connection**: The sign-up and login forms are in `src/app/(auth)/signup/page.tsx` and `src/app/(auth)/login/page.tsx`. They use the Firebase client-side SDK (`firebase/auth`) to handle user creation and sign-in.
- **Backend Logic**: After a successful sign-in on the client, an ID token is sent to a **Server Action** (`loginWithIdToken` in `src/lib/actions/auth.ts`). This server-side function uses the Firebase Admin SDK to create a secure session cookie, which keeps the user logged in for server-side rendering and protected routes.

### 3. Firestore Database (Tasks Collection)

- **Frontend Connection**: The frontend does not interact directly with Firestore. This is a key security and architectural principle of this app.
- **Backend Logic**: All database operations (create, read, update, delete) for tasks are handled through **Server Actions** located in `src/lib/actions/tasks.ts`. These server-side functions use the Firebase Admin SDK to interact with the `tasks` collection in Firestore. They ensure that users can only access their own data, as enforced by both the server-side code and Firestore Security Rules.

This integrated approach is modern and secure, but it means you cannot connect a separate Flutter or No-Code application to this "backend" as you would with a traditional REST or GraphQL API.

I hope this clears things up! Let me know if you have more questions about the application's structure.