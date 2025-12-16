import React, { useState, useEffect, useRef } from "react";
import CustomerLayout from "@/components/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Star,
  ShoppingCart,
  Eye,
  DollarSign,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const prevCartRef = useRef();

  // ---------- Fetch products ----------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error fetching products",
          description: "Could not load products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  // ---------- Watch cart for changes ----------
  useEffect(() => {
    const prevCart = prevCartRef.current;
    if (prevCart && cart.length > prevCart.length) {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart.",
      });
    }
    prevCartRef.current = cart;
  }, [cart, toast]);

  // ---------- Fetch recommendations ----------
  useEffect(() => {
    const fetchRecommendations = async () => {
      const userEmail =
        JSON.parse(localStorage.getItem("customerAuth"))?.email || "guest";
      try {
        const res = await fetch(
          `http://localhost:5000/api/recommend/${userEmail}`
        );
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const data = await res.json();
        setRecommended(data.slice(0, 3)); // Limit to 3
      } catch (err) {
        console.log("Recommendation fetch error:", err.message);
      }
    };
    fetchRecommendations();
  }, []);

  // ---------- Track user events ----------
  const trackEvent = async (productId, eventType, value = 1) => {
    const userId =
      JSON.parse(localStorage.getItem("customerAuth"))?.email || "guest";
    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId,
        eventType,
        value,
        timestamp: new Date(),
      }),
    });
  };

  // ---------- Filters ----------
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ---------- Utilities ----------
  const calculateDiscountPrice = (price, discount) =>
    discount ? price - (price * discount) / 100 : price;

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + calculateDiscountPrice(item.price, item.discount) * item.quantity,
    0
  );

  // ---------- Add to Cart ----------
  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently not available.",
        variant: "destructive",
      });
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Cannot Add More",
            description: `You already have the maximum available stock for ${product.name}.`,
            variant: "destructive",
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    trackEvent(product._id, "add_to_cart");
  };

  // ---------- Remove or update cart ----------
  const handleRemoveFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item._id !== id));

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    const itemInCart = cart.find((item) => item._id === productId);
    if (!itemInCart) return;
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    if (newQuantity > itemInCart.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${itemInCart.stock} units of ${itemInCart.name} available.`,
        variant: "destructive",
      });
      setCart((prev) =>
        prev.map((item) =>
          item._id === productId ? { ...item, quantity: itemInCart.stock } : item
        )
      );
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // ---------- Place Order ----------
  const handlePlaceOrder = async () => {
    const customerAuth = JSON.parse(localStorage.getItem("customerAuth"));
    if (!customerAuth?.email) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Add products before placing an order.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerEmail: customerAuth.email,
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      total: totalPrice,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
      id: `ORD-${Date.now()}`,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );
      if (!response.ok)
        throw new Error((await response.json()).msg || "Failed to place order");

      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully!",
      });
      setCart([]);
      setIsCartOpen(false);
      cart.forEach((item) => trackEvent(item._id, "purchase", item.quantity));
    } catch (err) {
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ---------- Track view ----------
  useEffect(() => {
    if (selectedProduct) trackEvent(selectedProduct._id, "view");
  }, [selectedProduct]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++)
      stars.push(<Star key={i} className="h-4 w-4 fill-warning text-warning" />);
    if (hasHalf)
      stars.push(
        <Star key="half" className="h-4 w-4 fill-warning/50 text-warning" />
      );
    for (let i = 0; i < 5 - Math.ceil(rating || 0); i++)
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
      );
    return stars;
  };

  // ---------- Render ----------
  if (loading)
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          Loading products...
        </div>
      </CustomerLayout>
    );

  if (error)
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64 text-destructive">
          {error}
        </div>
      </CustomerLayout>
    );

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Our Products</h1>
            <p className="text-muted-foreground mt-2">
              Fresh & pure Krishma Milk Products for your daily needs
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({cart.length})
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Milk">Milk</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48 bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  {product.discount ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-success">
                        ₹
                        {calculateDiscountPrice(
                          product.price,
                          product.discount
                        ).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-success">
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ---------- Recommendation Section ---------- */}
        {recommended.length > 0 && (
          <div className="space-y-4 mt-10">
            <h2 className="text-2xl font-bold">You may also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommended.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-success">
                        ₹{product.price}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cart Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="w-full max-w-md bg-background h-full shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    Your cart is empty.
                  </p>
                ) : (
                  cart.map((item) => (
                    <Card key={item._id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleUpdateCartQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-4 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleUpdateCartQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">
                            ₹
                            {(
                              calculateDiscountPrice(
                                item.price,
                                item.discount
                              ) * item.quantity
                            ).toFixed(2)}
                          </span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item._id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t space-y-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Products;
