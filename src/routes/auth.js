const User = require("../models/User.js");
const express = require("express");
const router = express.Router();
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const checkJwt = require("express-jwt");

router.post("/signup", async (req, res, next) => {
  // bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  try {
    const hashedPassword = await hash(req.body.password, 5);

    const newUser = await User.create({
      email: req.body.email,
      hash: hashedPassword,
    });

    const userPayload = { email: newUser.email };
    const token = jwt.sign({ email: userPayload }, SECRET_KEY);

    res.status(200).json({
      user: { email: userPayload },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const match = await compare(req.body.password, user.hash);
      if (match) {
        const token = jwt.sign({ email: user.email }, SECRET_KEY);
        res.status(200).json({
          user: {
            email: user.email,
            token: token,
          },
        });
      } else {
        return res.status(400).json({ error: "la constraseña es incorrecta " });
      }
    } else {
      return res.status(404).json({ error: "No se encuentra ese usuario" });
    }
  } catch (error) {
    next(error);
  }
});

router.post(
  "/private",
  checkJwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
  async (req, res, next) => {
    try {
      const data = req.user;
      res.json({
        mensaje: "todo bien",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
