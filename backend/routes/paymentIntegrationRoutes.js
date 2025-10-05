const express = require("express");
const router = express.Router();
const paymentIntegrationController = require("../controllers/paymentIntegrationController");

// Stripe Checkout
router.post("/checkout", paymentIntegrationController.createCheckoutSession);

// Stripe Webhook (Achtung: RAW body parser nötig!)
router.post("/webhook", express.raw({ type: "application/json" }), paymentIntegrationController.handleWebhook);

module.exports = router;
