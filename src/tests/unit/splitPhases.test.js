// src/tests/unit/splitPhases.test.js
import { splitPhases } from "../../utils/splitPhases";

describe("splitPhases", () => {
  test("returns empty array for null or empty input", () => {
    expect(splitPhases(null)).toEqual([]);
    expect(splitPhases("")).toEqual([]);
    expect(splitPhases(undefined)).toEqual([]);
  });

  test("parses standard PHASE N: format", () => {
    const text = `PHASE 1: Foundations\nLearn basics\n\nPHASE 2: Intermediate\nBuild projects\n`;
    const result = splitPhases(text);
    expect(result.length).toBe(2);
    expect(result[0].title).toContain("PHASE 1");
    expect(result[1].title).toContain("PHASE 2");
  });

  test("parses markdown bold phase headers", () => {
    const text = `**PHASE 1: Setup**\nInstall Node.js\n\n**PHASE 2: Build**\nCreate REST API\n`;
    const result = splitPhases(text);
    expect(result.length).toBe(2);
  });

  test("extracts duration from content", () => {
    const text = `PHASE 1: Basics\nDuration: 2 weeks\nLearn variables\n\nPHASE 2: Advanced\nLearn async\n`;
    const result = splitPhases(text);
    expect(result[0].duration).toBe("2 weeks");
  });

  test("falls back to double-newline blocks if no PHASE markers", () => {
    const text = `Block One\nLearn something useful here with enough words\n\nBlock Two\nAnother long section of content goes here`;
    const result = splitPhases(text);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("returns single-block plan for unstructured text", () => {
    const text = "Just some freeform text without structure.";
    const result = splitPhases(text);
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Plan");
  });

  test("handles case-insensitive PHASE markers", () => {
    const text = `Phase 1: Begin\nStart here\n\nPhase 2: Continue\nKeep going\n`;
    const result = splitPhases(text);
    expect(result.length).toBe(2);
  });
});// src/services/userService.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, getUserProfile, createUserProfile } from "../firebase";

export { getUserProfile, createUserProfile };

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
