import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PlaceCard from "@/components/shared/PlaceCard";

interface Place {
  id: string;
  title: string;
  image: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
}

interface TrendingSectionProps {
  title: string;
  subtitle: string;
  places: Place[];
}

// "Trending" = most reviewed places
const TrendingSection = ({ title, subtitle, places }: TrendingSectionProps) => {
  const trending = [...places].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);

  return (
    <section className="bg-muted/50 py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold">{title}</h2>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/explore" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((p) => <PlaceCard key={p.id} {...p} />)}
          {trending.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No places yet. Be the first to add one!</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
