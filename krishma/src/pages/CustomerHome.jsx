import React from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Star, 
  TrendingUp,
  Gift,
  Truck
} from 'lucide-react' ;

const CustomerHome = () => {
  const features = [
    {
      icon: Package,
      title: 'Browse Dairy Products',
      description: 'Explore our fresh milk, paneer, curd, ghee, and more',
      link: '/customer/products',
      color: 'text-primary'
    },
    {
      icon: ShoppingBag,
      title: 'Track Your Orders',
      description: 'Stay updated with your milk and dairy deliveries',
      link: '/customer/orders',
      color: 'text-success'
    },
    {
      icon: Star,
      title: 'Share Feedback',
      description: 'Review our products and help us serve you better',
      link: '/customer/review',
      color: 'text-warning'
    }
  ];

  const stats = [
    { icon: Package, label: 'Fresh Products', value: '50+', color: 'text-primary' },
    { icon: TrendingUp, label: 'Happy Families', value: '10K+', color: 'text-success' },
    { icon: Gift, label: 'Daily Deliveries', value: '5K+', color: 'text-warning' },
    { icon: Truck, label: 'On-Time Delivery', value: '99%', color: 'text-destructive' }
  ];

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Krishma Milk Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bringing you farm-fresh milk and dairy products every day.  
            Enjoy purity, quality, and the taste of tradition with every sip and bite.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="stat-card text-center">
                <CardContent className="p-6">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Explore Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="stat-card hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">{feature.description}</p>
                    <Button asChild className="w-full">
                      <Link to={feature.link}>Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Order Fresh Dairy?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse our catalog of fresh milk and dairy products, place your order, and enjoy fast doorstep delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/customer/products">
                  <Package className="h-5 w-5 mr-2" />
                  Browse Products
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/customer/orders">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  View Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerHome;
