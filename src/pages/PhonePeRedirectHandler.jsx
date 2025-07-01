import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PhonePeRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("orderId");

    if (orderId) {
      navigate(`/success/${orderId}`);
    } else {
      navigate("/"); // fallback
    }
  }, [navigate, location]);

  return <p>Redirecting...</p>;
};

export default PhonePeRedirectHandler;
