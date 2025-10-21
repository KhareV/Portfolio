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
        let answer = response.text();

        // Make sure answer is a string before formatting
        if (typeof answer === "string") {
          console.log(
            "AI response generated:",
            answer.substring(0, 50) + "..."
          );

          // Format the answer with better styling
          // Add line breaks for better readability
          answer = answer
            .replace(/\n/g, "<br>")
            .replace(
              /\*\*(.*?)\*\*/g,
              "<strong class='text-purple-400 font-bold'>$1</strong>"
            ) // Bold text
            .replace(/\*(.*?)\*/g, "<em class='text-blue-300 italic'>$1</em>") // Italic text
            .replace(
              /`(.*?)`/g,
              "<code class='bg-purple-900/50 px-2 py-1 rounded text-pink-300 font-mono text-sm'>$1</code>"
            ) // Code blocks
            .replace(
              /^- (.*?)$/gm,
              "<div class='flex items-start gap-2 ml-4'><span class='text-purple-400'>•</span><span>$1</span></div>"
            ) // Bullet points
            .replace(
              /^(\d+)\. (.*?)$/gm,
              "<div class='flex items-start gap-2 ml-4'><span class='text-purple-400 font-bold'>$1.</span><span>$2</span></div>"
            ); // Numbered lists

          // Wrap the entire answer in a styled container
          answer = `<div class="text-gray-100 leading-relaxed space-y-2">${answer}</div>`;
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
          "<div class='text-gray-100 leading-relaxed'><span class='text-purple-400 text-lg font-bold'>👋 Hello there!</span><br>How can I help you learn more about Vedant today?</div>",
        "who are you":
          "<div class='text-gray-100 leading-relaxed'><span class='text-purple-400 text-lg font-bold'>🤖 I'm Vedant's AI Assistant</span><br>I'm here to chat about Vedant's projects, skills, and experience. Ask me anything!</div>",
        "who r u":
          "<div class='text-gray-100 leading-relaxed'><span class='text-purple-400 text-lg font-bold'>hey! 👋</span><br>i'm vedant's virtual assistant. i chat about his projects, skills, and background in his casual style.</div>",
        "what projects":
          "<div class='text-gray-100 leading-relaxed space-y-2'><span class='text-purple-400 text-lg font-bold'>🚀 Notable Projects:</span><br><div class='ml-4 space-y-1'><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span><strong class='text-blue-300'>MedWE:</strong> Medicine delivery platform (SIH Finalist)</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span><strong class='text-blue-300'>SkillBridge:</strong> Educational lending with blockchain</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span><strong class='text-blue-300'>Voyageur:</strong> AI Travel Recommendation System</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span><strong class='text-blue-300'>PropertyDhundo:</strong> Real Estate Marketplace</span></div></div></div>",
        contact:
          "<div class='text-gray-100 leading-relaxed'><span class='text-purple-400 text-lg font-bold'>📬 Let's Connect!</span><br>Email: <a href='mailto:kharevedant05@gmail.com' class='text-blue-400 hover:text-blue-300 underline'>kharevedant05@gmail.com</a><br>LinkedIn: <a href='https://www.linkedin.com/in/kharevedant05/' target='_blank' class='text-blue-400 hover:text-blue-300 underline'>Connect with Vedant</a></div>",
        default:
          "<div class='text-gray-100 leading-relaxed'><span class='text-purple-400 text-lg font-bold'>✨ Hey there!</span><br>I'm Vedant's AI assistant. Feel free to ask me about:<br><div class='ml-4 mt-2 space-y-1'><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span>His projects and achievements</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span>Technical skills and experience</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span>Hackathon wins and background</span></div><div class='flex items-start gap-2'><span class='text-purple-400'>•</span><span>How to get in touch</span></div></div></div>",
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
