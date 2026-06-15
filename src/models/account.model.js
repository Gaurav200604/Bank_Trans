const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
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

    balance: {
      type: Number,
      required: [true, "Balance is required"],
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ user: 1, status: 1 });


const AccountModel = mongoose.model("Account", accountSchema);

module.exports = AccountModel;
