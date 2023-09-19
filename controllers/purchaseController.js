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

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }

      console.log("purchase>>>>>>>",order)
      req.user
        .createOrder({ orderId: order.id, status: "PENDING" })
        .then((result) => {
          console.log("result>>>>",result);
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
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
    const order = await Order.findOne({ where: { orderId: order_id } });
    const promise1 = order.update({ paymentId: payment_id, status: "Success" });
    const promise2 = req.user.update({ isPremiumUser: true });

    Promise.all([promise1, promise2])
      .then(() => {
        return res
          .status(200)
          .json({ success: true, message: "Transaction Succesfull!" });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.updateFailedOreder = async (req, res, next) => {
  const { order_id } = req.body;

  try {
    const order = await Order.findOne({ where: { orderId: order_id } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const updatedOrder = await order.update({ status: "Failed" });
    res.status(200).json({ 
      message: "Order status updated to Failed", 
      order: updatedOrder
    });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};
