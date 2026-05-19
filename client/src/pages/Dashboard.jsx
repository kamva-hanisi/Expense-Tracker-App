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
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

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

      </div>

    </div>
  );
};

export default Dashboard;