import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getFirebaseAdminConfig } from "./config";

let adminApp: App | null = null;
let firestore: Firestore | null = null;

function getFirebaseAdminApp() {
  const config = getFirebaseAdminConfig();

  if (!config) {
    return null;
  }

  if (adminApp) {
    return adminApp;
  }

  adminApp = getApps().length > 0
    ? getApps()[0] ?? null
    : initializeApp({
        credential: cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
        projectId: config.projectId,
      });

  return adminApp;
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();

  if (!app) {
    return null;
  }

  return getAuth(app);
}

export function getFirebaseAdminDb(): Firestore | null {
  const app = getFirebaseAdminApp();

  if (!app) {
    return null;
  }

  if (!firestore) {
    firestore = getFirestore(app);
    firestore.settings({ ignoreUndefinedProperties: true });
  }

  return firestore;
}
