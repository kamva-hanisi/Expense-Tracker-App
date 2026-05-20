import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
  filterTransactions,
} from "../features/transactions/transactionSlice";

const inputClass =
  "border border-[#d8dfd6] bg-[#fbfcfa] p-3 rounded-md outline-none focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/15";

const FilterBar = () => {
  const dispatch = useDispatch();

  const { searchTerm, selectedType, selectedCategory, transactions } =
    useSelector((state) => state.transactions);

  const categories = [
    ...new Set(
      transactions
        .map((transaction) => transaction.category)
        .filter(Boolean),
    ),
  ];

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleType = (e) => {
    dispatch(setSelectedType(e.target.value));
  };

  const handleCategory = (e) => {
    dispatch(setSelectedCategory(e.target.value));
  };

  useEffect(() => {
    dispatch(filterTransactions());
  }, [searchTerm, selectedType, selectedCategory, transactions, dispatch]);

  return (
    <div className="bg-white p-4 rounded-lg border border-[#dfe6dc] shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearch}
          className={inputClass}
        />

        <select
          value={selectedType}
          onChange={handleType}
          className={inputClass}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={selectedCategory}
          onChange={handleCategory}
          className={inputClass}
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
