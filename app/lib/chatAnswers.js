// Offline answers for the portfolio assistant, derived from the content model so
// they can never drift from what the page says. Used when no provider is
// configured, the provider times out, or it returns something unusable.
import { profile, projects, experience, skills } from "../content/site.js";

export const MAX_QUESTION_LENGTH = 500;

const list = (items) => items.map((i) => `• ${i}`).join("\n");

const ANSWERS = [
  {
    id: "projects",
    match: /\b(project|projects|built|build|work|portfolio|made|apps?)\b/,
    answer: () =>
      `Selected projects:\n${list(projects.map((p) => `${p.title} — ${p.desc} Source: ${p.source}`))}`,
  },
  {
    id: "skills",
    match: /\b(skill|skills|stack|tech|technolog|languages?|strong|strongest|good at)\b/,
    answer: () =>
      `Strongest areas, grouped:\n${list(Object.entries(skills).map(([k, v]) => `${k}: ${v.join(", ")}`))}`,
  },
  {
    id: "contact",
    match: /\b(contact|email|mail|reach|hire|linkedin|connect)\b/,
    answer: () =>
      `Email: ${profile.email}\nLinkedIn: ${profile.linkedin}\nGitHub: ${profile.github}`,
  },
  {
    id: "experience",
    match: /\b(experience|intern|internship|job|role|walmart|codechef|ispace|hackathon|lead)\b/,
    answer: () =>
      `${profile.walmartRole}.\n${list(experience.map((e) => `${e.role}, ${e.org} (${e.dates}) — ${e.summary}`))}`,
  },
  {
    id: "about",
    match: /\b(about|yourself|who|introduce|background|education|study|college|vit)\b/,
    answer: () =>
      `${profile.name} is a ${profile.role.toLowerCase()} based in ${profile.location}, studying ${profile.education}. ${profile.heroSummary}`,
  },
  {
    id: "greeting",
    match: /^(hi|hello|hey|yo|namaste)\b/,
    answer: () =>
      `Hello! I'm ${profile.name}'s portfolio assistant. Ask about projects, skills, experience or how to get in touch.`,
  },
];

export function offlineAnswer(question) {
  const q = String(question || "").toLowerCase();
  for (const entry of ANSWERS) {
    if (entry.match.test(q)) return { topic: entry.id, answer: entry.answer() };
  }
  return {
    topic: "default",
    answer: `I can answer questions about ${profile.name}'s projects, skills, experience and contact details. Try "what projects have you built?" — or email ${profile.email}.`,
  };
}

export function validateQuestion(input) {
  if (typeof input !== "string") return { ok: false, error: "Please type a question." };
  const q = input.replace(/\s+/g, " ").trim();
  if (!q) return { ok: false, error: "Please type a question." };
  if (q.length > MAX_QUESTION_LENGTH) return { ok: false, error: `Please keep questions under ${MAX_QUESTION_LENGTH} characters.` };
  return { ok: true, question: q };
}
