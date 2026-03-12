"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPortfolios();
    }
  }, [status, router]);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch("/api/portfolios");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex min-h-screen items-center justify-center p-8 bg-gray-50">Loading Dashboard...</div>;
  }

  // Calculate mock or real totals from portfolios
  const totalValue = portfolios.reduce((acc, p) => 
    acc + p.assets.reduce((sum: number, a: any) => sum + (a.quantity * (a.latestPrice || a.averagePrice)), 0)
  , 0);

  const totalInvested = portfolios.reduce((acc, p) => 
    acc + p.assets.reduce((sum: number, a: any) => sum + (a.quantity * a.averagePrice), 0)
  , 0);

  const profitLoss = totalValue - totalInvested;
  const returnPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  // Mock allocation data for chart
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
  const allocationMap: Record<string, number> = {};
  portfolios.forEach(p => {
    p.assets.forEach((a: any) => {
      const value = a.quantity * (a.latestPrice || a.averagePrice);
      allocationMap[a.type] = (allocationMap[a.type] || 0) + value;
    });
  });

  const chartData = Object.keys(allocationMap).map((key) => ({
    name: key,
    value: allocationMap[key],
  }));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <button
            onClick={() => router.push("/api/auth/signout")}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
          >
            Sign out
          </button>
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Portfolio Value</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">₹{totalValue.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Invested Amount</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">₹{totalInvested.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Profit / Loss</h3>
            <p className={`mt-2 text-3xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Return Percentage</h3>
            <p className={`mt-2 text-3xl font-bold ${returnPct >= 0 ? "text-green-600" : "text-red-600"}`}>
              {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* content area */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Charts */}
          <div className="col-span-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Asset Allocation</h3>
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                No assets added yet to visualize allocation
              </div>
            )}
          </div>

          {/* Portfolios List */}
          <div className="col-span-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Your Portfolios</h3>
              <button 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => alert("Create Portfolio Dialog would open here.")}
              >
                + Create Portfolio
              </button>
            </div>
            {portfolios.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {portfolios.map((p) => (
                  <li key={p.id} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-indigo-600">{p.name}</p>
                      <div className="ml-2 flex shrink-0">
                        <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          {p.assets.length} assets
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {p.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-4">You have not created any portfolios yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
