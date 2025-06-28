import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast"; // import toast
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/xnnvlwbn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "Thank you for joining our newsletter.",
        });
        setEmail("");
      } else {
        toast({
          title: "Server Busy",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Unable to subscribe. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h2 className="text-xl font-display font-bold text-pickle-700">
                ADHYAA <span className="text-spice-600">PICKLES</span>
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4">
              Premium homemade pickles crafted with authentic recipes and the finest ingredients.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Email">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-foreground">Shop</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">Our Story</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-1">
            <h3 className="font-display font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              <li><Link to="/shipping-policy" className="text-muted-foreground hover:text-foreground">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="text-muted-foreground hover:text-foreground">Return Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-muted-foreground hover:text-foreground">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          {/* Subscribe Form */}
          <div className="md:col-span-1">
            <h3 className="font-display font-semibold mb-4">Subscribe</h3>
            <p className="text-muted-foreground mb-4">
              Join our newsletter for updates and special offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <Input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="bg-white"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* FSSAI Info */}
        <div className="text-sm text-muted-foreground mt-8 text-center">
          Licensed under FSSAI | Reg. No: <strong>20125121000401</strong> | Valid till: 26-May-2027
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-border mt-6 pt-6 text-center text-muted-foreground">
          <p>© {currentYear} ADHYAA PICKLES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
