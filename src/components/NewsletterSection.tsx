
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterSection() {
  return (
    <section className="bg-pickle-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Join Our Pickle Community
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for exclusive recipes, special offers, and be the first to know about new flavors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white"
            />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from ADHYAA PICKLES.
          </p>
        </div>
      </div>
    </section>
  );
}
