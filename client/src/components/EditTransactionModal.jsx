import { useState } from "react";

import { useDispatch } from "react-redux";

import {
  updateTransaction,
  getSummary,
} from "../features/transactions/transactionSlice";

import toast from "react-hot-toast";


const EditTransactionModal = ({
  transaction,
  closeModal,
}) => {

  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
  });


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    await dispatch(
      updateTransaction({
        id: transaction.id,
        updatedData: formData,
      })
    );

    dispatch(getSummary());

    toast.success("Transaction updated");

    closeModal();
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-2xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6">
          Edit Transaction
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <input
            type="number"
            name="amount"
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
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <div className="flex gap-4">

            <button
              type="submit"
              className="flex-1 bg-black text-white p-3 rounded-lg"
            >
              Save
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-300 p-3 rounded-lg"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditTransactionModal;