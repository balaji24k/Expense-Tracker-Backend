const expense = require("express");

const router = expense.Router();

const purchaseController = require("../controllers/purchaseController");
const auth = require("../middlewares/auth");

router.use(auth.authenticate);

router.post("/updatePremium", purchaseController.updatePrimium);

router.post("/updateFailedOrder", purchaseController.updateFailedOreder);

router.get("/buyPrimium", purchaseController.purchasePrimium);

module.exports = router;