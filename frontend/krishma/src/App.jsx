import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import Inventory from './pages/Inventory';
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Reviews from "./pages/Reviews";
import AdminProfile from "./pages/AdminProfile";
import SalesPrediction from "./pages/SalesPrediction"; // <-- Added here


// Customer pages
import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerHome from "./pages/CustomerHome";
import Products from "./pages/Products";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerReview from "./pages/CustomerReview";
import CustomerProfile from "./pages/CustomerProfile";

// Landing page
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const admin = localStorage.getItem('admin');
const customer = localStorage.getItem('customer');

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Index />} />
                    
          {/* Admin Routes */}
          {/* <Route path="/admin/signup" element={<AdminSignup />} /> */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/reviews" element={<Reviews />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/sales-prediction" element={<SalesPrediction />} /> {/* <-- Added here */}
          
          {/* Legacy admin routes for compatibility */}
          {/* <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<AdminSignup />} />
          <Route path="/profile" element={<AdminProfile />} /> */}
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reviews" element={<Reviews />} />

          {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/products" element={<Products />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/review" element={<CustomerReview />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
