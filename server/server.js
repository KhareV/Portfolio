import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "dist")));

// Chat API endpoint
app.post("/api/chat", (req, res) => {
  try {
    const { question } = req.body;

    console.log("Received chat request:", question);

    // Mock responses as a fallback
    const mockResponses = {
      hello: "Hello there! How can I help you today?",
      "who are you":
        "I'm Vedant's virtual assistant. I can tell you about Vedant's projects, skills, and experience.",
      "what projects":
        "Vedant has worked on several projects including MedWE, SkillBridge, Voyageur, PropertyDhundo, and this 3D Portfolio.",
      contact:
        "You can contact Vedant at kharevedant05@gmail.com or through LinkedIn.",
      default: "Thanks for your message! Vedant will get back to you soon.",
    };

    // Simple keyword matching for demo purposes
    let answer = mockResponses.default;
    Object.keys(mockResponses).forEach((key) => {
      if (question.toLowerCase().includes(key)) {
        answer = mockResponses[key];
      }
    });

    res.json({ answer });
  } catch (error) {
    console.error("Error in chat API:", error);
    res
      .status(500)
      .json({ error: "Failed to process message", details: error.message });
  }
});

// Define routes with string literals, not URL objects
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// Catch-all route for serving the SPA
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
