import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CategoryCard from "@/components/shared/CategoryCard";

interface CategoryItem {
  icon: any;
  label: string;
  value: string;
  image: string;
  count: number;
}

interface CategoriesSectionProps {
  title: string;
  subtitle: string;
  categories: CategoryItem[];
}

const CategoriesSection = ({ title, subtitle, categories }: CategoriesSectionProps) => (
  <section className="container py-16">
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="font-heading text-3xl font-bold">{title}</h2>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      <Link to="/explore" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {categories.map((c) => (
        <CategoryCard key={c.label} {...c} />
      ))}
    </div>
  </section>
);

export default CategoriesSection;
