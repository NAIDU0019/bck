
import { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    content: "The mango pickle reminds me of my grandmother's recipe. The authentic taste and perfect blend of spices makes it my family's favorite!",
    rating: 5
  },
  {
    name: "Rajesh Verma",
    location: "Mumbai",
    content: "I've tried many pickle brands, but ADHYAA's non-veg pickles are truly exceptional. The fish pickle has the perfect balance of spice and tang.",
    rating: 5
  },
  {
    name: "Ananya Patel",
    location: "Ahmedabad",
    content: "The lemon pickle is outstanding! It's the perfect accompaniment to our meals. Will definitely order more varieties soon.",
    rating: 4
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    content: "The chicken pickle is incredible - full of flavor and not overpowering. The packaging keeps it fresh for months. Highly recommended!",
    rating: 5
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. See what our happy customers have to say about our pickles.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <Card className="border-0 shadow-sm h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-foreground mb-4 flex-grow">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-6">
            <CarouselPrevious className="static transform-none mx-2" />
            <CarouselNext className="static transform-none mx-2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
