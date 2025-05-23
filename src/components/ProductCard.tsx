import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeVeg } from "@/components/ui/badge-veg";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Product, useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { id, name, image, type, pricePerWeight } = product;

  const weightOptions = Object.keys(pricePerWeight);
  const [selectedWeight, setSelectedWeight] = useState<string>(
    weightOptions[0] || ""
  );

  const price = pricePerWeight[selectedWeight] || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedWeight) return;
    addItem(product, selectedWeight); // passes weight to CartContext
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-md">
      <Link to={`/product/${id}`} className="overflow-hidden">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <BadgeVeg variant={type} />
        </div>
        <Link to={`/product/${id}`} className="group">
          <h3 className="font-medium text-lg mb-1 group-hover:text-pickle-600 transition-colors">
            {name}
          </h3>
        </Link>
        {weightOptions.length > 0 && (
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="mb-2 p-1 border rounded"
          >
            {weightOptions.map((w) => (
              <option key={w} value={w}>
                {w}g
              </option>
            ))}
          </select>
        )}
        <div className="mt-auto pt-4 flex justify-between items-center">
          <span className="font-semibold">{formatPrice(price)}</span>
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
