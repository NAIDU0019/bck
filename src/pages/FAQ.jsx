import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "@/components/Head";

const FAQ = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shipping usually takes 3-7 business days depending on your location."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer bulk discounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Please contact us for wholesale or bulk orders."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel my order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can cancel within 12 hours of placing the order. After that, it will be processed."
        }
      },
      {
        "@type": "Question",
        "name": "Are your pickles homemade?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our pickles are traditionally handmade with locally sourced ingredients."
        }
      }
    ]
  };

  return (
    <>
      <Head
        title="FAQ - ADHYAA PICKLES | Handmade Indian Pickles"
        description="Find answers to frequently asked questions about ADHYAA PICKLES – delivery, bulk orders, cancellations, and more."
        url="https://adhyaapickles.com/faq"
        keywords="faq, ADHYAA PICKLES, shipping, bulk orders, cancellations, handmade pickles"
      >
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>

        <section className="space-y-8">
          <article id="faq-shipping">
            <h2 className="text-xl font-semibold">1. How long does shipping take?</h2>
            <p className="text-gray-700 mt-2">
              Shipping usually takes 3-7 business days depending on your location.
            </p>
          </article>

          <article id="faq-bulk-discount">
            <h2 className="text-xl font-semibold">2. Do you offer bulk discounts?</h2>
            <p className="text-gray-700 mt-2">
              Yes! Please contact us for wholesale or bulk orders.
            </p>
          </article>

          <article id="faq-cancel-order">
            <h2 className="text-xl font-semibold">3. Can I cancel my order?</h2>
            <p className="text-gray-700 mt-2">
              You can cancel within 12 hours of placing the order. After that, it will be processed.
            </p>
          </article>

          <article id="faq-homemade">
            <h2 className="text-xl font-semibold">4. Are your pickles homemade?</h2>
            <p className="text-gray-700 mt-2">
              Yes, all our pickles are traditionally handmade with locally sourced ingredients.
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
