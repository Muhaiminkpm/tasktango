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

### Connection Info

This backend is tightly integrated with the Next.js frontend.
- **Authentication**: Managed via Firebase Authentication. The client-side SDK handles user state, and server-side logic uses session cookies validated by the Firebase Admin SDK.
- **Database**: Firestore is accessed through server actions (`src/lib/actions/tasks.ts`), ensuring data fetching and mutations are secure and efficient.
- **AI Features**: Genkit flows are called from server actions, keeping AI logic on the backend.
- **Reminders**: The "Due Date Reminders" feature is designed to be implemented using a scheduled Firebase Cloud Function. This function would run periodically (e.g., once a day), query the `tasks` collection for upcoming due dates, and send emails using a third-party service like SendGrid or Mailgun. This is a standard pattern for background jobs and is separate from the Next.js application runtime.
