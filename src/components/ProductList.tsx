// src/components/ProductList.tsx

import { products } from "@/data/products";
import { IngredientTransparency } from "@/components/IngredientTransparency";

export default function ProductList() {
  return (
    <div className="space-y-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded-md shadow-sm"
        >
          <h2 className="font-semibold text-xl">{product.name}</h2>
          <p className="mt-2 text-gray-700">{product.description}</p>
          <IngredientTransparency ingredients={product.ingredients} />
          <p className="mt-2 italic text-xs text-gray-500">
            Consumer Trend: 78% prioritize clean-label products [IFIC].
          </p>
        </div>
      ))}
    </div>
  );
}
