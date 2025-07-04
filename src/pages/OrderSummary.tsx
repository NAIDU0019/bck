import { useParams } from "react-router-dom";

const OrderSummary = () => {
  const { orderId } = useParams();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Summary</h1>
      <p className="text-gray-600">Thank you! Your order ID is <strong>{orderId}</strong>.</p>
      {/* Optionally fetch and display full order details */}
    </div>
  );
};

export default OrderSummary;
