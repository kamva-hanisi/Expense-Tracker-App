import { useEffect } from "react";

import { useDispatch } from "react-redux";

import Navbar from "../components/Navbar";

import SummaryCards from "../components/SummaryCards";

import TransactionForm from "../components/TransactionForm";

import TransactionList from "../components/TransactionList";

import Charts from "../components/Charts";

import {
  getTransactions,
  getSummary,
} from "../features/transactions/transactionSlice";


const Dashboard = () => {

  const dispatch = useDispatch();


  useEffect(() => {

    dispatch(getTransactions());

    dispatch(getSummary());

  }, [dispatch]);


  return (
    <div className="min-h-screen bg-[#f5f7f4] text-[#202722]">

      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">

        <SummaryCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          <div className="lg:col-span-1">
            <TransactionForm />
          </div>

          <div className="lg:col-span-2">
            <TransactionList />
          </div>

        </div>

        <div className="mt-8">
          <Charts />
        </div>

      </main>

    </div>
  );
};

export default Dashboard;
