import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin, Clock, Star, ExternalLink, ChevronLeft,
  Film, Book, Share2, Heart, Loader2, Trash2, ImagePlus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Droplets, Bath, Shield, Wifi, Utensils, TreePine, Armchair } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/shared/StarRating";
import AmenityBadge from "@/components/shared/AmenityBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import placeTemple from "@/assets/place-temple.jpg";

const amenityIcons: Record<string, any> = {
  Parking: Car,
  "Drinking Water": Droplets,
  Washroom: Bath,
  Safety: Shield,
  Network: Wifi,
  "Food Nearby": Utensils,
  Shade: TreePine,
  Benches: Armchair,
};

const mentionIcons: Record<string, any> = {
  Movie: Film,
  Book: Book,
  Social: Share2,
};

const PlaceDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviewRating, setReviewRating]         = useState(0);
  const [reviewComment, setReviewComment]       = useState("");
  const [liked, setLiked]                       = useState(false);
  const [lightboxIndex, setLightboxIndex]       = useState(0);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // ── Fetch place ──────────────────────────────────────────────────────────
  const { data: place, isLoading } = useQuery({
    queryKey: ["place", id],
    queryFn: () => api.get(`/places/${id}`),
    enabled: !!id,
  });

  // ── Keyboard nav for gallery modal ───────────────────────────────────────
  // imageCount is derived safely — 0 when place not loaded yet
  const imageCount = place?.place_images?.length ?? 0;

  useEffect(() => {
    if (!galleryModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIndex((i) => Math.min(i + 1, imageCount - 1));
      if (e.key === "ArrowLeft")  setLightboxIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape")     setGalleryModalOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [galleryModalOpen, imageCount]);

  // ── Submit review ────────────────────────────────────────────────────────
  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in");
      if (reviewRating === 0) throw new Error("Please select a rating");
      await api.post(
        "/reviews",
        { place_id: id, rating: reviewRating, comment: reviewComment || undefined },
        token!
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place", id] });
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Upload images ────────────────────────────────────────────────────────
  const uploadImages = useMutation({
    mutationFn: (files: File[]) =>
      api.uploadImages(`/places/${id}/images`, files, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place", id] });
      toast.success("Images added to gallery!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Delete image ─────────────────────────────────────────────────────────
  const deleteImage = useMutation({
    mutationFn: (imageId: string) =>
      api.delete(`/places/${id}/images/${imageId}`, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place", id] });
      toast.success("Image removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    uploadImages.mutate(files);
    e.target.value = "";
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );

  // ── Not found ────────────────────────────────────────────────────────────
  if (!place)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold">Place not found</h1>
          <Link to="/explore">
            <Button className="mt-4">Browse places</Button>
          </Link>
        </div>
      </div>
    );

  const images       = place.place_images || [];
  const primaryImage =
    images.find((i: any) => i.is_primary)?.image_url ||
    images[0]?.image_url ||
    placeTemple;
  const reviews   = place.reviews || [];
  const avgRating = place.avgRating || 0;

  // Only place owner, admin, or moderator can manage images
  const submittedById =
    typeof place.submitted_by === "object"
      ? place.submitted_by?._id?.toString()
      : place.submitted_by?.toString();

  const canManageImages =
    !!user &&
    (submittedById === user._id?.toString() ||
      ["admin", "moderator"].includes(user.role));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative h-[50vh] overflow-hidden">
        <img src={primaryImage} alt={place.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container">
            <Link
              to="/explore"
              className="mb-3 inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
              {place.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-primary-foreground/80">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {place.city}, {place.country}
                {place.address && (
                  <span className="text-primary-foreground/60"> — {place.address}</span>
                )}
              </span>
              <Badge variant="secondary">{place.category}</Badge>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {avgRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            {place.description && (
              <section>
                <h2 className="font-heading text-2xl font-bold">About this Place</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{place.description}</p>
                {place.history && (
                  <p className="mt-3 leading-relaxed text-muted-foreground">{place.history}</p>
                )}
              </section>
            )}

            {/* Best time */}
            {place.best_time_to_visit && (
              <section className="rounded-lg border bg-muted/50 p-5">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-heading text-lg font-semibold">Best Time to Visit</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{place.best_time_to_visit}</p>
              </section>
            )}

            {/* ── Gallery ── */}
            {(images.length > 0 || canManageImages) && (
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold">
                    Gallery
                    {images.length > 0 && (
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({images.length})
                      </span>
                    )}
                  </h2>
                  {canManageImages && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadImages.isPending}
                      >
                        {uploadImages.isPending
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <ImagePlus className="h-4 w-4" />}
                        {uploadImages.isPending ? "Uploading..." : "Add Photos"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>

                {images.length === 0 ? (
                  canManageImages && (
                    <div
                      className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-14 transition-colors hover:border-primary hover:bg-muted"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-muted-foreground">Click to add photos</p>
                    </div>
                  )
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {images.slice(0, 6).map((img: any, idx: number) => {
                      const isLast      = idx === 5;
                      const remaining   = images.length - 5;
                      const showOverlay = isLast && images.length > 6;

                      return (
                        <div
                          key={img._id}
                          className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted"
                          onClick={() => {
                            setLightboxIndex(idx);
                            setGalleryModalOpen(true);
                          }}
                        >
                          <img
                            src={img.image_url}
                            alt={`Gallery ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* +X overlay on 6th tile */}
                          {showOverlay && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
                              <span className="text-3xl font-bold text-white">+{remaining}</span>
                              <span className="mt-1 text-xs font-medium uppercase tracking-wide text-white/80">
                                more
                              </span>
                            </div>
                          )}

                          {/* Cover badge */}
                          {img.is_primary && !showOverlay && (
                            <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                              Cover
                            </span>
                          )}

                          {/* Delete button */}
                          {canManageImages && !showOverlay && (
                            <button
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Remove this image?")) deleteImage.mutate(img._id);
                              }}
                              disabled={deleteImage.isPending}
                              title="Remove image"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Mentions */}
            {(place.mentions || []).length > 0 && (
              <section>
                <h2 className="font-heading text-2xl font-bold">Seen In / Mentions</h2>
                <div className="mt-4 space-y-3">
                  {(place.mentions as any[]).map((m: any) => {
                    const Icon = mentionIcons[m.type] || Film;
                    return (
                      <a
                        key={m._id}
                        href={m.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.type}</p>
                        </div>
                        {m.link && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Reviews ── */}
            <section>
              <h2 className="font-heading text-2xl font-bold">Reviews</h2>
              <div className="mt-4 space-y-4">
                {reviews.map((r: any) => (
                  <div key={r._id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {(r.user_id?.display_name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {r.user_id?.display_name || "Anonymous"}
                          </p>
                          {r.is_verified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                )}
              </div>

              {/* Write a review */}
              <div className="mt-6 rounded-lg border p-5">
                <h3 className="font-heading text-lg font-semibold">Write a Review</h3>
                <div className="mt-3">
                  <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
                </div>
                <Textarea
                  placeholder="Share your experience..."
                  className="mt-3"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button
                  className="mt-3 gap-2"
                  onClick={() => submitReview.mutate()}
                  disabled={submitReview.isPending}
                >
                  {submitReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Review
                </Button>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <div className="sticky top-20">
              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <MapPin className="h-4 w-4" /> Get Directions
                </Button>
                <Button variant="outline" size="icon" onClick={() => setLiked(!liked)}>
                  <Heart className={`h-5 w-5 ${liked ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              </div>

              {(place.amenities || []).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-heading text-lg font-semibold">Amenities</h3>
                  <div className="mt-3 space-y-2">
                    {(place.amenities as any[]).map((a: any) => (
                      <AmenityBadge
                        key={a._id}
                        icon={amenityIcons[a.name] || Shield}
                        label={a.name}
                        status={a.status as "available" | "limited" | "unavailable"}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Full Gallery Modal ── */}
      {galleryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setGalleryModalOpen(false)}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-medium text-white/70">
              {lightboxIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              {canManageImages && (
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-destructive"
                  onClick={() => {
                    const img = images[lightboxIndex];
                    if (confirm("Remove this image?")) {
                      deleteImage.mutate(img._id);
                      if (lightboxIndex >= images.length - 1)
                        setLightboxIndex(Math.max(0, lightboxIndex - 1));
                    }
                  }}
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                onClick={() => setGalleryModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]?.image_url}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl"
              draggable={false}
            />
            {lightboxIndex > 0 && (
              <button
                className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={() => setLightboxIndex((i) => i - 1)}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                onClick={() => setLightboxIndex((i) => i + 1)}
              >
                <ChevronLeft className="h-6 w-6 rotate-180" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          <div
            className="shrink-0 overflow-x-auto px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex w-max gap-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={img._id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md transition-all ${
                    idx === lightboxIndex
                      ? "scale-110 ring-2 ring-white"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`Thumb ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PlaceDetailPage;
