export type UserFavoriteRecipe ={
  title: string
  description: string
  totalTime: string
  calories: number
  serves: number
  difficulty: string
  imageUrl: string
  videoUrl: string
  cuisine: string
  mealType: string
  steps: Step[]
  ingredients: Ingredient[]
  favoritedByUser: FavoritedByUser[]
  id: number
}

export interface Step {
  recipeId: number
  description: string
  recipe: any
  id: number
}

export interface Ingredient {
  recipeId: number
  name: string
  recipe: any
  ingredientProducts: any[]
  id: number
}

export interface FavoritedByUser {
  appUserId: string
  user: any
  recipeId: number
  recipe: any
  id: number
}
