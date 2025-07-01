import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhonePeRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = localStorage.getItem("phonepe_orderId");
    if (orderId) {
      navigate(`/success/${orderId}`);
    } else {
      navigate("/"); // fallback
    }
  }, [navigate]);

  return <p>Redirecting...</p>;
};

export default PhonePeRedirectHandler;
