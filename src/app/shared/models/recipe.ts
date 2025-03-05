import { Ingredient } from "./ingredient";
import { Step } from "./step";

export type Recipe = {
    id: number;
    title: string;
    description: string;
    totalTime : string;
    calories: number;
    serves: number;
    difficulty: string;
    imageUrl: string;
    videoUrl: string;
    cuisine: string;
    mealType : string;
    ingredients: Ingredient[];
    steps: Step[];
}