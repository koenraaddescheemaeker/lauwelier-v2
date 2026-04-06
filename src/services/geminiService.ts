import { Recipe, Ingredient } from "../types";

export const generateRecipesFromIngredients = async (ingredients: Ingredient[]): Promise<Recipe[]> => {
  const ingredientNames = ingredients.map(i => i.name).join(", ");
  
  const prompt = `Genereer 3 unieke, 100% plantaardige (veganistische) recepten op basis van de volgende ingrediënten: ${ingredientNames}. 
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
    "difficulty": "Eenvoudig" | "Gemiddeld" | "Chef",
    "cost": "Budget" | "Gemiddeld" | "Premium",
    "calories": number,
    "nutrients": { "protein": number, "carbs": number, "fat": number },
    "chefTips": ["string"],
    "drinkPairing": "string",
    "isVegan": true,
    "isVegetarian": true
  }`;

  try {
    const response = await fetch("/api/generate-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (!data.text) return [];
    
    const parsedData = JSON.parse(data.text);
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
    const prompt = `Professional food photography of ${recipeTitle}. ${description}. Vintage Kodak Portra 400 film, analog camera photo, natural film grain, shot on 35mm film. High-end culinary style, soft natural lighting, warm tones, appetizing and colorful.`;

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
