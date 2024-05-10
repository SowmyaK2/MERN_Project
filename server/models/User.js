const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  sno: {
    type: Number,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
  Pwd: {
    type: String,
    required: true,
  },
});

// Define pre-save middleware to auto-increment f_sno field
userSchema.pre("save", async function (next) {
  if (!this.sno) {
    const lastUser = await this.constructor.findOne(
      {},
      {},
      { sort: { sno: -1 } }
    ); // Find last user document
    this.sno = lastUser ? lastUser.sno + 1 : 1; // Set f_sno to last sno + 1 or 1 if no users exist
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
