const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: "success",

      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",

      msg: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);
    //1) check if email and password exist in the request body
    if (!email || !password) {
      return res.status(400).json({
        status: "failure",
        //we will pass down the token
        msg: "Please provide correct username/password",
      });
    }

    //2) check if user exists and password is correct

    const user = await User.findOne({ email });
    // console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "failure",
        //we will pass down the token
        msg: "Please provide correct username/password",
      });
    }

    //3) if everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      //we will pass down the token
      msg: "Please provide correct username/password",
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "failure",
        //we will pass down the token
        msg: "You are not logged in! Please log in to get access",
      });
    }
    // console.log("token");
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log("decoded ::", decoded);
    const currentUser = await User.findById(decoded.id);
    // console.log("currentUser ::", currentUser);
    if (!currentUser) {
      return res.status(401).json({
        status: "failure",
        //we will pass down the token
        msg: "the user belonging to this token doesnt exist",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: "failure",
      //we will pass down the token
      msg: err,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    //1)get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({
        status: "failure",
        msg: "There is no user with email address",
      });
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3) send it user's email

    const resetURL = `${req.protocol}:127.0.0.1:3000/resetPassword/${resetToken}`;

    const message = `Forgot your Password? Submit a PATCH request with your new password and passwordConfirm to :${resetURL}\n 
                  If you didnt forgot your password, please ignore this email!`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 30 min)",
        message,
      });
      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      // console.log(err);
      res.status(500).json({
        status: "failure",
        msg: "There was an error sending the email. Try again later",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "failure",
      msg: err,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on token

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2) if token has not expired and there is user
    if (!user) {
      return res.status(400).json({
        status: "failure",
        //we will pass down the token
        msg: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // update changepasswordAt property for the user:

    // log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "failure",
      msg: err,
    });
  }
};
