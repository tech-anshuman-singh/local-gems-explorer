import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlaceCardProps {
  id: string;
  title: string;
  image: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
}

const PlaceCard = ({ id, title, image, location, category, rating, reviewCount }: PlaceCardProps) => (
  <Link
    to={`/place/${id}`}
    className="group block overflow-hidden rounded-lg border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground">{category}</Badge>
    </div>
    <div className="p-4">
      <h3 className="font-heading text-lg font-semibold leading-tight">{title}</h3>
      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" /> {location}
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-accent text-accent" />
        <span className="font-medium">{rating.toFixed(1)}</span>
        <span className="text-muted-foreground">({reviewCount})</span>
      </div>
    </div>
  </Link>
);

export default PlaceCard;
