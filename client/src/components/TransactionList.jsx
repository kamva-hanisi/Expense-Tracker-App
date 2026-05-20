import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import EditTransactionModal from "./EditTransactionModal";
import {
  deleteTransaction,
  getSummary,
  toggleTransactionComplete,
} from "../features/transactions/transactionSlice";

const TransactionList = () => {
  const dispatch = useDispatch();
  const { filteredTransactions } = useSelector((state) => state.transactions);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleDelete = async (id) => {
    await dispatch(deleteTransaction(id));
    dispatch(getSummary());
    toast.success("Transaction deleted");
  };

  const handleComplete = (transaction) => {
    dispatch(toggleTransactionComplete(transaction.id));
    toast.success(
      transaction.completed ? "Transaction reopened" : "Transaction completed",
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-[#dfe6dc] shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-[#202722]">
        Transactions
      </h2>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <p className="text-[#66736a]">No transactions yet</p>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border p-4 rounded-lg transition ${
                transaction.completed
                  ? "border-[#cfd8cb] bg-[#eef2ec] opacity-75"
                  : "border-[#dfe6dc] bg-[#fbfcfa]"
              }`}
            >
              <div className={transaction.completed ? "line-through" : ""}>
                <h3 className="font-semibold text-lg text-[#202722]">
                  {transaction.title}
                </h3>

                <p className="text-[#66736a]">{transaction.category}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <p
                  className={`font-semibold min-w-24 ${
                    transaction.completed ? "line-through " : ""
                  }${
                    transaction.type === "income"
                      ? "text-[#2f6a4a]"
                      : "text-[#8a3b2f]"
                  }`}
                >
                  R {formatMoney(transaction.amount)}
                </p>

                <button
                  onClick={() => handleComplete(transaction)}
                  className={`px-3 py-1.5 rounded-md border transition ${
                    transaction.completed
                      ? "bg-white text-[#38443d] border-[#cfd8cb] hover:bg-[#f7f9f6]"
                      : "bg-[#315c48] hover:bg-[#274a3a] text-white border-[#315c48]"
                  }`}
                >
                  {transaction.completed ? "Undo" : "Complete"}
                </button>

                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="bg-[#e7eee9] hover:bg-[#d9e5dd] text-[#315c48] px-3 py-1.5 rounded-md border border-[#c8d7ce] transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="bg-[#f7e8e4] hover:bg-[#efd9d3] text-[#7c3529] px-3 py-1.5 rounded-md border border-[#ead0ca] transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          closeModal={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionList;
