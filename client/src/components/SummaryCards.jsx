import { useSelector } from "react-redux";

const SummaryCards = () => {
  const { summary } = useSelector((state) => state.transactions);

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg border border-[#dfe6dc] shadow-sm">
        <h3 className="text-[#66736a] text-sm font-medium uppercase tracking-wide">
          Total Balance
        </h3>

        <p className="text-3xl font-semibold mt-2 text-[#202722]">
          R {formatMoney(summary.balance)}
        </p>
      </div>

      <div className="bg-[#e5f3ea] text-[#24533d] p-6 rounded-lg border border-[#c9dfd0] shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-wide">Income</h3>

        <p className="text-3xl font-semibold mt-2">
          R {formatMoney(summary.income)}
        </p>
      </div>

      <div className="bg-[#f7e8e4] text-[#7c3529] p-6 rounded-lg border border-[#ead0ca] shadow-sm">
        <h3 className="text-sm font-medium uppercase tracking-wide">
          Expenses
        </h3>

        <p className="text-3xl font-semibold mt-2">
          R {formatMoney(summary.expense)}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
