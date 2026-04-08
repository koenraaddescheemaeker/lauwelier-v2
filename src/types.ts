export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  category?: string;
  expiryDate?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  cookingTime: number; // in minutes
  difficulty: 'Eenvoudig' | 'Gemiddeld' | 'Chef';
  cost: 'Budget' | 'Gemiddeld' | 'Premium';
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  servings?: string;
  orgUrl?: string;
  imageUrl?: string;
  chefTips?: string[];
  drinkPairing?: string;
  isVegan: boolean;
  isVegetarian: boolean;
  tags: string[];
}

export interface UserPreferences {
  diet: 'vegan' | 'vegetarian' | 'none';
  allergies: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}
