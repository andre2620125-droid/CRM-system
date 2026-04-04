import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    // On Cloud Run, Application Default Credentials are used automatically.
    // Locally, set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
