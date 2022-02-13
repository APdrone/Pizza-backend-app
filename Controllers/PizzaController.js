const Pizza = require("../Model/pizzaModel");

exports.getAllPizza = async (req, res) => {
  try {
    const pizza = await Pizza.find();
    res.status(200).json({
      status: "success",
      data: {
        pizza,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
