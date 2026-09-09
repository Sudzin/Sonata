import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Route for generating AI playlists
app.post("/api/generate-playlist", async (req, res) => {
  try {
    const { prompt, tracks } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ error: "Library tracks are required" });
    }

    // Limit tracks sent to the AI to avoid massive context size
    // We send a minimal representation: ID, Title, Artist, Album, Genre
    const availableTracks = tracks.map((t: any) => ({
      id: t.id,
      t: t.title,
      a: t.artist,
      al: t.album,
      g: t.genre || ""
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a music curator AI. The user wants a playlist based on this prompt: "${prompt}".
      
      Here is the user's available local music library (in JSON):
      ${JSON.stringify(availableTracks)}
      
      Return ONLY a JSON array of string IDs that correspond to the tracks you selected for this playlist.
      Ensure the selection accurately reflects the mood/genre/style of the prompt.
      Limit to at most 30 tracks, but ideally 10-20. Do NOT return any markdown formatting, only raw JSON array like ["id1", "id2"].`,
    });

    const aiText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
    const selectedIds = JSON.parse(aiText);

    res.json({ playlist: selectedIds });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate playlist" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Dynamically resolve dist path to support standard Node run & Electron app.asar
    const currentDir = typeof __dirname !== 'undefined' 
      ? __dirname 
      : path.dirname(fileURLToPath(import.meta.url));
      
    let distPath = path.join(process.cwd(), "dist");
    
    if (fs.existsSync(path.join(currentDir, "index.html"))) {
      // Electron run from app.asar where __dirname is already dist/
      distPath = currentDir;
    } else if (fs.existsSync(path.join(currentDir, "dist", "index.html"))) {
      // Standard Node build run
      distPath = path.join(currentDir, "dist");
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const HOST = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
