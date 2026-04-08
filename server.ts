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
          model: "stabilityai/sdxl-turbo",
          size: "1024x1024",
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

    console.log("🚀 Ontvangen verzoek voor recept-generatie");
    
    if (!apiKey) {
      console.error("❌ DEEPINFRA_API_KEY ontbreekt in environment variables!");
      return res.status(500).json({ error: "DEEPINFRA_API_KEY is not set" });
    }

    try {
      console.log("📡 DeepInfra aanroepen met model: meta-llama/Llama-3.3-70B-Instruct-Turbo");
      const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content: "Je bent een professionele veganistische chef-kok. Je antwoordt ALTIJD met uitsluitend geldige JSON. Gebruik GEEN markdown code blocks (zoals ```json). Retourneer een JSON object met een 'recipes' array."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ DeepInfra API Fout (${response.status}):`, errorData);
        return res.status(response.status).json({ error: "DeepInfra API error", details: errorData });
      }

      const data = await response.json();
      console.log("✅ DeepInfra antwoord ontvangen");
      res.json({ text: data.choices?.[0]?.message?.content || "{}" });
    } catch (error) {
      console.error("❌ DeepInfra Text Error:", error);
      res.status(500).json({ error: "Failed to generate recipes" });
    }
  });

  app.post("/api/scrape-recipe", async (req, res) => {
    const { url } = req.body;
    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "DEEPINFRA_API_KEY is not set" });

    try {
      console.log(`📡 Scraper start voor URL: ${url}`);
      
      // 1. Fetch the page content with a User-Agent to avoid being blocked
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!pageResponse.ok) {
        throw new Error(`HTTP error! status: ${pageResponse.status}`);
      }
      
      const html = await pageResponse.text();
      
      // 2. Try to find JSON-LD (Schema.org Recipe)
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
      let recipeJsonLd = null;
      
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const content = match.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
            const parsed = JSON.parse(content);
            
            // Handle arrays or single objects
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of items) {
              // Look for @type: Recipe or a graph containing a Recipe
              if (item['@type'] === 'Recipe') {
                recipeJsonLd = item;
                break;
              }
              if (item['@graph']) {
                const recipeInGraph = item['@graph'].find((g: any) => g['@type'] === 'Recipe');
                if (recipeInGraph) {
                  recipeJsonLd = recipeInGraph;
                  break;
                }
              }
            }
          } catch (e) {
            continue;
          }
          if (recipeJsonLd) break;
        }
      }

      // 3. Prepare content for Gemini
      let contextForAi = "";
      if (recipeJsonLd) {
        console.log("✅ JSON-LD Recept gevonden!");
        contextForAi = JSON.stringify(recipeJsonLd);
      } else {
        console.log("⚠️ Geen JSON-LD gevonden, gebruik HTML tekst extractie.");
        contextForAi = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                           .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                           .replace(/<[^>]+>/g, ' ')
                           .substring(0, 15000);
      }

      // 4. Use AI to extract/translate the recipe
      const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            {
              role: "system",
              content: "Je bent een expert in het extraheren van recepten. Je antwoordt ALTIJD met uitsluitend geldige JSON. Gebruik GEEN markdown code blocks."
            },
            {
              role: "user",
              content: `Extraheer het recept uit deze data en vertaal het naar het Nederlands (België). Zorg dat het 100% veganistisch is.
              
              Data: ${contextForAi}
              
              Retourneer dit JSON formaat:
              {
                "title": "string",
                "description": "string",
                "ingredients": [{ "name": "string", "amount": "string" }],
                "instructions": ["string"],
                "cookingTime": number,
                "servings": "string (bijv. 2 personen)",
                "difficulty": "Eenvoudig" | "Gemiddeld" | "Chef",
                "cost": "Budget" | "Gemiddeld" | "Premium",
                "calories": number,
                "nutrients": { "protein": number, "carbs": number, "fat": number },
                "chefTips": ["string"]
              }`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("AI response was empty");
      }
      
      res.json({ text: content });
    } catch (error: any) {
      console.error("❌ Scrape Error:", error.message);
      res.status(500).json({ error: error.message || "Failed to scrape recipe" });
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
    const key = process.env.DEEPINFRA_API_KEY;
    if (!key) {
      console.warn("⚠️ DEEPINFRA_API_KEY is missing in environment variables!");
    } else {
      console.log(`✅ DEEPINFRA_API_KEY is configured (starts with: ${key.substring(0, 4)}...)`);
    }
  });
}

startServer();
