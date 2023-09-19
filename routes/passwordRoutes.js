const expense = require("express");
const router = expense.Router();

const passwordController = require("../controllers/passwordController");

router.post("/forgotPassword", passwordController.forgotPassword);

router.get("/resetPassword/:id", passwordController.resetPassword);

router.post("/updatePassword/:resetPasswordId", passwordController.updatePassword);


module.exports = router;