
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="hero-pattern py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Authentic Flavors, <br />
              <span className="text-pickle-700">Traditional</span> <span className="text-spice-600">Recipes</span>
            </h1>
            <p className="text-lg mb-8 max-w-xl text-muted-foreground">
              Discover the perfect blend of spices and flavors with our premium range of vegetarian and non-vegetarian pickles, crafted with care and tradition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <a href="/products">Shop Now</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/about">Our Story</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="banner.jpeg"
                alt="Assorted pickles in glass jars"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-pickle-100 rounded-full -z-0 animate-float hidden md:block"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-spice-100 rounded-full -z-0 animate-float animation-delay-1000 hidden md:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
