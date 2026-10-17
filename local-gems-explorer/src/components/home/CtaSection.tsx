import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  title: string;
  subtitle: string;
}

// "Know a Hidden Gem?" — call-to-action section
const CtaSection = ({ title, subtitle }: CtaSectionProps) => (
  <section className="bg-gradient-hero py-16 text-center text-primary-foreground">
    <div className="container">
      <h2 className="font-heading text-3xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg opacity-90">{subtitle}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/add-place">
          <Button size="lg" variant="secondary" className="gap-2">
            Add a Place <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CtaSection;
