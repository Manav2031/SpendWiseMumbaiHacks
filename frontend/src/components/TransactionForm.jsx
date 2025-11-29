import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import sampleSMS from "./sampleSMS.json";

export default function TransactionForm({ onAdd }) {
  const [transactions, setTransactions] = useState([]);
  const [importedKeys, setImportedKeys] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const authHeader = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const res = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/transactions",
          { headers: authHeader }
        );
        const fetched = res.data.map((tx) => ({
          ...tx,
          date: new Date(tx.date),
        }));
        setTransactions(fetched);

        const keys = new Set(
          fetched.map(
            (tx) => `${tx.amount}-${tx.date.toISOString()}-${tx.description}`
          )
        );
        setImportedKeys(keys);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const parseSMS = (smsText) => {
    const amountMatch = smsText.match(/Rs\.?\s?(\d+(?:\.\d+)?)/i);
    const dateMatch = smsText.match(/on (\d{2}\/\d{2}\/\d{4})/i);
    if (!amountMatch || !dateMatch) return null;

    return {
      amount: parseFloat(amountMatch[1]),
      type: /paid|sent|debited/i.test(smsText) ? "Expense" : "Income",
      category: categorizeSMS(smsText),
      date: new Date(dateMatch[1].split("/").reverse().join("-")),
      description: smsText,
    };
  };

  const categorizeSMS = (text) => {
    const categories = {
      Food: ["restaurant", "cafe", "dining", "meal"],
      Travel: ["uber", "ola", "flight", "train", "bus", "taxi"],
      Shopping: ["amazon", "flipkart", "shop", "store"],
      Bills: ["electricity", "water", "internet", "bill"],
      Groceries: ["grocery", "supermarket", "market"],
      Salary: ["salary", "credited"],
      Entertainment: ["movie", "netflix", "music", "concert"],
      Health: ["hospital", "pharmacy", "doctor"],
    };

    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((k) => lower.includes(k))) return cat;
    }
    return "Other";
  };

  const fetchAndParseSMS = async () => {
    const newTransactions = sampleSMS
      .map(parseSMS)
      .filter(Boolean)
      .filter((tx) => {
        const key = `${tx.amount}-${tx.date.toISOString()}-${tx.description}`;
        return !importedKeys.has(key);
      });

    if (newTransactions.length === 0) {
      toast.error("No new transactions to import!");
      return;
    }

    setImportedKeys((prev) => {
      const updated = new Set(prev);
      newTransactions.forEach((tx) => {
        updated.add(`${tx.amount}-${tx.date.toISOString()}-${tx.description}`);
      });
      return updated;
    });

    newTransactions.forEach((tx) => onAdd(tx));

    setTransactions((prev) => [...prev, ...newTransactions]);

    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/transactions/bulk-add",
        {
          transactions: newTransactions,
        }
      );
      toast.success(`${newTransactions.length} new transactions imported!`);
    } catch (err) {
      console.error("Error saving transactions:", err);
    }
  };
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "Expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.amount ||
      !formData.type ||
      !formData.category ||
      !formData.date
    ) {
      toast.error("Please fill all fields!");
      return;
    }
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setFormData({
      description: "",
      amount: "",
      type: "Expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300">
          Amount (Rs.)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border border-purple-200 dark:border-gray-700 bg-[#FAFAF5] dark:bg-gray-800 rounded-lg p-2.5 
          focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Enter amount"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300">
          Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border border-purple-200 dark:border-gray-700 bg-[#FAFAF5] dark:bg-gray-800 rounded-lg p-2.5 
          focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300">
          Category
        </label>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border border-purple-200 dark:border-gray-700 bg-[#FAFAF5] dark:bg-gray-800 rounded-lg p-2.5 
    focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Groceries">Groceries</option>
          <option value="Salary">Salary</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Health">Health</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-purple-200 dark:border-gray-700 bg-[#FAFAF5] dark:bg-gray-800 rounded-lg p-2.5 
          focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Short note about this transaction"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-300">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          max={new Date().toISOString().split("T")[0]}
          onChange={handleChange}
          className="w-full border border-purple-200 dark:border-gray-700 bg-[#FAFAF5] dark:bg-gray-800 rounded-lg p-2.5 
          focus:outline-none focus:ring-2 focus:ring-purple-400 dark-date"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="px-4 bg-purple-600 text-white py-2.5 rounded-lg font-semibold 
    hover:bg-purple-700 transition shadow-sm"
        >
          Add Transaction
        </button>

        <button
          onClick={fetchAndParseSMS}
          className="px-4 bg-purple-600 text-white py-2.5 rounded-lg font-semibold 
    hover:bg-purple-700 transition shadow-sm"
        >
          Auto Import SMS Transactions
        </button>
      </div>
    </form>
  );
}
