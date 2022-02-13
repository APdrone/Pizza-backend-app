const express = require("express");

const pizzaRouter = require("./routes/pizzaRoutes");
const ItemRouter = require("./routes/itemRoutes");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api/v1/pizzas", pizzaRouter);
app.use("/api/v1/items", ItemRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
