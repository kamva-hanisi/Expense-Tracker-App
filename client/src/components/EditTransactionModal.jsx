import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
  updateTransaction,
  getSummary,
} from "../features/transactions/transactionSlice";

const inputClass =
  "w-full border border-[#d8dfd6] bg-[#fbfcfa] p-3 rounded-md mb-4 outline-none focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/15";

const EditTransactionModal = ({ transaction, closeModal }) => {
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
      }),
    );

    dispatch(getSummary());
    toast.success("Transaction updated");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-[#16211c]/55 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md border border-[#dfe6dc] shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-[#202722]">
          Edit Transaction
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            type="number"
            name="amount"
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
            value={formData.category}
            onChange={handleChange}
            className={inputClass}
          />

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-[#315c48] hover:bg-[#274a3a] text-white p-3 rounded-md transition"
            >
              Save
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-[#eef2ec] hover:bg-[#e1e8df] text-[#38443d] p-3 rounded-md border border-[#d8dfd6] transition"
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
