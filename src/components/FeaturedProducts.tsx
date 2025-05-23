
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function FeaturedProducts() {
  const [category, setCategory] = useState("all");

  const filteredProducts = category === "all" 
    ? products.slice(0, 8) 
    : products.filter(product => product.type === category).slice(0, 8);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Our Signature Pickles
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handcrafted selection of premium pickles, 
            made with authentic recipes and carefully selected ingredients.
          </p>
        </div>

        <Tabs defaultValue="all" className="mb-12">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setCategory("all")}
              >
                All Pickles
              </TabsTrigger>
              <TabsTrigger 
                value="veg" 
                onClick={() => setCategory("veg")}
              >
                Vegetarian
              </TabsTrigger>
              <TabsTrigger 
                value="non-veg" 
                onClick={() => setCategory("non-veg")}
              >
                Non-Vegetarian
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="veg" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="non-veg" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button asChild size="lg">
            <a href="/products">View All Products</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
