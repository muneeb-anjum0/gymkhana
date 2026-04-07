"use client";

import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";

import { exerciseLibrary } from "@/lib/data/exercise-library";
import { createFirebaseFirestoreClient } from "./client";
import type {
  FirebaseBodyweightEntryDoc,
  FirebaseProfileDoc,
  FirebaseWorkoutSessionDoc,
  FirebaseWorkoutSetDoc,
  FirebaseWorkoutTemplateDoc,
} from "./types";

function getFirestoreOrThrow() {
  const db = createFirebaseFirestoreClient();

  if (!db) {
    throw new Error("Firebase environment variables are not configured.");
  }

  return db;
}

function isoNow() {
  return new Date().toISOString();
}

export async function upsertProfileDocument(
  userId: string,
  profileDoc: Omit<FirebaseProfileDoc, "createdAt" | "updatedAt">,
) {
  const db = getFirestoreOrThrow();
  const now = isoNow();

  await setDoc(
    doc(db, "profiles", userId),
    {
      ...profileDoc,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function saveWorkoutTemplate(
  userId: string,
  templateId: string | null,
  templateDoc: Omit<FirebaseWorkoutTemplateDoc, "createdAt" | "updatedAt" | "userId">,
) {
  const db = getFirestoreOrThrow();
  const now = isoNow();

  if (templateId) {
    await updateDoc(doc(db, "workoutTemplates", templateId), {
      ...templateDoc,
      userId,
      updatedAt: now,
    });

    return templateId;
  }

  const created = await addDoc(collection(db, "workoutTemplates"), {
    ...templateDoc,
    userId,
    createdAt: now,
    updatedAt: now,
  });

  return created.id;
}

export async function deleteWorkoutTemplateDocument(templateId: string) {
  const db = getFirestoreOrThrow();
  await deleteDoc(doc(db, "workoutTemplates", templateId));
}

export async function saveWorkoutSession(
  userId: string,
  values: {
    workoutDate: string;
    templateId: string | null;
    templateName: string | null;
    name: string;
    notes: string | null;
    exercises: Array<{
      exerciseSlug: string;
      notes: string | null;
      sets: Array<{ reps: number | null; weightKg: number | null }>;
    }>;
  },
) {
  const db = getFirestoreOrThrow();
  const now = isoNow();

  const sessionRef = await addDoc(collection(db, "workoutSessions"), {
    userId,
    templateId: values.templateId,
    templateName: values.templateName,
    workoutDate: values.workoutDate,
    name: values.name,
    notes: values.notes,
    createdAt: now,
  } satisfies FirebaseWorkoutSessionDoc);

  const setEntries = values.exercises.flatMap((exercise) => {
    const exerciseOption = exerciseLibrary.find((item) => item.slug === exercise.exerciseSlug);

    if (!exerciseOption) {
      return [];
    }

    return exercise.sets.flatMap((set, index) => {
      if (set.reps === null && set.weightKg === null) {
        return [];
      }

      return {
        userId,
        sessionId: sessionRef.id,
        exerciseSlug: exerciseOption.slug,
        exerciseName: exerciseOption.name,
        setNumber: index + 1,
        reps: set.reps,
        weightKg: set.weightKg,
        notes: exercise.notes,
        createdAt: now,
      } satisfies FirebaseWorkoutSetDoc;
    });
  });

  await Promise.all(setEntries.map((setEntry) => addDoc(collection(db, "workoutSets"), setEntry)));

  return sessionRef.id;
}

export async function saveBodyweightEntry(
  userId: string,
  bodyweightDoc: Omit<FirebaseBodyweightEntryDoc, "createdAt" | "userId">,
) {
  const db = getFirestoreOrThrow();
  const created = await addDoc(collection(db, "bodyweightEntries"), {
    ...bodyweightDoc,
    userId,
    createdAt: isoNow(),
  });

  return created.id;
}
