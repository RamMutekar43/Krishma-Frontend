import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AdminLayout from "./../components/AdminLayout"; // Import the AdminLayout component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      const scrollY = window.scrollY; // Preserve scroll position
      fetchOrders().then(() => window.scrollTo(0, scrollY));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <p className="text-center text-lg font-semibold text-indigo-600 mt-10">
          Loading dashboard data...
        </p>
      </AdminLayout>
    );

  // Aggregate Data
  const productSales = {};
  const orderStatusCount = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const profitData = {};

  orders.forEach((order) => {
    orderStatusCount[order.status] = (orderStatusCount[order.status] || 0) + 1;
    order.items.forEach((item) => {
      // Aggregate quantity
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;

      // Simulate costPrice if not present
      const costPrice = item.costPrice || item.price * 0.8; // assume 20% margin by default
      const profit = (item.price - costPrice) * item.quantity;

      profitData[item.name] = (profitData[item.name] || 0) + profit;
    });
  });

  const colorPalette = ["#f87171", "#34d399", "#60a5fa", "#facc15", "#a78bfa", "#f472b6"];

  const exportCSV = () => {
    let csv =
      "Order ID,Product,Quantity,Price Per Unit,Total,Customer Name,Email,Phone,Address,Payment Method,Order Date,Status\n";
    orders.forEach((order) => {
      order.items.forEach((item) => {
        csv += `${order.id},${item.name},${item.quantity},${item.price},${(
          item.price * item.quantity
        ).toFixed(2)},${order.customer?.name},${order.customer?.email},${order.customer?.phone},${
          order.customer?.address
        },${order.paymentMethod || "Cash"},${order.orderDate},${order.status}\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sales_dashboard.csv");
  };

  // Wrapped main content in AdminLayout
  return (
    <AdminLayout>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
        {/* Header */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-600 tracking-tight">
            📊 Sales Dashboard
          </h1>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
            onClick={exportCSV}
          >
            Export CSV
          </Button>
        </div>

        {/* Sales per Product */}
        <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-[360px]">
          <Label className="mb-2 font-semibold text-base text-gray-700 block text-center">
            Sales per Product
          </Label>
          <div className="h-[280px]">
            <Bar
              data={{
                labels: Object.keys(productSales),
                datasets: [
                  {
                    label: "Units Sold",
                    data: Object.values(productSales),
                    backgroundColor: colorPalette.slice(
                      0,
                      Object.keys(productSales).length
                    ),
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: "Units Sold per Product",
                    font: { size: 15, weight: "bold" },
                  },
                },
                scales: {
                  x: { ticks: { color: "#6b7280" }, grid: { display: false } },
                  y: { ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } },
                },
                animation: false,
              }}
            />
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-[360px] flex flex-col items-center justify-center">
          <Label className="mb-2 font-semibold text-base text-gray-700 text-center">
            Orders by Status
          </Label>
          <div className="w-[250px] h-[250px]">
            <Doughnut
              data={{
                labels: ["Pending", "Shipped", "Delivered", "Cancelled"],
                datasets: [
                  {
                    label: "Order Status",
                    data: [
                      orderStatusCount.pending,
                      orderStatusCount.shipped,
                      orderStatusCount.delivered,
                      orderStatusCount.cancelled,
                    ],
                    backgroundColor: ["#facc15", "#60a5fa", "#34d399", "#f87171"],
                    hoverOffset: 8,
                    borderWidth: 2,
                    borderColor: "#fff",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  title: {
                    display: true,
                    text: "Orders by Status",
                    font: { size: 15, weight: "bold" },
                  },
                },
                animation: false,
              }}
            />
          </div>
        </div>

        {/* Profit & Loss Chart */}
        <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-[360px]">
          <Label className="mb-2 font-semibold text-base text-gray-700 block text-center">
            Profit & Loss per Product
          </Label>
          <div className="h-[280px]">
            <Bar
              data={{
                labels: Object.keys(profitData),
                datasets: [
                  {
                    label: "Profit (+)",
                    data: Object.values(profitData).map((v) => (v > 0 ? v : 0)),
                    backgroundColor: "#34d399",
                    borderRadius: 6,
                  },
                  {
                    label: "Loss (-)",
                    data: Object.values(profitData).map((v) => (v < 0 ? Math.abs(v) : 0)),
                    backgroundColor: "#f87171",
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: "Profit and Loss per Product",
                    font: { size: 15, weight: "bold" },
                  },
                },
                scales: {
                  x: { ticks: { color: "#6b7280" }, grid: { display: false } },
                  y: { ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } },
                },
                animation: false,
              }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}