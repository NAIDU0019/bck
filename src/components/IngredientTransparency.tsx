import { CheckCircle2 } from "lucide-react";

interface IngredientTransparencyProps {
  ingredients: string; // your data is a string of ingredients
}

export function IngredientTransparency({ ingredients }: IngredientTransparencyProps) {
  return (
    <div className="mt-6 flex items-center gap-2 text-sm">
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      <span>
        Ingredients: {ingredients}, <span className="font-bold">No Preservatives</span>
      </span>
    </div>
  );
}
