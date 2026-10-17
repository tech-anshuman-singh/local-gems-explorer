import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Menu, X, Plus, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/explore?category=sports", label: "Sports" },
  { to: "/explore?category=fun-activity", label: "Fun Activity" },
  { to: "/dagama-crew", label: "DaGama Crew" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Compass className="h-6 w-6" />
          <span className="hidden sm:inline">Agra LocTour</span>
          <span className="sm:hidden">ALT</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                location.pathname === l.to ? "bg-muted text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/add-place">
            <Button size="sm" className="hidden gap-1 md:inline-flex">
              <Plus className="h-4 w-4" /> Add Place
            </Button>
          </Link>
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-1">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-card p-4 md:hidden">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-4 py-3 text-sm font-medium hover:bg-muted">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/auth" onClick={() => setOpen(false)} className="block rounded-md px-4 py-3 text-sm font-medium text-primary hover:bg-muted">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
