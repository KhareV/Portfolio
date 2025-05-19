import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Import Google Generative AI with correct syntax
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import the custom prompt
import getSystemPrompt from "./prompt.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Google Generative AI with API key
const apiKey = process.env.MY_SECRET_API_KEY;
console.log("API Key:", apiKey ? "Key is present" : "Key is missing!");
const genAI = new GoogleGenerativeAI(apiKey);

// MIME types for different file extensions
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "dist")));

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    console.log("Received chat request:", question);

    // Get the system prompt
    const prompt = getSystemPrompt();

    try {
      // Use gemini-2.0-flash model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      console.log("Using prompt to generate response...");

      // Generate content with prompt as context
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt + "\n\nUser: " + question }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });

      // Extract the response text
      const response = result.response;

      if (response) {
        // Fix: text is a method, not a property - need to call it as a function
        const answer = response.text();

        // Make sure answer is a string before using substring
        if (typeof answer === "string") {
          console.log(
            "AI response generated:",
            answer.substring(0, 50) + "..."
          );
        } else {
          console.log(
            "AI response generated but not a string, type:",
            typeof answer
          );
        }

        res.json({ answer });
      } else {
        // If response format is unexpected, throw an error to trigger fallback
        throw new Error("Invalid response format from AI");
      }
    } catch (aiError) {
      console.error("AI Error:", aiError);

      // Fallback to mock responses if AI fails
      const mockResponses = {
        hello:
          "<span class='text-green-500 text-xl font-bold'>Hello there! How can I help you today?</span>",
        "who are you":
          "<span class='text-blue-500 text-xl font-bold'>I'm Vedant's virtual assistant. I'm here to chat about Vedant's projects, skills, and experience. I try to respond in his casual style!</span>",
        "who r u":
          "<span class='text-blue-500 text-xl font-bold'>hey! i'm vedant's virtual assistant. i chat about vedant's projects, skills, and background in his casual style.</span>",
        "what projects":
          "<span class='text-purple-500 text-xl font-bold'>i've worked on several exciting projects: <br>- MedWE: medicine delivery platform (SIH Finalist)<br>- SkillBridge: educational lending platform with blockchain<br>- Voyageur: AI Travel Recommendation System<br>- PropertyDhundo: Real Estate Marketplace</span>",
        contact:
          "<span class='text-amber-500 text-xl font-bold'>you can reach me at kharevedant05@gmail.com or through <a href='https://www.linkedin.com/in/kharevedant05/' target='_blank' class='text-blue-500 hover:underline'>linkedin</a></span>",
        default:
          "<span class=\"font-mono bg-black text-xl p-3 border-4 border-double border-green-400 text-green-400 uppercase tracking-widest\">hey! i'm vedant's chatbot. ask me anything about vedant's projects, skills or background!</span>",
      };

      // Simple keyword matching with more flexible matching
      let answer = mockResponses.default;
      const questionLower = question.toLowerCase();

      Object.keys(mockResponses).forEach((key) => {
        if (questionLower.includes(key)) {
          answer = mockResponses[key];
        }
      });

      console.log("Using fallback response");
      res.json({ answer });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
});

// Define routes with string literals
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// Catch-all route for serving the SPA - using regex pattern
app.get(/.*/, (req, res) => {
  // Only serve index.html if the request is not for a static file
  const requestPath = req.path;
  const extension = path.extname(requestPath);

  if (!extension && !requestPath.startsWith("/api/")) {
    res.sendFile(join(__dirname, "dist", "index.html"));
  } else if (!extension) {
    // Let the next route handler deal with API routes
    res.status(404).send("Not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
