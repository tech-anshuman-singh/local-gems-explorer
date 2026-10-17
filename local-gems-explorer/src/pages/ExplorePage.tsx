import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlaceCard from "@/components/shared/PlaceCard";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/config/categories";
import placeCafe from "@/assets/place-cafe.jpg";

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("recent");

  // Sync URL params → state when URL changes (e.g. clicking a category card)
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q = searchParams.get("q") || "";
    setCategoryFilter(cat);
    setSearch(q);
  }, [searchParams]);

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    const next = new URLSearchParams(searchParams);
    if (val === "all") next.delete("category");
    else next.set("category", val);
    setSearchParams(next);
  };

  const { data: places = [], isLoading } = useQuery({
    queryKey: ["places", categoryFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({ sort: sortBy });
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const data = await api.get(`/places?${params.toString()}`);
      return data.map((p: any) => ({
        id: p._id,
        title: p.title,
        image:
          p.place_images?.find((i: any) => i.is_primary)?.image_url ||
          p.place_images?.[0]?.image_url ||
          placeCafe,
        location: `${p.city}, ${p.country}`,
        category: p.category,
        rating: p.avgRating || 0,
        reviewCount: p.reviewCount || 0,
      }));
    },
  });

  const filtered = places.filter(
    (p: any) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  const sorted =
    sortBy === "rating"
      ? [...filtered].sort((a: any, b: any) => b.rating - a.rating)
      : sortBy === "reviews"
      ? [...filtered].sort((a: any, b: any) => b.reviewCount - a.reviewCount)
      : filtered;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <h1 className="font-heading text-3xl font-bold">Explore Hidden Places</h1>
        <p className="mt-1 text-muted-foreground">Browse and discover secret spots around the world</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center text-muted-foreground">Loading places...</div>
        ) : sorted.length === 0 ? (
          <div className="mt-8 text-center text-muted-foreground">No places found. Be the first to add one!</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p: any) => (
              <PlaceCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExplorePage;
