import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeVeg } from "@/components/ui/badge-veg";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Product, useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { id, name, image, type, pricePerWeight, tags = [], description = "" } = product;

  const weightOptions = Object.keys(pricePerWeight);
  const [selectedWeight, setSelectedWeight] = useState<string>(
    weightOptions[0] || ""
  );
  const price = pricePerWeight[selectedWeight] || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedWeight) return;
    addItem(product, selectedWeight);
  };

  const renderTags = (tags: string[]) =>
    tags.map((tag) => (
      <span
        key={tag}
        className="text-xs bg-pickle-100 text-pickle-800 px-2 py-1 rounded-full capitalize"
      >
        {tag}
      </span>
    ));

  return (
    <Card className="relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg group">
      <Dialog>
        <DialogTrigger asChild>
          <button className="absolute top-2 right-2 z-10 bg-white p-1 rounded-full shadow hover:scale-105 transition">
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <img src={image} alt={name} className="w-full h-64 object-cover rounded mb-4" />
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="mb-2 text-gray-600">{description}</p>
          <div className="flex flex-wrap gap-2 mb-4">{renderTags(tags)}</div>

          <div className="flex justify-between items-center">
            <select
              value={selectedWeight}
              onChange={(e) => setSelectedWeight(e.target.value)}
              className="p-2 border rounded"
            >
              {weightOptions.map((w) => (
                <option key={w} value={w}>
                  {w}g
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAdd}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Link to={`/product/${id}`} className="overflow-hidden">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={image}
            alt={`${name} pickle`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 text-white text-sm p-4 flex flex-col justify-end transition-opacity duration-300">
            <p>{description || "Premium handcrafted pickle"}</p>
            <p className="text-xs mt-1 opacity-90">Spice level: 🌶🌶🌶</p>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
          <BadgeVeg variant={type} />
          <div className="flex flex-wrap gap-1">{renderTags(tags.slice(0, 2))}</div>
        </div>

        <Link to={`/product/${id}`} className="group">
          <h3 className="font-medium text-lg mb-1 group-hover:text-pickle-600 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center text-yellow-500 text-sm mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
          ))}
          <span className="ml-1 text-gray-500 text-xs">(120)</span>
        </div>

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
