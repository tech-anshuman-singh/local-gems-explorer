import { useState, useRef } from "react";
import { MapPin, Star, Award, Edit, LogOut, Loader2, Save, X, Trash2, Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlaceCard from "@/components/shared/PlaceCard";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import placeCafe from "@/assets/place-cafe.jpg";

const UserProfilePage = () => {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => api.get("/profiles/me", token!),
    enabled: !!token,
  });

  const { data: myPlaces = [], isLoading: placesLoading } = useQuery({
    queryKey: ["my-places", user?._id],
    queryFn: async () => {
      const data = await api.get(`/places?submitted_by=${user!._id}`, token!);
      return data.map((p: any) => ({
        id: p._id,
        title: p.title,
        image: p.place_images?.find((i: any) => i.is_primary)?.image_url || p.place_images?.[0]?.image_url || placeCafe,
        location: `${p.city}, ${p.country}`,
        category: p.category,
        rating: p.avgRating || 0,
        reviewCount: p.reviewCount || 0,
        status: p.status,
      }));
    },
    enabled: !!user,
  });

  const { data: myReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["my-reviews", user?._id],
    queryFn: () => api.get(`/reviews?user_id=${user!._id}`, token!),
    enabled: !!user,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateProfile = useMutation({
    mutationFn: async () => {
      let finalAvatarUrl = editAvatar;

      // If user picked a new image file, upload to Cloudinary first
      if (avatarFile) {
        const data = await api.uploadSingleImage(avatarFile, token!);
        finalAvatarUrl = data.url; // { url, public_id }
      }

      return api.put("/profiles/me", {
        display_name: editName,
        bio: editBio,
        avatar_url: finalAvatarUrl,
      }, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      setEditOpen(false);
      setAvatarFile(null);
      setAvatarPreview("");
      toast.success("Profile updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reviews", user?._id] });
      toast.success("Review deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = () => {
    setEditName(profile?.display_name || "");
    setEditBio(profile?.bio || "");
    setEditAvatar(profile?.avatar_url || "");
    setAvatarFile(null);
    setAvatarPreview("");
    setEditOpen(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-heading text-2xl font-bold">Sign In Required</h1>
          <p className="mt-2 text-muted-foreground">Please sign in to view your profile.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.display_name || user.display_name || user.email || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  const badges = [
    { icon: Award,  label: "Explorer",    desc: `Reviewed ${myReviews.length} place${myReviews.length !== 1 ? "s" : ""}`, earned: myReviews.length >= 1 },
    { icon: Star,   label: "Contributor", desc: `Added ${myPlaces.length} place${myPlaces.length !== 1 ? "s" : ""}`,      earned: myPlaces.length >= 1 },
    { icon: MapPin, label: "Trailblazer", desc: "Discovered 3+ hidden spots",                                              earned: myPlaces.length >= 3 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">

        {/* Profile header */}
        <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-6 shadow-card sm:flex-row">
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-4 ring-primary/20">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            {profileLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <h1 className="font-heading text-2xl font-bold">{displayName}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {profile?.bio && <p className="mt-1 text-sm text-muted-foreground italic">"{profile.bio}"</p>}
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="outline">{myPlaces.length} Places Added</Badge>
                  <Badge variant="outline">{myReviews.length} Reviews</Badge>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" onClick={openEdit}>
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
            <Button variant="outline" className="gap-1 text-destructive hover:text-destructive"
              onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-semibold">Badges</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {badges.map((b) => (
              <div key={b.label}
                className={`flex items-center gap-3 rounded-lg border bg-card p-4 shadow-card transition-opacity ${!b.earned ? "opacity-40" : ""}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <b.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
                {b.earned && <Badge className="ml-auto bg-primary/10 text-primary border-0 text-xs">Earned</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="places" className="mt-8">
          <TabsList>
            <TabsTrigger value="places">My Places ({myPlaces.length})</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews ({myReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="places">
            {placesLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : myPlaces.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-10 text-center">
                <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium">No places yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Share a hidden gem with the world!</p>
                <Button className="mt-4" onClick={() => navigate("/add-place")}>Add a Place</Button>
              </div>
            ) : (
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myPlaces.map((p: any) => (
                  <div key={p.id} className="relative">
                    <PlaceCard {...p} />
                    {p.status !== "approved" && (
                      <Badge className="absolute right-2 top-2 capitalize"
                        variant={p.status === "pending" ? "secondary" : "destructive"}>
                        {p.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviewsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : myReviews.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed p-10 text-center">
                <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium">No reviews yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Explore places and share your experience!</p>
                <Button className="mt-4" onClick={() => navigate("/explore")}>Explore Places</Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {myReviews.map((r: any) => (
                  <div key={r._id} className="rounded-lg border bg-card p-4 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link to={`/place/${r.place_id?._id || r.place_id}`}
                          className="font-semibold hover:text-primary hover:underline truncate block">
                          {r.place_id?.title || "Unknown Place"}
                        </Link>
                        <div className="mt-1 flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, j) => (
                            <Star key={j} className={`h-3.5 w-3.5 ${j < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                          ))}
                          <span className="ml-1 text-xs text-muted-foreground">{r.rating}/5</span>
                          {r.is_verified && <Badge className="ml-2 bg-primary/10 text-primary border-0 text-xs">Verified</Badge>}
                        </div>
                        {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => { if (confirm("Delete this review?")) deleteReview.mutate(r._id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">

            {/* ── Avatar upload ── */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {/* Preview: file selected > existing avatar > initials */}
                {avatarPreview || editAvatar ? (
                  <img
                    src={avatarPreview || editAvatar}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-4 ring-primary/20">
                    {(editName || user.display_name || user.email || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Camera button overlay */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                  title="Change photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5" />
                  {avatarFile ? "Change Photo" : "Upload Photo"}
                </Button>
                {(avatarPreview || editAvatar) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview("");
                      setEditAvatar("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>

              {avatarFile && (
                <p className="text-xs text-muted-foreground">{avatarFile.name}</p>
              )}
            </div>

            {/* ── Display Name ── */}
            <div>
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                className="mt-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* ── Bio ── */}
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                className="mt-1"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                {updateProfile.isPending
                  ? <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  : <Save className="mr-1 h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
