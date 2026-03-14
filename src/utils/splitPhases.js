// src/utils/splitPhases.js

/**
 * Split LLM plan text into structured phase objects.
 * Returns: [{ title, content, duration, risk }]
 */
export function splitPhases(planText) {
  if (!planText || typeof planText !== "string") return [];

  // Normalize line endings
  const text = planText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Try to split by PHASE N: markers (case-insensitive, bold markdown ok)
  const phaseRegex = /(?:\*{0,2})(PHASE\s*\d+[:\-]?\s*[^\n]*?)(?:\*{0,2})\n/gi;
  const matches = [...text.matchAll(phaseRegex)];

  if (matches.length >= 2) {
    const phases = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const rawTitle = matches[i][1].trim();
      const content = text.slice(start, end).trim();
      phases.push(parsePhaseContent(rawTitle, content));
    }
    return phases;
  }

  // Fallback: split by double newlines as blocks
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 20);
  if (blocks.length >= 2) {
    return blocks.map((block, i) => {
      const lines = block.split("\n");
      const title = lines[0].trim() || `Phase ${i + 1}`;
      const content = lines.slice(1).join("\n").trim() || block;
      return parsePhaseContent(title, content);
    });
  }

  // Last resort: single-block plan
  return [{ title: "Plan", content: text.trim(), duration: "", risk: "" }];
}

function parsePhaseContent(title, content) {
  // Try to extract duration and risk from content
  const durationMatch = content.match(/duration[:\s]+([^\n.]+)/i);
  const riskMatch = content.match(/risk[:\s]+([^\n.]+)/i);
  return {
    title: cleanTitle(title),
    content: content.trim(),
    duration: durationMatch ? durationMatch[1].trim() : "",
    risk: riskMatch ? riskMatch[1].trim() : "",
  };
}

function cleanTitle(t) {
  return t
    .replace(/\*+/g, "")
    .replace(/^#+\s*/, "")
    .trim();
}

export default splitPhases;
