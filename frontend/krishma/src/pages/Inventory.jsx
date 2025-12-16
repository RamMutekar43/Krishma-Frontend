import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Trash2, Package, DollarSign, Milk, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  const categories = ['Dairy', 'Bakery', 'Beverages', 'Snacks', 'Others'];

  const getStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  };

  // ✅ Fixed: compute and correct product status when fetching
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      // Recalculate status dynamically so stock 0 shows correctly
      const updated = data.map(p => ({
        ...p,
        status: getStatus(p.stock)
      }));

      setProducts(updated);
    } catch (err) {
      setError(err.message);
      toast({ title: "Error", description: "Could not fetch products.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: '', stock: '', description: '', image: '' });
    setImagePreview('');
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (!formData.name || !formData.category || isNaN(price) || isNaN(stock)) {
      toast({ title: "Validation Error", description: "Fill all required fields correctly.", variant: "destructive" });
      return;
    }

    const newProductData = { ...formData, price, stock, status: getStatus(stock) };

    try {
      if (editingProduct) {
        const response = await fetch(`http://localhost:5000/api/admin/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProductData),
        });
        if (!response.ok) throw new Error('Failed to update product');
        toast({ title: "Product Updated", description: "Product updated successfully." });
      } else {
        const response = await fetch('http://localhost:5000/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProductData),
        });
        if (!response.ok) throw new Error('Failed to add product');
        toast({ title: "Product Added", description: "New product added successfully." });
      }
      fetchProducts();
    } catch (err) {
      toast({ title: "API Error", description: err.message, variant: "destructive" });
    } finally {
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      image: product.image
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      toast({ title: "Product Deleted", description: "Product removed successfully." });
      fetchProducts();
    } catch (err) {
      toast({ title: "API Error", description: err.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'in-stock': 'bg-green-100 text-green-700',
      'low-stock': 'bg-yellow-100 text-yellow-700',
      'out-of-stock': 'bg-red-100 text-red-700'
    };
    return <Badge className={`${variants[status]} capitalize`}>{status.replace('-', ' ')}</Badge>;
  };

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64">Loading inventory...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="flex items-center justify-center h-64 text-destructive">{error}</div></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
          <Milk className="h-7 w-7 text-primary" /> Krishma Milk Products Inventory
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>{editingProduct ? "Update product details." : "Fill details to add new product."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="name">Name</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} /></div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="price">Price</Label><Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} /></div>
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} /></div>
              </div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} /></div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                  <ImageIcon className="h-6 w-6 text-gray-500" />
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-28 w-full object-contain rounded border" />}
              </div>
              <Button type="submit" className="w-full">{editingProduct ? "Update" : "Add"} Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Search products..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><Filter className="mr-2 h-4 w-4" /> Category</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><Filter className="mr-2 h-4 w-4" /> Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map(product => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {product.name} {getStatusBadge(product.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img src={product.image} alt={product.name} className="w-full h-40 object-contain rounded mb-4 bg-muted" />
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <p className="font-semibold flex items-center mt-2"><DollarSign className="h-4 w-4 mr-1 text-primary" /> {product.price}</p>
              <p className="text-sm text-muted-foreground flex items-center mt-1"><Package className="h-4 w-4 mr-1" /> {product.stock} in stock</p>
              <p className="mt-2 text-sm">{product.description}</p>
              <div className="flex items-center space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Inventory;
