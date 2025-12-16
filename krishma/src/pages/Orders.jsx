import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  ShoppingCart,
  User,
  MapPin,
  Milk,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Could not fetch orders from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
      fetchOrders();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-700",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center h-64 items-center">Loading...</div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="flex justify-center h-64 items-center text-red-600">
          {error}
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Milk className="h-7 w-7 text-primary" /> Orders – Krishma Milk
            Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage daily orders.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders or customers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.length ? (
            filteredOrders.map((order) => (
              <Card
                key={order._id}
                className="hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="pb-4 flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-primary">
                      {order.id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />{" "}
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" /> {order.customer?.name}
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {order.customer?.email}
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">
                      {order.customer?.phone}
                    </p>
                    <div className="flex items-start ml-6">
                      <MapPin className="h-3 w-3 mr-1 mt-0.5" />{" "}
                      {order.customer?.address}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="font-medium text-sm mb-2">Order Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name} ×{item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>Total:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>

                  {/* Status Update */}
                  <div className="flex gap-2 pt-2">
                    <Select
                      value={order.status}
                      onValueChange={(val) =>
                        handleStatusChange(order._id, val)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No orders found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting filters or search.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
                  <DialogDescription>
                    Placed on {formatDate(selectedOrder.orderDate)}
                  </DialogDescription>
                  <DialogClose />
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold">Customer</h4>
                    <p>{selectedOrder.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.customer?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.customer?.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Items</h4>
                    {selectedOrder.items.map((item, idx) => (
                      <p key={idx}>
                        {item.name} ×{item.quantity} - ₹
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Orders;
