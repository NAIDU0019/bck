import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <SignIn
      path="/sign-in"
      routing="path"
      afterSignInUrl={import.meta.env.VITE_CLERK_SIGN_IN_CALLBACK_URL}
    />
  </div>
);

export default SignInPage;
