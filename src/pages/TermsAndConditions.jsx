import React from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <Head title="Terms and Conditions - ADHYAA PICKLES" />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p className="mb-4">
          By using our website and services, you agree to the following terms and conditions.
        </p>
        <p className="mb-4">
          We reserve the right to modify these terms at any time without prior notice.
        </p>
        <p className="mb-4">
          Please read all policies carefully before making a purchase.
        </p>
      </main>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
