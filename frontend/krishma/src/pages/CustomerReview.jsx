import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Star, Send, Milk, User, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerReview = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error fetching products",
          description: "Could not load products from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  // Fetch reviews from the backend (assuming a customer-specific endpoint)
  useEffect(() => {
    // This part is a placeholder as there's no customer-specific review endpoint yet.
    // In a real application, you would fetch reviews for the logged-in user.
    // For now, we'll keep the mock data.
    const fetchMyReviews = async () => {
        setMyReviews([
            {
                _id: 'R001',
                productId: 'P001',
                productName: 'Fresh Cow Milk (1L)',
                rating: 5,
                title: 'Super fresh & creamy!',
                comment: 'The milk tastes really fresh, no adulteration. My kids love it every morning!',
                date: '2024-01-15',
                status: 'approved'
            },
            {
                _id: 'R002',
                productId: 'P004',
                productName: 'Ghee (500ml)',
                rating: 4,
                title: 'Rich aroma!',
                comment: 'This ghee has a pure, authentic fragrance and taste. Slightly pricey but worth it.',
                date: '2024-01-10',
                status: 'pending'
            }
        ]);
    };
    fetchMyReviews();
  }, []);

  const handleStarClick = (starRating) => setRating(starRating);
  const handleStarHover = (starRating) => setHoverRating(starRating);

  // Send review data to the backend
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !rating || !title.trim() || !comment.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedProductData = products.find(p => p._id === selectedProduct);
    if (!selectedProductData) return;

    const newReview = {
      productId: selectedProductData._id,
      productName: selectedProductData.name,
      rating,
      title,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' // Reviews are pending by default until approved by an admin
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/customer/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Add the new review to the local state to show it immediately
      setMyReviews(prev => [{ ...newReview, _id: Date.now().toString() }, ...prev]);
      
      // Reset form
      setSelectedProduct('');
      setRating(0);
      setTitle('');
      setComment('');

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted and is pending approval.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not submit review to the server.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? (hoverRating || rating) : currentRating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-6 w-6 transition-colors ${
            interactive ? 'cursor-pointer' : ''
          } ${
            i <= displayRating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
          onMouseEnter={interactive ? () => handleStarHover(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return stars;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-600',
      'approved': 'bg-green-100 text-green-600',
      'rejected': 'bg-red-100 text-red-600'
    };
    return (
      <Badge className={variants[status]}>
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

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex justify-center items-center gap-2">
            <Milk className="h-7 w-7 text-blue-500" />
            Share Your Experience
          </h1>
          <p className="text-muted-foreground mt-2">
            Your reviews help us maintain freshness and quality at Krishma Milk Products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Form */}
          <Card className="stat-card shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Coffee className="h-5 w-5 mr-2 text-blue-500" />
                Write a New Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product *</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product to review" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          <div className="flex items-center space-x-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                            <span>{product.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating, true)}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating} out of 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Review Title *</Label>
                  <Input
                    id="title"
                    placeholder="E.g. Super fresh and creamy!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Review *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Tell us how the taste, freshness, and quality felt..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Reviews */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  My Reviews ({myReviews.length})
                </CardTitle>
              </CardHeader>
            </Card>

            {myReviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Milk className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your love for our fresh dairy!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <Card key={review._id} className="stat-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground">{review.title}</h3>
                            <p className="text-sm text-muted-foreground">{review.productName}</p>
                          </div>
                          {getStatusBadge(review.status)}
                        </div>

                        {/* Rating & Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>

                        {/* Comment */}
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerReview;