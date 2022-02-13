const mongoose = require("mongoose");

const PizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name must be provided"],
  },
  description: {
    type: String,
  },
  quantity: {
    type: String,
  },
  img: {
    type: String,
  },
});

const Pizza = mongoose.model("Pizza", PizzaSchema);

module.exports = Pizza;
