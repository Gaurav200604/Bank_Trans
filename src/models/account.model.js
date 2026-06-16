const mongoose = require("mongoose");
const LedgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
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

// Compound index
accountSchema.index({ user: 1, status: 1 });

/**
 * Calculate account balance from ledger entries
 */
accountSchema.methods.getBalance = async function () {
  const balanceData = await LedgerModel.aggregate([
    {
      $match: {
        account: this._id,
      },
    },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "debit"] },
              "$amount",
              0,
            ],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "credit"] },
              "$amount",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
      _id: 0,
      balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      }
    }
  ]);

  if (!balanceData || balanceData.length === 0) {
    return 0;
  }

  return balanceData[0].balance;
   

  const data = balanceData[0] || {
    totalDebit: 0,
    totalCredit: 0,
  };

  return {
    totalDebit: data.totalDebit,
    totalCredit: data.totalCredit,
    balance: data.totalCredit - data.totalDebit,
  };
};

/**
 * Update stored balance field from ledger
 */
accountSchema.methods.syncBalance = async function () {
  const { balance } = await this.getBalance();

  this.balance = balance;
  await this.save();

  return balance;
};

const AccountModel = mongoose.model("Account", accountSchema);

module.exports = AccountModel;