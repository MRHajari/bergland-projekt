const Stripe = require("stripe");
const { Payment } = require("../models"); // dein Sequelize Model
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
    try {
        const { items, userId } = req.body;
        // items = [{ name, price, quantity }]
        // userId = ID des eingeloggten Users (kommt aus Frontend oder JWT)

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items provided for checkout" });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: "eur",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100) // Euro -> Cent
            },
            quantity: item.quantity || 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:4200/cart?status=success",
            cancel_url: "http://localhost:4200/cart?status=cancel",
            metadata: {
                userId: userId || "guest"
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Stripe session error", error });
    }
};

// Handle Stripe Webhook (wird von Stripe aufgerufen nach Zahlung)
exports.handleWebhook = async (req, res) => {
    try {
        const sig = req.headers["stripe-signature"];
        const event = stripe.webhooks.constructEvent(
            req.rawBody,   // ACHTUNG: express.json() darf hier nicht normal sein!
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            // Speichere Payment in deiner DB
            await Payment.create({
                userId: session.metadata.userId || null,
                amount: session.amount_total / 100,
                currency: session.currency,
                status: "paid",
                provider: "stripe",
                providerPaymentId: session.id
            });

            console.log("✅ Payment saved in DB for session:", session.id);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
