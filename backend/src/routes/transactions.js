const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

/* ------------------------------------------------------
   GET — Fetch All Transactions
------------------------------------------------------ */
router.get("/", auth, async (req, res) => {
  try {
    const tx = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(200);

    res.json(tx);
  } catch (e) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

/* ------------------------------------------------------
   POST — Add Transaction
------------------------------------------------------ */
router.post("/", auth, async (req, res) => {
  try {
    const t = await Transaction.create({ ...req.body, user: req.user.id });

    const formatted = {
      transactions: [
        {
          user_id: req.user.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category || "misc",
          date: t.date,
        },
      ],
    };

    fetch(process.env.AI_AGENT_URL + "/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formatted),
    }).catch(() => {});

    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error adding transaction" });
  }
});

/* ------------------------------------------------------
   PUT — Edit/Update Transaction
------------------------------------------------------ */
router.put("/:id", auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Ensure ownership
      req.body,
      { new: true }
    );

    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    res.json(tx);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error updating transaction" });
  }
});

/* ------------------------------------------------------
   DELETE — Delete Transaction
------------------------------------------------------ */
router.delete("/:id", auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // Ensure only the owner can delete
    });

    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    res.json({ message: "Transaction deleted", id: req.params.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

router.post("/bulk-add", async (req, res) => {
  try {
    const transactions = req.body.transactions; // array of parsed tx
    await Transaction.insertMany(transactions);
    res.status(201).json({ success: true, count: transactions.length });
  } catch (err) {
    console.error("Bulk add error:", err);
    res.status(500).json({ error: "Failed to save transactions" });
  }
});

module.exports = router;
