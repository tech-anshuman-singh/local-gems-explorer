import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
}

const HeroSection = ({ title, subtitle, searchQuery, onSearchChange, onSearchSubmit }: HeroSectionProps) => (
  <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
    <img src={heroBg} alt="Hidden temple" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-foreground/60" />
    <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
      <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-primary-foreground/80">{subtitle}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search places, cities, categories..."
            className="h-12 bg-card pl-10 text-foreground"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          />
        </div>
        <Button size="lg" className="h-12 gap-2" onClick={onSearchSubmit}>
          <MapPin className="h-5 w-5" /> Explore
        </Button>
      </div>
    </div>
  </section>
);

export default HeroSection;
