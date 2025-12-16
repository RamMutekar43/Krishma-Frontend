import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Star,
  Calendar,
  Eye,
  Flag,
  Milk,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Reviews = () => {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // --- Fetching Reviews ---
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Could not fetch reviews from the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.customerName && review.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || review.status === statusFilter;
    const matchesRating =
      ratingFilter === 'all' || review.rating.toString() === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  // --- Handling Status Change ---
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update review status');
      }
      toast({
        title: 'Review Updated',
        description: `Review status changed to ${newStatus}.`,
      });
      fetchReviews(); // Re-fetch reviews to show the updated status
    } catch (err) {
      toast({
        title: 'API Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleReport = (review) => {
    // In a real application, this would send a report to the backend.
    toast({
      title: 'Review Reported',
      description: `Review for ${review.productName} has been flagged.`,
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        ({rating}/5)
      </span>
    </div>
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getAverageRating = () => {
    const approvedReviews = reviews.filter((r) => r.status === 'approved');
    if (approvedReviews.length === 0) return 0;
    return (
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
      approvedReviews.length
    ).toFixed(1);
  };

  const getRatingDistribution = () => {
    const approvedReviews = reviews.filter((r) => r.status === 'approved');
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading reviews...</p>
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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-black">
            <Milk className="h-7 w-7 text-purple-600" /> Krishma Milk Product Reviews
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage customer feedback on dairy products
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={r.toString()}>
                  {r} Stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Section */}
      <Card className="mb-6 border-blue-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Review Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-blue-700">
            Average Rating: {getAverageRating()} / 5
          </p>
          <div className="mt-2 space-y-1 text-sm">
            {Object.entries(getRatingDistribution()).map(([rating, count]) => (
              <p key={rating} className="flex justify-between">
                <span>{rating} Stars</span>
                <span className="font-medium">{count}</span>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((review) => (
          <Card
            key={review._id}
            className="hover:shadow-lg transition border-blue-100"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-blue-800">
                  {review.productName}
                </CardTitle>
                {getStatusBadge(review.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {review.customerName} ({review.customerEmail})
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-2">{renderStars(review.rating)}</div>
              <p className="text-sm text-muted-foreground italic mb-2">
                "{review.comment}"
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(review.date)}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(review._id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(review._id, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedReview(review)}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReport(review)}
                >
                  <Flag className="w-4 h-4 mr-1" /> Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReview.productName} Review</DialogTitle>
                <DialogDescription>
                  By {selectedReview.customerName} ({selectedReview.customerEmail})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {renderStars(selectedReview.rating)}
                <p className="italic">"{selectedReview.comment}"</p>
                <p className="text-xs text-gray-500">
                  Date: {formatDate(selectedReview.date)}
                </p>
                <p className="text-xs text-gray-500">
                  Verified: {selectedReview.verified ? 'Yes' : 'No'}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedReview(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Reviews;