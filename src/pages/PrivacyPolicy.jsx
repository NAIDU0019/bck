import React from "react";
import Head from "@/components/Head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Head title="Privacy Policy - ADHYAA PICKLES" />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">
          We value your privacy and ensure your personal information is securely handled.
        </p>
        <p className="mb-4">
          We do not share your data with third parties without your consent.
        </p>
        <p className="mb-4">
          Cookies and tracking technologies are used to improve your experience on our site.
        </p>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
