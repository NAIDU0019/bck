import React, { useEffect } from "react";

const RazorpayCheckout = ({ amount, customerInfo, onSuccess, onClose }) => {
  useEffect(() => {
    const loadRazorpay = () => {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = openRazorpay;
        document.body.appendChild(script);
      } else {
        openRazorpay();
      }
    };

    const openRazorpay = () => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY, // your Razorpay key
        amount: amount * 100, // amount in paise
        currency: "INR",
        name: "Your Store Name",
        description: "Order Payment",
        handler: function (response) {
          onSuccess(response);
        },
        prefill: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          contact: customerInfo.phoneNumber,
        },
        modal: {
          ondismiss: onClose,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    loadRazorpay();
  }, [amount, customerInfo, onSuccess, onClose]);

  return null; // no UI needed, Razorpay popup opens automatically
};

export default RazorpayCheckout;
