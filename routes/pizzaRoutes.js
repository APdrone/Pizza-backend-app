const express = require("express");

const pizzaController = require("../Controllers/PizzaController");
const authController = require("../Controllers/authController");

const router = express.Router();

router.route("/").get(authController.protect, pizzaController.getAllPizza);

module.exports = router;
