import React, { useState } from "react";

export default function TransactionList({ transactions, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    amount: "",
    type: "",
    category: "",
    description: "",
    date: "",
  });

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCategories, setFilterCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = [...new Set(transactions.map((t) => t.category))];

  const startEdit = (tx) => {
    setEditingId(tx._id);
    setEditData({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      date: tx.date.split("T")[0],
    });
  };

  const saveEdit = () => {
    onUpdate(editingId, editData);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  if (!transactions || transactions.length === 0)
    return <p className="text-sm text-gray-500">No transactions yet.</p>;

  const filteredTransactions = transactions
    .filter((t) => (filterType ? t.type === filterType : true))
    .filter((t) =>
      filterCategories.length > 0 ? filterCategories.includes(t.category) : true
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-3 shadow w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 w-full px-1">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded bg-white dark:bg-gray-700 w-full sm:w-auto"
        >
          <option value="">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="px-4 py-2 border rounded bg-white dark:bg-gray-700 w-full sm:w-auto"
          >
            {filterCategories.length === 0
              ? "All Categories"
              : `Selected (${filterCategories.length})`}
          </button>

          {showCategoryDropdown && (
            <div className="absolute mt-2 w-48 z-20 bg-white dark:bg-gray-700 border rounded shadow p-2 max-h-48 overflow-y-auto">
              {categories.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={c}
                    checked={filterCategories.includes(c)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterCategories([...filterCategories, c]);
                      } else {
                        setFilterCategories(
                          filterCategories.filter((cat) => cat !== c)
                        );
                      }
                    }}
                  />
                  <span>{c}</span>
                </label>
              ))}

              <button
                onClick={() => setFilterCategories([])}
                className="mt-2 w-full bg-rose-500 text-white py-1 rounded"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setFilterType("");
            setFilterCategories([]);
            setFilterType("");
            setFilterCategory("");
          }}
          className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 w-full sm:w-auto"
        >
          Reset
        </button>
      </div>

      <div
        className="hidden md:grid grid-cols-6 py-3 px-2 font-semibold text-sm 
        text-purple-700 dark:text-purple-300 
        border-b bg-purple-50 dark:bg-gray-700 rounded-t"
      >
        <div>Amount</div>
        <div>Type</div>
        <div>Category</div>
        <div>Description</div>
        <div>Date</div>
        <div>Actions</div>
      </div>

      <ul className="divide-y">
        {filteredTransactions.map((t) => (
          <li
            key={t._id}
            className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 
            gap-3 items-center text-sm px-2 border-b md:border-none"
          >
            {editingId === t._id ? (
              <>
                <input
                  type="number"
                  className="border p-1 rounded"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData({ ...editData, amount: e.target.value })
                  }
                />
                <select
                  value={editData.type}
                  className="border p-1 rounded"
                  onChange={(e) =>
                    setEditData({ ...editData, type: e.target.value })
                  }
                >
                  <option>Income</option>
                  <option>Expense</option>
                </select>
                <input
                  type="text"
                  className="border p-1 rounded"
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="border p-1 rounded"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="border p-1 rounded"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={
                    t.type === "Expense"
                      ? "text-red-500 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  Rs. {t.amount.toFixed(2)}
                </div>

                <div>{t.type}</div>
                <div>{t.category}</div>
                <div>{t.description}</div>

                <div>{new Date(t.date).toLocaleDateString("en-GB")}</div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => startEdit(t)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(t._id)}
                    className="bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
