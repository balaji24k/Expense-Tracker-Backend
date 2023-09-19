const expense = require("express");

const router = expense.Router();

const expenseController = require("../controllers/expenseControllers");
const auth = require("../middlewares/auth");

router.post("/", auth.authenticate, expenseController.postData);

router.get("/", auth.authenticate, expenseController.getData);

router.delete("/:id",auth.authenticate, expenseController.deleteData);

router.put("/:id", auth.authenticate, expenseController.updateData);

module.exports = router;