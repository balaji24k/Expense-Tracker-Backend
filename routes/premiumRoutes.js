const expense = require("express");
const router = expense.Router();

const premiumController = require("../controllers/premiumController");
const auth = require("../middlewares/auth");

router.use(auth.authenticate);

router.get("/showLeaderboard", premiumController.showLeaderboard);

router.get("/download", premiumController.downloadExpenses);

router.get("/getDownloadList", premiumController.getDownloadList);

module.exports = router;