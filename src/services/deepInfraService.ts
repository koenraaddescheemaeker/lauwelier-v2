import { Recipe, Ingredient } from "../types";

export const generateRecipesFromIngredients = async (ingredients: Ingredient[], count: number = 2): Promise<Recipe[]> => {
  const ingredientNames = ingredients.map(i => i.name).join(", ");
  
  const prompt = `Genereer ${count} unieke, 100% plantaardige (veganistische) recepten op basis van de volgende ingrediënten: ${ingredientNames}. 
  Zorg voor een mix van verschillende keukens. Elk recept moet gedetailleerd zijn met stapsgewijze instructies, voedingswaarden en chef tips.
  De taal moet Nederlands (België) zijn.
  
  Retourneer een JSON object met een 'recipes' array die objecten bevat met deze structuur:
  {
    "id": "string",
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
    "chefTips": ["string"],
    "drinkPairing": "string",
    "isVegan": true,
    "isVegetarian": true,
    "orgUrl": "string (optioneel)"
  }`;

  try {
    const response = await fetch("/api/generate-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (!data.text) return [];
    
    // Verwijder eventuele Markdown code blocks (```json ... ```)
    const cleanJson = data.text.replace(/```json\n?|```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);
    const recipes: Recipe[] = parsedData.recipes || [];

    // Generate images for each recipe
    const recipesWithImages = await Promise.all(
      recipes.map(async (recipe) => {
        const imageUrl = await generateRecipeImage(recipe.title, recipe.description);
        return { ...recipe, imageUrl: imageUrl || undefined };
      })
    );

    return recipesWithImages;
  } catch (error) {
    console.error("Error generating recipes via DeepInfra:", error);
    return [];
  }
};

export const analyzeImageForIngredients = async (base64Image: string): Promise<string[]> => {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data })
    });

    const data = await response.json();
    const text = data.text;
    
    if (!text) return [];
    return text.split(",").map((item: string) => item.trim());
  } catch (error) {
    console.error("Error analyzing image via DeepInfra:", error);
    return [];
  }
};

export const generateRecipeImage = async (recipeTitle: string, description: string): Promise<string | null> => {
  try {
    const prompt = `A professional, appetizing food photography shot of ${recipeTitle}. High-end restaurant style, close-up, soft natural lighting, vibrant colors, delicious vegan meal, culinary masterpiece.`;

    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (data.b64_json) {
      return `data:image/png;base64,${data.b64_json}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating recipe image via proxy:", error);
    return null;
  }
};

export const scrapeRecipeFromUrl = async (url: string): Promise<Recipe | null> => {
  try {
    const response = await fetch("/api/scrape-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    if (!data.text) return null;
    
    const cleanJson = data.text.replace(/```json\n?|```/g, '').trim();
    const recipeData = JSON.parse(cleanJson);
    
    // Generate an ID if missing
    if (!recipeData.id) {
      recipeData.id = Math.random().toString(36).substr(2, 9);
    }
    
    // Add default flags
    recipeData.isVegan = true;
    recipeData.isVegetarian = true;

    // Generate image for the scraped recipe
    const imageUrl = await generateRecipeImage(recipeData.title, recipeData.description);
    recipeData.imageUrl = imageUrl || undefined;

    return recipeData as Recipe;
  } catch (error) {
    console.error("Error scraping recipe:", error);
    return null;
  }
};
