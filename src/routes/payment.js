const express = require("express");
const { userAuth } = require("../middlewares/auth");

const paymentRouter = express.Router();

const razorpayInstance = require("../utils/razorpay");

const Payment = require("../models/payment");

const {membershipPlans} = require("../utils/constants");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {

  const {membershipType} = req.body;

  const {firstName, lastName, emailId} = req.user;

  try {
    const order = await razorpayInstance.orders.create({
      amount: membershipPlans[membershipType],
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        emailId : emailId,
        membershipType: membershipType
      }
    });

    const payment = new Payment({
      userId : req.user._id,
      orderId : order.id,
      amount : order.amount,
      currency : order.currency,
      notes : order.notes,
      status : order.status
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId : process.env.RAZORPAY_KEY_ID});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = paymentRouter;