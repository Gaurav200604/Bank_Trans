const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["active", "frozen", "closed"],
        message: "Status must be either active, frozen, or closed",
      },
      default: "active",
    },

    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

const AccountModel = mongoose.model("Account", accountSchema);

module.exports = AccountModel;