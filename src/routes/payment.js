const express = require("express");
const { userAuth } = require("../middlewares/auth");

const paymentRouter = express.Router();

const razorpayInstance = require("../utils/razorpay");

const Payment = require("../models/payment");

const { membershipPlans } = require("../utils/constants");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  const { membershipType } = req.body;

  const { firstName, lastName, emailId } = req.user;

  try {
    const order = await razorpayInstance.orders.create({
      amount: membershipPlans[membershipType],
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        emailId: emailId,
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      status: order.status,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebHookValid) {
      return res
        .status(400)
        .json({ message: "payment webhook is not valid !" });
    }

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    payment.status = paymentDetails.status;

    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    console.log(user);
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    // if(req.body.event === "payment.captured"){  // These are certain events which we can utilise to perform some code or action.

    // }

    // if(req.body.event == "payment.failed"){

    // }

    return res.status(200).json({ message: "WebHook recieved successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user.toJSON();
    if (user.isPremium) {
      return res.json({ isPremium: true });
    }
    return res.json({ isPremium: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = paymentRouter;
