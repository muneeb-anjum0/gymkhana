import { cookies } from "next/headers";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { exerciseLibraryBySlug } from "@/lib/data/exercise-library";
import { splitPresets } from "@/lib/data/split-presets";
import { addDays, getWeekStart } from "@/lib/utils/date";
import type { BodyweightEntry, DashboardMetrics, ProfileSummary, WorkoutSessionSummary } from "@/types/domain";

import { getFirebaseSessionCookieName } from "./config";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "./server";
import {
  bodyweightDocToEntry,
  createEmptyMetrics,
  profileDocToSummary,
  type FirebaseBodyweightEntryDoc,
  type FirebaseProfileDoc,
  type FirebaseUserContext,
  type FirebaseWorkoutSessionDoc,
  type FirebaseWorkoutSetDoc,
  type FirebaseWorkoutTemplateDoc,
} from "./types";

function normalizeFirestoreDoc<T>(doc: QueryDocumentSnapshot | { exists: boolean; data(): unknown }): T | null {
  if (!doc.exists) {
    return null;
  }

  return doc.data() as T;
}

async function getFirebaseAuthedUserContext() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(getFirebaseSessionCookieName())?.value;

  if (!sessionCookie) {
    return null;
  }

  const auth = getFirebaseAdminAuth();

  if (!auth) {
    return null;
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await auth.getUser(decodedToken.uid);

    return {
      user: {
        id: userRecord.uid,
        email: userRecord.email ?? null,
        displayName: userRecord.displayName ?? null,
      },
    } satisfies FirebaseUserContext;
  } catch {
    return null;
  }
}

function chunkArray<T>(values: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }

  return chunks;
}

function isFirestoreSetupError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("PERMISSION_DENIED") || error.message.includes("FAILED_PRECONDITION");
}

function logFirestoreSetupWarning(error: unknown, scope: string) {
  if (!isFirestoreSetupError(error)) {
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[Firestore setup] ${scope}: ${message}`);
}

export async function getAuthedUserContext() {
  return getFirebaseAuthedUserContext();
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary | null> {
  const db = getFirebaseAdminDb();

  if (!db) {
    return null;
  }

  try {
    const snapshot = await db.collection("profiles").doc(userId).get();
    const profileDoc = normalizeFirestoreDoc<FirebaseProfileDoc>(snapshot);

    if (!profileDoc) {
      return null;
    }

    return profileDocToSummary(profileDoc, userId);
  } catch (error) {
    logFirestoreSetupWarning(error, "getProfileSummary");
    return null;
  }
}

export async function getWorkoutHistory(userId: string): Promise<WorkoutSessionSummary[]> {
  const db = getFirebaseAdminDb();

  if (!db) {
    return [];
  }

  try {
    const sessionsSnapshot = await db.collection("workoutSessions").where("userId", "==", userId).get();

    if (sessionsSnapshot.empty) {
      return [];
    }

    const sessionRows = sessionsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as FirebaseWorkoutSessionDoc) }))
      .sort((left, right) => right.workoutDate.localeCompare(left.workoutDate))
      .slice(0, 20);
    const sessionIds = sessionRows.map((session) => session.id);
    const setSnapshots = await Promise.all(
      chunkArray(sessionIds, 10).map((sessionIdChunk) =>
        db
          .collection("workoutSets")
          .where("userId", "==", userId)
          .where("sessionId", "in", sessionIdChunk)
          .get(),
      ),
    );

    const setRows = setSnapshots.flatMap((snapshot) => snapshot.docs.map((doc) => doc.data() as FirebaseWorkoutSetDoc));

    return sessionRows.map((session) => {
      const sessionSets = setRows.filter((set) => set.sessionId === session.id);
      const totalVolumeKg = sessionSets.reduce((total, set) => {
        if (typeof set.reps !== "number" || typeof set.weightKg !== "number") {
          return total;
        }

        return total + set.reps * Number(set.weightKg);
      }, 0);

      return {
        id: session.id,
        workoutDate: session.workoutDate,
        name: session.name,
        templateName: session.templateName,
        notes: session.notes,
        totalSets: sessionSets.length,
        totalVolumeKg,
      };
    });
  } catch (error) {
    logFirestoreSetupWarning(error, "getWorkoutHistory");
    return [];
  }
}

export async function getWorkoutTemplates(userId: string) {
  const db = getFirebaseAdminDb();

  if (!db) {
    return [];
  }

  try {
    const snapshot = await db
      .collection("workoutTemplates")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const template = doc.data() as FirebaseWorkoutTemplateDoc;

      return {
        id: doc.id,
        name: template.name,
        splitKey: template.splitKey,
        dayKey: template.dayKey,
        notes: template.notes,
      };
    });
  } catch (error) {
    logFirestoreSetupWarning(error, "getWorkoutTemplates");
    return [];
  }
}

export async function getBodyweightEntries(userId: string): Promise<BodyweightEntry[]> {
  const db = getFirebaseAdminDb();

  if (!db) {
    return [];
  }

  try {
    const snapshot = await db
      .collection("bodyweightEntries")
      .where("userId", "==", userId)
      .orderBy("loggedAt", "asc")
      .get();

    return snapshot.docs.map((doc) => bodyweightDocToEntry(doc.id, doc.data() as FirebaseBodyweightEntryDoc));
  } catch (error) {
    logFirestoreSetupWarning(error, "getBodyweightEntries");
    return [];
  }
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const db = getFirebaseAdminDb();

  if (!db) {
    return createEmptyMetrics();
  }

  try {
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekStartIso = weekStart.toISOString().slice(0, 10);
    const nextWeekIso = addDays(weekStart, 7).toISOString().slice(0, 10);

    const sessionsSnapshot = await db.collection("workoutSessions").where("userId", "==", userId).get();

    const weeklySessions = sessionsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as FirebaseWorkoutSessionDoc) }))
      .filter((session) => session.workoutDate >= weekStartIso && session.workoutDate < nextWeekIso);

    const sessionIds = weeklySessions.map((session) => session.id);
    const setSnapshots = await Promise.all(
      chunkArray(sessionIds, 10).map((sessionIdChunk) =>
        db
          .collection("workoutSets")
          .where("userId", "==", userId)
          .where("sessionId", "in", sessionIdChunk)
          .get(),
      ),
    );

    const bodyweightSnapshot = await db
      .collection("bodyweightEntries")
      .where("userId", "==", userId)
      .orderBy("loggedAt", "asc")
      .get();

    const setRows = setSnapshots.flatMap((snapshot) => snapshot.docs.map((doc) => doc.data() as FirebaseWorkoutSetDoc));
    const bodyweightRows = bodyweightSnapshot.docs.map((doc) => doc.data() as FirebaseBodyweightEntryDoc);

    const totalVolumeKg = setRows.reduce((total, set) => {
      if (typeof set.reps !== "number" || typeof set.weightKg !== "number") {
        return total;
      }

      return total + set.reps * Number(set.weightKg);
    }, 0);

    const bodyweightDeltaKg =
      bodyweightRows.length > 1
        ? Number(bodyweightRows[bodyweightRows.length - 1]?.weightKg ?? 0) - Number(bodyweightRows[0]?.weightKg ?? 0)
        : null;

    const targetSessions = splitPresets.find((preset) => preset.key !== "custom")?.sessionsPerWeek ?? 4;

    return {
      workoutsThisWeek: weeklySessions.length,
      totalSetsThisWeek: setRows.length,
      totalVolumeKg,
      bodyweightDeltaKg,
      completionRate: Math.min(100, Math.round((weeklySessions.length / targetSessions) * 100)),
    };
  } catch (error) {
    logFirestoreSetupWarning(error, "getDashboardMetrics");
    return createEmptyMetrics();
  }
}

export async function getExerciseCatalog() {
  return [...exerciseLibraryBySlug.values()];
}
