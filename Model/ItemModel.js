const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  ItemName: {
    type: String,
    required: [true, "name must be provided"],
  },
  quantity: {
    type: Object,
  },
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
