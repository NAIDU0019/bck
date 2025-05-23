import { useState } from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    // This would be replaced with an actual API call in a real implementation
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <>
      <Head 
        title="Contact Us - ADHYAA PICKLES"
        description="Get in touch with ADHYAA PICKLES for inquiries, feedback, or orders. We'd love to hear from you!"
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {/* Hero section */}
          <div className="hero-pattern py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                We'd love to hear from you! Reach out with any questions, feedback, or inquiries.
              </p>
            </div>
          </div>

          {/* Contact content */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-pickle-600" />
                      Visit Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground">
                      Opp to Swarnandhra College<br />
                      Seetharamapuram<br />
                      Narsapur, 534275<br />
                      India
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-pickle-600" />
                      Call Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground">
                      Customer Service: +91 **********<br />
                      Orders & Inquiries: +91 **********<br />
                      Business: +91 **********
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-pickle-600" />
                      Email Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-foreground">
                      General Inquiries: tech.adhyaapickles@gmail.com<br />
                      Customer Support: tech.adhyaapickles@gmail.com<br />
                      Orders:           tech.adhyaapickles@gmail.com
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-6">
                    Send Us a Message
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Have questions about our products, delivery, or anything else? Fill out the form, and we'll get back to you as soon as possible.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-spice-600">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-spice-600">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Your email address"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message <span className="text-spice-600">*</span></Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg">
                      Send Message
                    </Button>
                  </form>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Hours</CardTitle>
                      <CardDescription>
                        When you can reach us
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-foreground">
                          <Clock className="h-4 w-4 mr-2 text-pickle-600" />
                          Monday - Friday
                        </div>
                        <div>9:00 AM - 6:00 PM</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-foreground">
                          <Clock className="h-4 w-4 mr-2 text-pickle-600" />
                          Saturday
                        </div>
                        <div>10:00 AM - 4:00 PM</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-foreground">
                          <Clock className="h-4 w-4 mr-2 text-pickle-600" />
                          Sunday
                        </div>
                        <div>Closed</div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-8 bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Bulk Orders</h3>
                    <p className="text-muted-foreground mb-4">
                      Interested in placing a bulk order for events, restaurants, or retail? Contact our business team for special pricing and arrangements.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="mailto:business@adhyaapickles.com">Business Inquiries</a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-[16/6] w-full">
                  {/* This would be replaced with an actual Google Maps embed in a real implementation */}
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Map Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
