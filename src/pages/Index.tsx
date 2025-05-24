import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import FeaturedProducts from "@/components/FeaturedProducts";
// <-- import here
import TestimonialSection from "@/components/TestimonialSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Head 
        title="ADHYAA PICKLES - Premium Homemade Pickles"
        description="Discover authentic flavors with ADHYAA PICKLES. Premium quality vegetarian and non-vegetarian pickles crafted with traditional recipes."
      />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <FeatureSection />
          <FeaturedProducts />
           {/* <-- added here */}
          <TestimonialSection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
