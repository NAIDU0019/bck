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
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "March 15, 2025",
    content: "The mango pickle truly takes me back to my grandmother's kitchen. Every bite bursts with authentic flavors and love — my family can't get enough!",
    rating: 5,
  },
  {
    name: "Rajesh Verma",
    location: "Mumbai",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    date: "April 2, 2025",
    content: "ADHYAA's fish pickle is unlike anything I've tasted before — perfectly spicy, tangy, and fresh. I’m hooked!",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    location: "Ahmedabad",
    photo: "https://randomuser.me/api/portraits/women/54.jpg",
    date: "February 20, 2025",
    content: "The lemon pickle adds a zing to every meal. Can't wait to try more varieties. Highly recommend for pickle lovers!",
    rating: 4,
  },
  {
    name: "Vikram Singh",
    location: "Jaipur",
    photo: "https://randomuser.me/api/portraits/men/33.jpg",
    date: "January 10, 2025",
    content: "The chicken pickle is perfectly balanced — flavorful without overpowering. The packaging keeps it fresh for months. Top-notch quality!",
    rating: 5,
  }
];

export default function TestimonialSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-yellow-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-yellow-700">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">
            Don't just take our word for it. Hear from real people who love our pickles.
          </p>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3 transition-transform duration-500 hover:scale-[1.03]"
              >
                <div className="p-4">
                  <Card className="border-0 shadow-lg h-full flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4 gap-4">
                        <img
                          src={testimonial.photo}
                          alt={`${testimonial.name} photo`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400"
                          loading="lazy"
                        />
                        <div>
                          <p className="font-semibold text-yellow-700">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                          <p className="text-xs text-yellow-500 italic">{testimonial.date}</p>
                        </div>
                      </div>

                      <div className="flex mb-4 space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 transition-colors ${
                              i < testimonial.rating
                                ? "text-yellow-500 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-foreground mb-6 flex-grow leading-relaxed text-lg font-serif italic">
                        “{testimonial.content}”
                      </p>

                      <div>
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                          Verified Buyer
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex justify-center mt-6 gap-4">
            <CarouselPrevious className="static transform-none mx-2 p-2 bg-yellow-200 rounded-full hover:bg-yellow-300 transition" />
            <CarouselNext className="static transform-none mx-2 p-2 bg-yellow-200 rounded-full hover:bg-yellow-300 transition" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
