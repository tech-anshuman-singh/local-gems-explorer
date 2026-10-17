import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
            <Compass className="h-5 w-5" /> Agra LocTour
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Discover hidden places around the world, shared by explorers like you.</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold">Explore</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/explore" className="hover:text-primary">All Places</Link>
            <Link to="/explore?category=cafes" className="hover:text-primary">Cafes</Link>
            <Link to="/explore?category=nature" className="hover:text-primary">Nature</Link>
            <Link to="/explore?category=temples" className="hover:text-primary">Temples</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold">Community</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/add-place" className="hover:text-primary">Add a Place</Link>
            <Link to="/profile" className="hover:text-primary">My Profile</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold">Company</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        © 2026 Agra LocTour. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
