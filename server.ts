import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // Enable JSON body parsing

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "DEEPINFRA_API_KEY is not set" });
    }

    try {
      const response = await fetch("https://api.deepinfra.com/v1/openai/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt,
          size: "1024x1024",
          model: "stabilityai/sdxl-turbo",
          n: 1
        })
      });

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].b64_json) {
        res.json({ b64_json: data.data[0].b64_json });
      } else {
        res.status(500).json({ error: "Invalid response from DeepInfra", details: data });
      }
    } catch (error) {
      console.error("DeepInfra Error:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  app.post("/api/analyze-image", async (req, res) => {
    const { image } = req.body;
    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "DEEPINFRA_API_KEY is not set" });

    try {
      const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-90B-Vision-Instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Identificeer alle eetbare ingrediënten op deze foto. Geef alleen een lijst van namen van ingrediënten terug, gescheiden door komma's. Gebruik de Nederlandse taal." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      res.json({ text: data.choices?.[0]?.message?.content || "" });
    } catch (error) {
      console.error("DeepInfra Vision Error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.post("/api/generate-recipes", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "DEEPINFRA_API_KEY is not set" });

    try {
      const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct",
          messages: [
            {
              role: "system",
              content: "Je bent een professionele veganistische chef-kok. Je antwoordt ALTIJD met uitsluitend geldige JSON. Retourneer een JSON object met een 'recipes' array."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      res.json({ text: data.choices?.[0]?.message?.content || "{}" });
    } catch (error) {
      console.error("DeepInfra Text Error:", error);
      res.status(500).json({ error: "Failed to generate recipes" });
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
    // Serve static files in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
