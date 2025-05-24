import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  const hasItemsInCart = false; // Replace with actual cart state logic

  if (hasItemsInCart) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>404</h1>
        <h2>Oops! Page not found</h2>
        <p>You have items in your cart, but the page you are looking for does not exist.</p>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return to Home</a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        path="/sign-up"
        routing="path"
        afterSignUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_CALLBACK_URL}
      />
    </div>
  );
};

export default SignUpPage;
