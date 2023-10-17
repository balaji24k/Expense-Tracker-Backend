const Razorpay = require("razorpay");
const Order = require("../models/Orders");

require("dotenv").config();

exports.purchasePrimium = async (req, res, next) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        console.log("order failed");
        throw new Error(JSON.stringify(err));
      }

      console.log("purchase>>>>>>>", order);
      const newOrder = new Order({
        orderId: order.id,
        status: "PENDING",
        user: req.user._id,
      });
      req.user.orders.push(newOrder);

      await newOrder.save();
      await req.user.save();

      res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log("error in purchase>>>>>>", err);
    res.status(403).json({ message: "Something Went Wrong!", error: err });
  }
};

exports.updatePrimium = async (req, res, next) => {
  console.log("req body updatePrem>>>>>>>>>>", req.body);
  try {
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ orderId: order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentId = payment_id;
    order.status = "Success";
    req.user.isPremiumUser = true;

    await order.save();
    await req.user.save();

    res.status(200).json({ success: true, message: "Transaction Succesfull!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

exports.updateFailedOreder = async (req, res, next) => {
  const { order_id } = req.body;

  try {
    const order = await Order.findOne({ orderId: order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Failed";
    await order.save();

    res.status(200).json({
      message: "Order status updated to Failed",
      order: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};
