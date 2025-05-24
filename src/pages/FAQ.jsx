import React from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FAQ = () => {
  return (
    <>
      <Head title="FAQ - ADHYAA PICKLES" />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">1. How long does shipping take?</h2>
          <p className="text-gray-700 mt-2">
            Shipping usually takes 3-7 business days depending on your location.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">2. Do you offer bulk discounts?</h2>
          <p className="text-gray-700 mt-2">Yes! Please contact us for wholesale or bulk orders.</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">3. Can I cancel my order?</h2>
          <p className="text-gray-700 mt-2">
            You can cancel within 12 hours of placing the order. After that, it will be processed.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">4. Are your pickles homemade?</h2>
          <p className="text-gray-700 mt-2">
            Yes, all our pickles are traditionally handmade with locally sourced ingredients.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
