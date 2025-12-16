import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Star, 
  User, 
  LogOut,
  Milk
} from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/customer/home', icon: Home },
    { name: 'Our Products', path: '/customer/products', icon: Package },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
    { name: 'Write Review', path: '/customer/review', icon: Star },
    { name: 'Profile', path: '/customer/profile', icon: User },
  ];

  const handleLogout = () => {
    // Clear stored customer auth
    localStorage.removeItem('customer');
    navigate('/customer/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <Milk className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Krishma Milk Products
              </h1>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Layout Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border p-4 flex-shrink-0">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
