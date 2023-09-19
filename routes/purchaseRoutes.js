const expense = require("express");

const router = expense.Router();

const purchaseController = require("../controllers/purchaseController");
const auth = require("../middlewares/auth");

router.post("/updatePremium", auth.authenticate, purchaseController.updatePrimium);

router.post("/updateFailedOrder", auth.authenticate, purchaseController.updateFailedOreder);

router.get("/buyPrimium", auth.authenticate, purchaseController.purchasePrimium);

module.exports = router;