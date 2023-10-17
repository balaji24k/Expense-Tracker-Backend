const expense = require("express");

const router = expense.Router();

const expenseController = require("../controllers/expenseControllers");
const auth = require("../middlewares/auth");

router.use(auth.authenticate);

router.post("/", expenseController.postData);

router.get("/", expenseController.getData);

router.delete("/:id", expenseController.deleteData);

router.put("/:id", expenseController.updateData);

module.exports = router;