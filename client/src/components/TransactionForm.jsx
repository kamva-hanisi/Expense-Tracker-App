import { useState } from "react";

import { useDispatch } from "react-redux";

import {
  addTransaction,
  getSummary,
} from "../features/transactions/transactionSlice";


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

    await dispatch(addTransaction(formData));

    dispatch(getSummary());

    setFormData({
      title: "",
      amount: "",
      type: "expense",
      category: "",
    });
  };


  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h2 className="text-2xl font-bold mb-6">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        >
          <option value="expense">
            Expense
          </option>

          <option value="income">
            Income
          </option>
        </select>

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-lg"
        >
          Add Transaction
        </button>

      </form>

    </div>
  );
};

export default TransactionForm;