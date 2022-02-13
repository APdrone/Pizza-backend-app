const express = require("express");

const itemController = require("../controllers/ItemController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(authController.protect, itemController.getAllItem);

module.exports = router;
