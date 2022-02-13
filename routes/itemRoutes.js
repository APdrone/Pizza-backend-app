const express = require("express");

const itemController = require("../Controllers/ItemController");
const authController = require("../Controllers/authController");

const router = express.Router();

router.route("/").get(authController.protect, itemController.getAllItem);

module.exports = router;
