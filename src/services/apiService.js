const API_URL =
  "https://haleigh-nonextendible-unduteously.ngrok-free.dev/generate-plan";

const TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function generatePlan(payload) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) await sleep(1000 * attempt);

      const res = await fetchWithTimeout(API_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Server error ${res.status}: ${text}`
        );
      }

      const data = await res.json();

      if (!data.plan) {
        throw new Error("Backend returned empty plan");
      }

      return data.plan;
    } catch (err) {
      lastError = err;

      if (err.name === "AbortError") {
        throw new Error(
          "Request timed out (30s). Server busy."
        );
      }

      if (attempt === MAX_RETRIES) break;

      console.warn(
        "Retrying plan generation...",
        err
      );
    }
  }

  throw new Error(
    lastError?.message ||
      "Failed to generate plan"
  );
}