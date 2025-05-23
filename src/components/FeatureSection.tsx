
import { Award, Shield, Truck } from "lucide-react";

const features = [
  {
    icon: <Award className="h-10 w-10 text-pickle-600" />,
    title: "Premium Quality",
    description: "Our pickles are made with the finest ingredients, carefully selected for optimal flavor and freshness."
  },
  {
    icon: <Shield className="h-10 w-10 text-pickle-600" />,
    title: "Natural Preservatives",
    description: "We use traditional preservation methods and natural ingredients to ensure our pickles are healthy and delicious."
  },
  {
    icon: <Truck className="h-10 w-10 text-pickle-600" />,
    title: "Fast Delivery",
    description: "We ensure quick and secure delivery to preserve the freshness and flavor of our products."
  }
];

export default function FeatureSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Why Choose Our Pickles?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what makes ADHYAA PICKLES stand out from the rest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-sm text-center flex flex-col items-center"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
