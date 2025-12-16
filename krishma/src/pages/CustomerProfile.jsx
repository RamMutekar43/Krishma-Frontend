import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    aadhaar: '',
    profilePicture: '',
    totalOrders: 0,
    totalSpent: 0
  });
  const [editedProfile, setEditedProfile] = useState(profile);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customerAuth = JSON.parse(localStorage.getItem('customerAuth'));
  const customerEmail = customerAuth ? customerAuth.email : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!customerEmail) {
        setLoading(false);
        setError("User not authenticated. Please log in.");
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/customer/profile/${customerEmail}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        setError(err.message);
        toast({ title: "Error", description: "Could not fetch profile data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [customerEmail, toast]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
    setPreviewImage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setPreviewImage(null);
  };

  const handleSave = async () => {
    if (!editedProfile.name.trim() || !editedProfile.mobile?.trim()) {
      toast({ title: "Validation Error", description: "Name and phone are required.", variant: "destructive" });
      return;
    }

    const updatedData = {
      name: editedProfile.name,
      mobile: editedProfile.mobile,
      address: editedProfile.address,
      aadhaar: editedProfile.aadhaar,
      profilePicture: previewImage || profile.profilePicture
    };

    try {
      const response = await fetch(`http://localhost:5000/api/customer/profile/${customerEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const result = await response.json();
      if (response.ok) {
        setProfile(prev => ({ ...prev, ...updatedData }));
        setIsEditing(false);
        setPreviewImage(null);
        toast({ title: "Profile Updated", description: result.msg || "Profile updated successfully." });
      } else {
        throw new Error(result.msg || "Failed to update profile.");
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';
  const displayProfile = isEditing ? editedProfile : profile;
  const displayImage = previewImage || displayProfile.profilePicture;

  if (loading) return <CustomerLayout><div className="flex items-center justify-center h-64"><p>Loading profile...</p></div></CustomerLayout>;
  if (error) return <CustomerLayout><div className="flex items-center justify-center h-64 text-destructive"><p>{error}</p></div></CustomerLayout>;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}><Edit className="h-4 w-4 mr-2"/>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2"/>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-2"/>Cancel</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture */}
          <Card className="stat-card">
            <CardHeader><CardTitle className="text-center">Profile Picture</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={displayImage} alt={displayProfile.name} />
                <AvatarFallback className="text-2xl">{getInitials(displayProfile.name)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="text-center">
                  <Label htmlFor="profile-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4"/><span>Change Photo</span>
                    </div>
                  </Label>
                  <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                  <p className="text-xs text-muted-foreground mt-2">Max size: 5MB</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="stat-card lg:col-span-2">
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center"><User className="h-4 w-4 mr-2"/>Full Name *</Label>
                  {isEditing ? <Input id="name" value={editedProfile.name} onChange={e=>setEditedProfile({...editedProfile,name:e.target.value})} placeholder="Enter your full name"/> : <p className="text-muted-foreground p-2 bg-muted/30 rounded">{profile.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center"><Mail className="h-4 w-4 mr-2"/>Email Address</Label>
                  <p className="text-muted-foreground p-2 bg-muted/30 rounded">{profile.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center"><Phone className="h-4 w-4 mr-2"/>Phone Number *</Label>
                  {isEditing ? <Input id="phone" value={editedProfile.mobile} onChange={e=>setEditedProfile({...editedProfile,mobile:e.target.value})} placeholder="Enter your phone number"/> : <p className="text-muted-foreground p-2 bg-muted/30 rounded">{profile.mobile}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaar" className="flex items-center"><CreditCard className="h-4 w-4 mr-2"/>Aadhaar Number</Label>
                  {isEditing ? <Input id="aadhaar" value={editedProfile.aadhaar} onChange={e=>setEditedProfile({...editedProfile,aadhaar:e.target.value})} placeholder="Enter your Aadhaar number"/> : <p className="text-muted-foreground p-2 bg-muted/30 rounded">{profile.aadhaar}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center"><MapPin className="h-4 w-4 mr-2"/>Address</Label>
                {isEditing ? <Input id="address" value={editedProfile.address} onChange={e=>setEditedProfile({...editedProfile,address:e.target.value})} placeholder="Enter your complete address"/> : <p className="text-muted-foreground p-2 bg-muted/30 rounded">{profile.address}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card text-center"><CardContent className="p-6"><div className="text-2xl font-bold text-primary">{profile.totalOrders || 0}</div><div className="text-sm text-muted-foreground">Total Orders</div></CardContent></Card>
          <Card className="stat-card text-center"><CardContent className="p-6"><div className="text-2xl font-bold text-success">₹{profile.totalSpent || 0}</div><div className="text-sm text-muted-foreground">Total Spent</div></CardContent></Card>
          <Card className="stat-card text-center"><CardContent className="p-6"><div className="text-2xl font-bold text-warning">0</div><div className="text-sm text-muted-foreground">Reviews Written</div></CardContent></Card>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;
