import { useState } from "react";

import EditTransactionModal from "./EditTransactionModal";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  deleteTransaction,
  getSummary,
} from "../features/transactions/transactionSlice";

const TransactionList = () => {
  const dispatch = useDispatch();

  const { transactions } = useSelector((state) => state.transactions);

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleDelete = async (id) => {
    await dispatch(deleteTransaction(id));

    dispatch(getSummary());

    toast.success("Transaction deleted");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center border p-4 rounded-xl"
            >
              <div>
                <h3 className="font-bold text-lg">{transaction.title}</h3>

                <p className="text-gray-500">{transaction.category}</p>
              </div>

              <div className="flex items-center gap-4">
                <p
                  className={`font-bold ${
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  R {transaction.amount}
                </p>

                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg"
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
