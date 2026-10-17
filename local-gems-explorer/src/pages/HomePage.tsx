import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TrendingSection from "@/components/home/TrendingSection";
import TopRatedSection from "@/components/home/TopRatedSection";
import RecentlyAddedSection from "@/components/home/RecentlyAddedSection";
import CtaSection from "@/components/home/CtaSection";

import { api } from "@/lib/api";
import { CATEGORIES } from "@/config/categories";
import placeCafe from "@/assets/place-cafe.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: sections = [] } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: () => api.get("/homepage/sections"),
  });

  const { data: places = [] } = useQuery({
    queryKey: ["homepage-places"],
    queryFn: async () => {
      const data = await api.get("/places?limit=8&sort=recent");
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

  const { data: categoryCounts = {} } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const data = await api.get("/places");
      const counts: Record<string, number> = {};
      data.forEach((p: any) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      return counts;
    },
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getSection = (type: string) =>
    sections.find((s: any) => s.section_type === type);

  const handleSearch = () => {
    if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    else navigate("/explore");
  };

  const categories = CATEGORIES.map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value,
    image: cat.image,
    count: (categoryCounts as any)[cat.value] || 0,
  }));

  const visibleSections = [...sections]
    .filter((s: any) => s.is_visible)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  // ── Section renderer ───────────────────────────────────────────────────────
  const renderSection = (type: string) => {
    const s = getSection(type);
    if (!s || !s.is_visible) return null;

    switch (type) {
      case "hero":
        return (
          <HeroSection
            key="hero"
            title={s.title}
            subtitle={s.subtitle}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
          />
        );

      case "categories":
        return (
          <CategoriesSection
            key="categories"
            title={s.title}
            subtitle={s.subtitle}
            categories={categories}
          />
        );

      case "trending":
        return (
          <TrendingSection
            key="trending"
            title={s.title}
            subtitle={s.subtitle}
            places={places}
          />
        );

      case "top_rated":
        return (
          <TopRatedSection
            key="top_rated"
            title={s.title}
            subtitle={s.subtitle}
            places={places}
          />
        );

      case "recently_added":
        return (
          <RecentlyAddedSection
            key="recently_added"
            title={s.title}
            subtitle={s.subtitle}
            places={places}
          />
        );

      case "cta":
        return (
          <CtaSection
            key="cta"
            title={s.title}
            subtitle={s.subtitle}
          />
        );

      default:
        return null;
    }
  };

  const sectionOrder =
    visibleSections.length > 0
      ? visibleSections.map((s: any) => s.section_type)
      : ["hero", "categories", "trending", "top_rated", "recently_added", "cta"];

  return (
    <div className="min-h-screen">
      <Navbar />
      {sectionOrder.map((type: string) => renderSection(type))}
      <Footer />
    </div>
  );
};

export default HomePage;
