const express = require("express");

const pizzaController = require("../controllers/pizzaController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(authController.protect, pizzaController.getAllPizza);

module.exports = router;
