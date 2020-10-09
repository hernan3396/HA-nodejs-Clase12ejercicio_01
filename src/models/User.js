const { Schema, model } = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: isEmail,
  },
  hash: {
    type: String,
    required: true,
  },
});

module.exports = model("User", userSchema);
