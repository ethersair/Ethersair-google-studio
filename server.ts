import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { 
  getOrCreateUser, 
  getUserData, 
  saveUserTransaction, 
  saveUserStakingPool, 
  updateUserStakingPool, 
  saveUserNFT, 
  deleteUserNFT, 
  saveUserInscription 
} from "./src/db/dbOps.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google Gen AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for slide deck generation
  app.post("/api/gemini/generate-slides", async (req, res) => {
    try {
      const { prompt, count, theme } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const slideCount = Math.min(Math.max(Number(count) || 5, 2), 10);

      const systemInstruction = `You are a world-class presentation designer and educational specialist. 
Create a complete, highly engaging and professional presentation structure based on the user's topic: "${prompt}".
You must generate exactly ${slideCount} slides.
Slide 1 MUST be a compelling Cover Slide with a catchy main Title and a subtitle or target audience description.
Subsequent slides must flow logically: introducing the core problem/concept, explaining key components, and finishing with a summary/conclusion slide.
Keep bullet points concise, impact-oriented, and easy to read (max 3 bullet points per slide).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a structured slide deck about: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The overall presentation title"
              },
              slides: {
                type: Type.ARRAY,
                description: "List of individual slides inside the presentation",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: "The slide heading (clear and compelling)"
                    },
                    subtitle: {
                      type: Type.STRING,
                      description: "A secondary subtitle, key takeaway, or summary sentence"
                    },
                    bullets: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING
                      },
                      description: "Exactly 3 bullet points detailing the core concept of the slide"
                    }
                  },
                  required: ["title", "subtitle", "bullets"]
                }
              }
            },
            required: ["title", "slides"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text returned from Gemini API");
      }

      const slideData = JSON.parse(responseText.trim());
      res.json(slideData);
    } catch (error: any) {
      console.error("Error generating slides:", error);
      res.status(500).json({ error: error.message || "Failed to generate presentation" });
    }
  });

  // Dune Analytics API endpoint
  app.get("/api/dune/query/:queryId", async (req, res) => {
    try {
      const apiKey = process.env.DUNE_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "DUNE_API_KEY is not configured in environment variables." });
      }
      const { queryId } = req.params;
      const duneRes = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
        headers: {
          "X-Dune-API-Key": apiKey
        }
      });
      const data = await duneRes.json();
      res.json(data);
    } catch (error: any) {
      console.error("Dune API error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch data from Dune" });
    }
  });

  // ----------------- DATABASE ENDPOINTS -----------------
  app.post("/api/db/user", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const user = await getOrCreateUser(uid, email);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/db/user/data", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const data = await getUserData(uid);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/db/transaction", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const tx = await saveUserTransaction(uid, req.body);
      res.json(tx);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/db/staking", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const pool = await saveUserStakingPool(uid, req.body);
      res.json(pool);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/db/staking/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const pool = await updateUserStakingPool(uid, parseInt(req.params.id as string), req.body.staked, req.body.rewards);
      res.json(pool);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/db/nft", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const nft = await saveUserNFT(uid, req.body);
      res.json(nft);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/db/nft/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const result = await deleteUserNFT(uid, parseInt(req.params.id as string));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/db/inscription", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(400).json({ error: "User UID is missing" });
      }
      const inscription = await saveUserInscription(uid, req.body);
      res.json(inscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
