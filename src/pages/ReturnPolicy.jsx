
// src/pages/ReturnAndRefundPolicy.tsx

import React from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnPolicy = () => {
  return (
    <>
      <Head
        title="Return & Refund Policy - ADHYAA PICKLES"
        description="Read our detailed Return and Refund Policy to understand how ADHYAA PICKLES handles returns, refunds, and replacements for damaged, incorrect, or missing orders."
      />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 font-display">
          Return & Refund Policy
        </h1>
        <p className="text-lg text-muted-foreground mb-6 text-center">
          At ADHYAA PICKLES, your satisfaction is our top priority. Please read our Return & Refund Policy to understand the terms and conditions for returns, refunds, and replacements.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Eligibility for Returns & Refunds</h2>
          <p className="mb-2">
            We have a 7-day return policy. Due to the perishable nature of our homemade pickles, returns and refunds are applicable only under these conditions:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Damaged Product:</strong> If the product is delivered in a damaged or tampered condition.</li>
            <li><strong>Incorrect Product:</strong> If you receive the wrong product.</li>
            <li><strong>Missing Items:</strong> If items from your order are missing.</li>
          </ul>
          <p className="mb-2"><strong>We do not offer refunds/returns for:</strong></p>
          <ul className="list-disc ml-6">
            <li>Change of mind after delivery.</li>
            <li>Opened, consumed, or improperly stored products.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. Timeframe to Report Issues</h2>
          <p>
            All issues must be reported within <strong>24 hours</strong> of receiving the order. Delayed claims may not be entertained.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. How to Initiate a Return/Refund</h2>
          <ol className="list-decimal ml-6 space-y-2">
            <li>
              <strong>Contact Us:</strong> Email us at <a href="mailto:tech.adhyaapickles@gmail.com" className="text-blue-600 underline">tech.adhyaapickles@gmail.com</a> or call <a href="tel:7995960659" className="text-blue-600 underline">7995960659</a>.
            </li>
            <li>
              <strong>Include Details:</strong>
              <ul className="list-disc ml-6">
                <li>Order number</li>
                <li>Description of the issue</li>
                <li>Clear images or videos as proof</li>
                <li>Your contact information</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">4. Review & Approval</h2>
          <ul className="list-disc ml-6">
            <li>All claims will be reviewed within <strong>2–3 business days</strong>.</li>
            <li>You may be contacted for additional information.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">5. Refund or Replacement</h2>
          <p className="mb-2">
            Once approved, we offer:
          </p>
          <ul className="list-disc ml-6">
            <li><strong>Replacement:</strong> A free replacement of the affected product.</li>
            <li><strong>Refund:</strong> Full refund to your original payment method.</li>
            <li><strong>Timeline:</strong> Refunds are credited within <strong>7–10 business days</strong>. Replacements are processed within <strong>7 business days</strong>.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">6. Shipping Costs</h2>
          <p>
            If the return is due to our error (damaged, incorrect, or missing items), we will cover the return shipping cost.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <ul className="list-disc ml-6">
            <li><strong>Email:</strong> <a href="mailto:tech.adhyaapickles@gmail.com" className="text-blue-600 underline">tech.adhyaapickles@gmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:7995060659" className="text-blue-600 underline">7995060659</a></li>
            <li><strong>Address:</strong> YENDAPALLI, KRUTHIVENNU MANDAL, KRISHNA DISTRICT, 521324</li>
          </ul>
        </section>

        <p className="text-lg text-center mt-12 text-muted-foreground">
          <strong>Thank you for choosing ADHYAA PICKLES. We appreciate your trust and strive to provide the best homemade pickle experience!</strong>
        </p>
      </main>
      <Footer />
    </>
  );
};

export default ReturnPolicy;

