import { useLocation, useNavigate } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useEffect } from "react";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if this is sign-up page
  const isSignUp = location.pathname.startsWith("/sign-up");

  // Extract redirectTo param from URL query
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirectTo") || "/dashboard";

  // After sign-in/up, Clerk's onSuccess will call this to navigate
  const handleSuccess = () => {
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {isSignUp ? (
        <SignUp
          path="/sign-up"
          routing="path"
          afterSignUpUrl={redirectTo}
          // onSuccess callback to handle navigation after sign up
          onSuccess={handleSuccess}
        />
      ) : (
        <SignIn
          path="/sign-in"
          routing="path"
          afterSignInUrl={redirectTo}
          // onSuccess callback to handle navigation after sign in
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AuthPage;
