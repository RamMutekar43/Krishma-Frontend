import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaDollarSign, FaShoppingCart, FaBoxOpen, FaUsers } from "react-icons/fa";
import AdminLayout from "./../components/AdminLayout"; // Import the Layout component

const API_BASE = "http://localhost:5000";

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [topForecast, setTopForecast] = useState([]);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    mostSellingProduct: "-",
    activeCustomers: 0,
  });

  const productColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bfff", "#ff69b4"];

  const fetchDashboardData = async () => {
    try {
      const resOrders = await axios.get(`${API_BASE}/api/admin/orders`);
      const orders = resOrders.data || [];

      const deliveredOrders = orders.filter(o => o.status === "delivered");
      const sortedDeliveredOrders = deliveredOrders.sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate));
      setRecentOrders(sortedDeliveredOrders.slice(0,5));

      const totalSales = deliveredOrders.reduce((sum,o) => sum + (o.total || 0),0);
      const totalOrders = deliveredOrders.length;

      const nameMap = { "Chocolate": "Chocolate Ice Cream" };
      const productCount = {};
      deliveredOrders.forEach(order => {
        if(order.items){
          order.items.forEach(item => {
            const properName = nameMap[item.name] || item.name;
            productCount[properName] = (productCount[properName] || 0) + (item.quantity || 0);
          });
        }
      });

      const activeCustomers = new Set(deliveredOrders.map(o => (o.customer?._id || o.customer?.id || o.customer))).size;

      let totalProducts = 0;
      try{
        const resProducts = await axios.get(`${API_BASE}/api/admin/products`);
        totalProducts = resProducts.data.length || 0;
      }catch{
        totalProducts = Object.keys(productCount).length;
      }

      const mostSellingProduct = Object.keys(productCount).length > 0 ?
        Object.keys(productCount).reduce((a,b)=> productCount[a]>productCount[b]?a:b) : "-";

      setSummary({ totalSales,totalOrders,totalProducts,mostSellingProduct,activeCustomers });

      const resForecast = await axios.get(`${API_BASE}/api/forecast-sales`);
      const forecasts = resForecast.data.forecasts || [];
      setTopForecast(forecasts);

      const trendMap = {};
      deliveredOrders.forEach(order => {
        const date = order.orderDate ? order.orderDate.split("T")[0] : null;
        if(!date) return;
        if(!trendMap[date]) trendMap[date]={};
        if(order.items){
          order.items.forEach(item => {
            const properName = nameMap[item.name] || item.name;
            trendMap[date][properName] = (trendMap[date][properName]||0) + (item.quantity||0);
          });
        }
      });

      forecasts.forEach(f => {
        if(f.daily_predicted_sales){
          const properName = nameMap[f.product]||f.product;
          f.daily_predicted_sales.forEach(pred => {
            const date = pred.date;
            if(!date) return;
            if(!trendMap[date]) trendMap[date]={};
            trendMap[date][properName+"_pred"] = pred.quantity||0;
          });
        }
      });

      const actualProducts = new Set();
      const predictedProducts = new Set();
      Object.values(trendMap).forEach(obj=>{
        Object.keys(obj).forEach(p=>{
          if(p.endsWith("_pred")) predictedProducts.add(p);
          else actualProducts.add(p);
        })
      });
      const allProducts = [...actualProducts,...predictedProducts];

      const chartData = Object.keys(trendMap)
        .sort((a,b)=> new Date(a)-new Date(b))
        .map(date=>{
          const data={date};
          allProducts.forEach(p=> data[p]=trendMap[date][p]||0);
          return data;
        });

      setSalesTrendData(chartData);

    }catch(err){
      console.error("Dashboard fetch error:",err);
    }
  };

  useEffect(()=>{
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData,60000);
    return ()=>clearInterval(interval);
  },[]);

  // Wrapped the dashboard content inside <AdminLayout>
  return (
    <AdminLayout>
      <div style={{ width: "100%", fontFamily:"Arial, sans-serif" }}>
        <h1 style={{ textAlign:"center", marginBottom:"2rem" }}>Admin Dashboard</h1>

        {/* Summary Tiles */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", justifyContent:"center" }}>
          <div style={tileStyle("#8884d8")}><FaDollarSign size={30} style={{marginBottom:"10px"}} /><h3>Total Sales</h3><p>₹{summary.totalSales}</p></div>
          <div style={tileStyle("#82ca9d")}><FaShoppingCart size={30} style={{marginBottom:"10px"}}/><h3>Orders Processed</h3><p>{summary.totalOrders}</p></div>
          <div style={tileStyle("#ffc658")}><FaBoxOpen size={30} style={{marginBottom:"10px"}}/><h3>Total Products</h3><p>{summary.totalProducts}</p></div>
          <div style={tileStyle("#ff7f50")}><FaBoxOpen size={30} style={{marginBottom:"10px"}}/><h3>Most Selling Product</h3><p>{summary.mostSellingProduct}</p></div>
          <div style={tileStyle("#00bfff")}><FaUsers size={30} style={{marginBottom:"10px"}}/><h3>Active Customers</h3><p>{summary.activeCustomers}</p></div>
        </div>

        {/* Recent Orders */}
        <Section title="Recent Orders">
          {recentOrders.length===0?<p>No recent orders.</p>:(
            <table style={tableStyle}>
              <thead>
                <tr>{["Order ID","Customer","Total","Status","Date"].map((t,i)=><th key={i} style={thStyle}>{t}</th>)}</tr>
              </thead>
              <tbody>
                {recentOrders.map(o=>(
                  <tr key={o._id}>
                    <td style={tdStyle}>{o.id||o._id}</td>
                    <td style={tdStyle}>{o.customer?.name||"-"}</td>
                    <td style={tdStyle}>₹{o.total||0}</td>
                    <td style={tdStyle}>{o.status}</td>
                    <td style={tdStyle}>{o.orderDate?o.orderDate.split("T")[0]:"-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Top Forecast */}
        <Section title="Top Forecasted Products">
          {topForecast.length===0?<p>No forecast data.</p>:(
            <table style={tableStyle}>
              <thead>
                <tr>{["Product","Predicted Sales (7 days)"].map((t,i)=><th key={i} style={thStyle}>{t}</th>)}</tr>
              </thead>
              <tbody>
                {topForecast.map(f=>(
                  <tr key={f.product}>
                    <td style={tdStyle}>{f.product}</td>
                    <td style={tdStyle}>{f.predicted_sales_next_7_days||"-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Sales Trend Chart */}
        <Section title="Sales Trend">
          {salesTrendData.length===0?<p>No data for chart.</p>:
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesTrendData}>
                <CartesianGrid stroke="#ccc"/>
                <XAxis dataKey="date"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                {Object.keys(salesTrendData[0]).filter(k=>k!=="date").map((p,i)=>(
                  <Line key={p} type="monotone" dataKey={p} stroke={productColors[i%productColors.length]} dot={false} strokeDasharray={p.endsWith("_pred")?"5 5":"0"} name={p.endsWith("_pred")?p.replace("_pred"," (Predicted)"):p}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          }
        </Section>
      </div>
    </AdminLayout>
  );
};

// ------------------ Styles ------------------
const tileStyle = (bg)=>({
  flex:"1 1 200px",
  background:bg,
  color:"#fff",
  borderRadius:"12px",
  padding:"1.5rem",
  textAlign:"center",
  boxShadow:"0 4px 10px rgba(0,0,0,0.15)",
  transition:"transform 0.2s",
  cursor:"default",
  minWidth:"180px"
});

const Section = ({title,children})=>(
  <div style={{marginTop:"3rem"}}>
    <h2 style={{marginBottom:"1rem", textAlign:"left", borderBottom:"2px solid #eee", paddingBottom:"0.5rem"}}>{title}</h2>
    {children}
  </div>
);

const tableStyle = {
  width:"100%",
  borderCollapse:"collapse",
  textAlign:"left"
};

const thStyle = {
  padding:"10px",
  borderBottom:"2px solid #ddd",
  background:"#f5f5f5"
};

const tdStyle = {
  padding:"10px",
  borderBottom:"1px solid #eee"
};

export default AdminDashboard;