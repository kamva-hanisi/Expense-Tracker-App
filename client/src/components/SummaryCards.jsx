import { useSelector } from "react-redux";

const SummaryCards = () => {

  const { summary } = useSelector(
    (state) => state.transactions
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Balance */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <h3 className="text-gray-500 text-lg">
          Total Balance
        </h3>

        <p className="text-3xl font-bold mt-2">
          R {summary.balance || 0}
        </p>

      </div>


      {/* Income */}
      <div className="bg-green-500 text-white p-6 rounded-2xl shadow">

        <h3 className="text-lg">
          Income
        </h3>

        <p className="text-3xl font-bold mt-2">
          R {summary.income || 0}
        </p>

      </div>


      {/* Expense */}
      <div className="bg-red-500 text-white p-6 rounded-2xl shadow">

        <h3 className="text-lg">
          Expenses
        </h3>

        <p className="text-3xl font-bold mt-2">
          R {summary.expense || 0}
        </p>

      </div>

    </div>
  );
};

export default SummaryCards;