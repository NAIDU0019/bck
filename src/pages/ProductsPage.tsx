import { useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Filter } from "lucide-react";
import { products } from "@/data/products";

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOption, setSortOption] = useState("featured");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesType = selectedType === "all" || product.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-low") {
      return a.pricePerWeight["250"] - b.pricePerWeight["250"];
    } else if (sortOption === "price-high") {
      return b.pricePerWeight["250"] - a.pricePerWeight["250"];
    } else if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // "featured" or default: no change in order
      return 0;
    }
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "fruit", name: "Fruit Pickles" },
    { id: "vegetable", name: "Vegetable Pickles" },
    { id: "non-veg", name: "Non-Veg Pickles" },
  ];

  const types = [
    { id: "all", name: "All Types" },
    { id: "veg", name: "Vegetarian" },
    { id: "non-veg", name: "Non-Vegetarian" },
  ];

  return (
    <>
      <Helmet>
        <title>Shop - ADHYAA PICKLES</title>
        <meta
          name="description"
          content="Browse our premium collection of vegetarian and non-vegetarian pickles."
        />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Our Products
              </h1>
              <p className="text-muted-foreground">
                Discover our range of premium handcrafted pickles
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters sidebar */}
              <div className="lg:w-1/4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Search</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Button
                            variant="ghost"
                            className={`justify-start px-2 w-full ${
                              selectedCategory === category.id
                                ? "text-pickle-700 font-medium"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {category.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Type</h3>
                    <div className="space-y-2">
                      {types.map((type) => (
                        <div key={type.id} className="flex items-center">
                          <Button
                            variant="ghost"
                            className={`justify-start px-2 w-full ${
                              selectedType === type.id
                                ? "text-pickle-700 font-medium"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => setSelectedType(type.id)}
                          >
                            {type.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product grid */}
              <div className="lg:w-3/4">
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Showing {sortedProducts.length} products
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      Sort by:
                    </span>
                    <select
                      className="text-sm border rounded-md px-2 py-1"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                    <h3 className="text-xl font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedType("all");
                        setSortOption("featured");
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
