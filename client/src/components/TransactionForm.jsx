import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
  addTransaction,
  getSummary,
} from "../features/transactions/transactionSlice";

const inputClass =
  "w-full border border-[#d8dfd6] bg-[#fbfcfa] p-3 rounded-md mb-4 outline-none focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/15";

const TransactionForm = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category) {
      return toast.error("Please fill all fields");
    }

    await dispatch(addTransaction(formData));
    dispatch(getSummary());
    toast.success("Transaction added");

    setFormData({
      title: "",
      amount: "",
      type: "expense",
      category: "",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#dfe6dc] shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-[#202722]">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className={inputClass}
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className={inputClass}
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className={inputClass}
        />

        <button
          type="submit"
          className="w-full bg-[#315c48] hover:bg-[#274a3a] text-white p-3 rounded-md transition"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
