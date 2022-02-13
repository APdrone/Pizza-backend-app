const Item = require("../model/ItemModel");

exports.getAllItem = async (req, res) => {
  try {
    const Items = await Item.find();
    res.status(200).json({
      status: "success",
      data: {
        Items,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
