import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Calendar,
  DollarSign,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Get the logged-in customer's email from local storage
  const customerAuth = JSON.parse(localStorage.getItem('customerAuth'));
  const customerEmail = customerAuth ? customerAuth.email : null;

  // Fetch orders from the backend on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerEmail) {
        setLoading(false);
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/customer/orders/${customerEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error fetching orders",
          description: "Could not load orders from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerEmail, toast]);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const variants = {
      'pending': { className: 'bg-yellow-100 text-yellow-700', icon: Package },
      'confirmed': { className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      'shipped': { className: 'bg-indigo-100 text-indigo-700', icon: Truck },
      'delivered': { className: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { className: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'shipped': 'text-indigo-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    };
    return colors[status];
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading your orders...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64 text-destructive">
          <p>{error}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dairy Orders</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your Krishma Milk Products orders
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dairy orders by ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Ordered on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items Preview */}
                <div>
                  <p className="font-medium text-sm mb-2">Items ({order.items.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-muted/50 rounded px-3 py-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <span className="text-sm">{item.name}</span>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            x{item.quantity}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <Badge variant="outline" className="h-7">
                        +{order.items.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Order Status & Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Total Amount</p>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-bold text-green-600">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <p className={`font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {order.status === 'delivered' ? 'Delivered On' : 'Expected Delivery'}
                    </p>
                    <p className="text-muted-foreground">
                      {order.deliveryDate
                        ? formatDate(order.deliveryDate)
                        : order.estimatedDelivery
                        ? formatDate(order.estimatedDelivery)
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground font-mono">{order.trackingNumber}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
                    <Button variant="outline">
                      <Truck className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms to find your dairy orders.'
                  : 'You haven’t placed any dairy orders yet.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
                    <p className="text-muted-foreground">
                      Placed on {formatDate(selectedOrder.orderDate)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Order Status</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h3 className="font-semibold mb-3">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Order Date:</p>
                      <p className="text-muted-foreground">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.status === 'delivered' ? 'Delivered Date:' : 'Expected Delivery:'}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOrder.deliveryDate
                          ? formatDate(selectedOrder.deliveryDate)
                          : selectedOrder.estimatedDelivery
                          ? formatDate(selectedOrder.estimatedDelivery)
                          : 'To be determined'
                        }
                      </p>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="md:col-span-2">
                        <p className="font-medium">Tracking Number:</p>
                        <p className="text-muted-foreground font-mono">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrders;