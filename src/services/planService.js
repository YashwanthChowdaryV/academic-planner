// src/services/planService.js
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { recalculateStats } from "./statsService";

// ── Plans ────────────────────────────────────────────────────

export async function createPlan(uid, inputPayload, planText, phaseCount) {
  const batch = writeBatch(db);

  const planRef = doc(collection(db, "users", uid, "plans"));
  batch.set(planRef, {
    input: inputPayload,
    output: planText,
    title: `${inputPayload.level?.toUpperCase()}: ${inputPayload.goal}`,
    createdAt: serverTimestamp(),
    meta: {
      phaseCount,
      estimatedTotalHours: inputPayload.time_available_days * inputPayload.hours_per_day,
    },
  });

  const progressRef = doc(db, "users", uid, "progress", planRef.id);
  const phases = {};
  for (let i = 0; i < phaseCount; i++) phases[String(i)] = false;
  batch.set(progressRef, { phases, updatedAt: serverTimestamp() });

  await batch.commit();

  // Trigger stats update
  recalculateStats(uid).catch(console.error);

  return planRef.id;
}

export async function getUserPlans(uid, pageLimit = 20, cursor = null) {
  let q = query(
    collection(db, "users", uid, "plans"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  if (cursor) q = query(q, startAfter(cursor));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPlan(uid, planId) {
  const snap = await getDoc(doc(db, "users", uid, "plans", planId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deletePlan(uid, planId) {
  await deleteDoc(doc(db, "users", uid, "plans", planId));
  await deleteDoc(doc(db, "users", uid, "progress", planId));
  // Trigger stats update
  recalculateStats(uid).catch(console.error);
}

// ── Progress ─────────────────────────────────────────────────

export async function getProgress(uid, planId) {
  const snap = await getDoc(doc(db, "users", uid, "progress", planId));
  return snap.exists() ? snap.data() : { phases: {} };
}

export async function setProgress(uid, planId, phases) {
  await setDoc(
    doc(db, "users", uid, "progress", planId),
    { phases, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function togglePhase(uid, planId, phaseIndex, value) {
  await updateDoc(doc(db, "users", uid, "progress", planId), {
    [`phases.${phaseIndex}`]: value,
    updatedAt: serverTimestamp(),
  });
}

// ── Notes ────────────────────────────────────────────────────

export async function saveNote(uid, planId, phaseIndex, text) {
  const key = `${planId}_${phaseIndex}`;
  const ref = doc(db, "users", uid, "notes", key);
  const snap = await getDoc(ref);
  await setDoc(ref, {
    text,
    updatedAt: serverTimestamp(),
    createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
  });
}

export async function getNotesForPlan(uid, planId, phaseCount) {
  const notes = {};
  const fetches = [];
  for (let i = 0; i < phaseCount; i++) {
    fetches.push(
      getDoc(doc(db, "users", uid, "notes", `${planId}_${i}`)).then((snap) => {
        if (snap.exists()) notes[i] = snap.data();
      })
    );
  }
  await Promise.all(fetches);
  return notes;
}
