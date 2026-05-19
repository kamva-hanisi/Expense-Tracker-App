import { useSelector } from "react-redux";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const Charts = () => {

  const { summary } = useSelector(
    (state) => state.transactions
  );

  const data = [
    {
      name: "Income",
      value: summary.income || 0,
    },
    {
      name: "Expense",
      value: summary.expense || 0,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444"];


  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h2 className="text-2xl font-bold mb-6">
        Financial Overview
      </h2>

      <div className="w-full h-[400px]">

        <ResponsiveContainer>

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              outerRadius={140}
              label
            >

              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default Charts;