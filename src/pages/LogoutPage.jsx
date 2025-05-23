import { useEffect } from "react";
import { useSignOut } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const { signOut } = useSignOut();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await signOut();
      navigate("/");
    };
    doLogout();
  }, [signOut, navigate]);

  return <div>Logging out...</div>;
};

export default LogoutPage;
