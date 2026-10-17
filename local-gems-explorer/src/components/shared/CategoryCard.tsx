import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  image: string;
  count: number;
}

const CategoryCard = ({ icon: Icon, label, value, image, count }: CategoryCardProps) => (
  <Link
    to={`/explore?category=${value}`}
    className="group relative flex flex-col items-center justify-end overflow-hidden rounded-xl border p-6 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    style={{ minHeight: 180 }}
  >
    <div className="absolute inset-0">
      <img src={image} alt={label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-foreground/50 transition-colors group-hover:bg-foreground/40" />
    </div>
    <div className="relative z-10 text-primary-foreground">
      <Icon className="mx-auto mb-2 h-8 w-8" />
      <h3 className="font-heading text-lg font-semibold">{label}</h3>
      <p className="text-sm opacity-80">{count} places</p>
    </div>
  </Link>
);

export default CategoryCard;
