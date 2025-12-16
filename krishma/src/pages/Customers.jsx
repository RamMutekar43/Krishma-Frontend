import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // --- Fetching Customers ---
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Could not fetch customer data from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [toast]);

  // --- MODIFIED filteredCustomers function ---
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm))
  );

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-600',
      inactive: 'bg-gray-200 text-gray-600',
    };

    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading customers...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-destructive">
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer._id} className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{customer.name}</CardTitle>
                {getStatusBadge(customer.status)}
              </div>
              <p className="text-sm text-muted-foreground">{customer._id}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {customer.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {customer.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {customer.address}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Joined:{' '}
                  {formatDate(customer.joinDate)}
                </p>
                <p className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Orders:{' '}
                  {customer.totalOrders}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />{' '}
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
              <Button
                onClick={() => setSelectedCustomer(customer)}
                className="w-full mt-4"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedCustomer.name} - Details
            </h2>
            <p className="text-sm mb-2">
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p className="text-sm mb-2">
              <strong>Phone:</strong> {selectedCustomer.phone}
            </p>
            <p className="text-sm mb-2">
              <strong>Address:</strong> {selectedCustomer.address}
            </p>
            <p className="text-sm mb-4">
              <strong>Last Order:</strong>{' '}
              {formatDate(selectedCustomer.lastOrderDate)}
            </p>

            <h3 className="font-semibold mb-2">Purchase History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedCustomer.purchaseHistory && selectedCustomer.purchaseHistory.length > 0 ? (
                selectedCustomer.purchaseHistory.map((order) => (
                  <div
                    key={order.orderId}
                    className="border rounded p-2 text-sm bg-muted"
                  >
                    <p>
                      <strong>Order:</strong> {order.orderId} (
                      {formatDate(order.date)})
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatCurrency(order.amount)}
                    </p>
                    <p>
                      <strong>Items:</strong> {order.items.join(', ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No purchases yet.
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Customers;