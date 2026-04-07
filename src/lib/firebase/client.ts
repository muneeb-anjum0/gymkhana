"use client";

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseClientConfig } from "./config";

let clientApp: FirebaseApp | null = null;

function getFirebaseClientApp() {
  const config = getFirebaseClientConfig();

  if (!config) {
    return null;
  }

  if (clientApp) {
    return clientApp;
  }

  const firebaseOptions = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
    ...(config.storageBucket ? { storageBucket: config.storageBucket } : {}),
    ...(config.messagingSenderId ? { messagingSenderId: config.messagingSenderId } : {}),
  };

  clientApp = getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);
  return clientApp;
}

export function createFirebaseAuthClient(): Auth | null {
  const app = getFirebaseClientApp();

  if (!app) {
    return null;
  }

  return getAuth(app);
}

export function createFirebaseFirestoreClient(): Firestore | null {
  const app = getFirebaseClientApp();

  if (!app) {
    return null;
  }

  return getFirestore(app);
}

export async function ensureFirebaseAuthPersistence(auth: Auth) {
  await setPersistence(auth, browserLocalPersistence);
}

export async function createFirebaseSession(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to create the session.");
  }
}

export async function clearFirebaseSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
