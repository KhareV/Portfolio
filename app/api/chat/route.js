import { NextResponse } from "next/server";
import getSystemPrompt from "./prompt";

const apiKey =
  process.env.GROQ_API_KEY ||
  process.env.MY_SECRET_API_KEY ||
  process.env.NEXT_PUBLIC_GROQ_API_KEY;

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const escapeHtml = (input) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatAnswer = (answer) => {
  const safeText = escapeHtml(String(answer).trim());
  return `<div class="leading-relaxed">${safeText.replace(/\n/g, "<br>")}</div>`;
};

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Invalid question payload" },
        { status: 400 },
      );
    }

    const prompt = getSystemPrompt();

    if (!apiKey) {
      console.warn("Groq API key not found, using fallback responses");
      return NextResponse.json({ answer: getFallbackResponse(question) });
    }

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.6,
            max_tokens: 800,
            messages: [
              {
                role: "system",
                content: prompt,
              },
              {
                role: "user",
                content: question,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq request failed: ${response.status} ${errorBody}`);
      }

      const payload = await response.json();
      const answer = payload?.choices?.[0]?.message?.content;

      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error("Invalid response format from Groq");
      }

      return NextResponse.json({ answer: formatAnswer(answer) });
    } catch (aiError) {
      console.error("AI Error:", aiError);
      return NextResponse.json({ answer: getFallbackResponse(question) });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

function getFallbackResponse(question) {
  const responseMap = {
    hello:
      "Hello! I am Vedant's assistant. Ask me about projects, skills, work, or contact details.",
    "who are you":
      "I am Vedant's portfolio assistant. I can answer questions about his background, projects, and experience.",
    "who r u":
      "I am Vedant's portfolio assistant. Ask me anything about his work and achievements.",
    contact:
      "You can reach Vedant at kharevedant05@gmail.com and connect on LinkedIn: https://www.linkedin.com/in/vedantkhare",
    default:
      "I can help with Vedant's profile, projects, skills, hackathons, and contact details. Ask any question.",
  };

  let answer = responseMap.default;
  const normalizedQuestion = question.toLowerCase();

  Object.keys(responseMap).forEach((key) => {
    if (normalizedQuestion.includes(key)) {
      answer = responseMap[key];
    }
  });

  return formatAnswer(answer);
}
