import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}

const StarRating = ({ rating, max = 5, size = 20, interactive = false, onChange }: StarRatingProps) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }, (_, i) => (
      <Star
        key={i}
        className={`${interactive ? "cursor-pointer" : ""} ${
          i < rating ? "fill-accent text-accent" : "text-muted-foreground/30"
        }`}
        size={size}
        onClick={() => interactive && onChange?.(i + 1)}
      />
    ))}
  </div>
);

export default StarRating;
