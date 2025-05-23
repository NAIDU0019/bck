// backend/routes/orders.js (Express example)
import express from "express";
import { appendOrder } from "../googleSheetsService.js";

const router = express.Router();

router.post("/place-order", async (req, res) => {
  const {
    orderId,
    customerName,
    email,
    phone,
    address,
    items,
    total,
    paymentMethod,
    paymentStatus,
  } = req.body;

  // Basic validation
  if (!orderId || !customerName || !address || !items || !total || !paymentMethod || !paymentStatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await appendOrder({
      orderId,
      customerName,
      email,
      phone,
      address,
      items,
      total,
      paymentMethod,
      paymentStatus,
    });

    res.status(200).json({ message: "Order recorded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

export default router;
