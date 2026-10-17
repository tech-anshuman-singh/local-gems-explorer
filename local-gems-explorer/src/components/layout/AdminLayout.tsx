import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, MapPin, Image, Star, Film, Wrench, Users, Compass, LogOut, Home, Anchor, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/admin",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/homepage",  icon: Home,            label: "Homepage" },
  { to: "/admin/places",    icon: MapPin,           label: "Places" },
  { to: "/admin/images",    icon: Image,            label: "Images" },
  { to: "/admin/reviews",   icon: Star,             label: "Reviews" },
  { to: "/admin/mentions",  icon: Film,             label: "Mentions" },
  { to: "/admin/amenities", icon: Wrench,           label: "Amenities" },
  { to: "/admin/users",     icon: Users,            label: "Users" },
  { to: "/admin/crew",      icon: Anchor,           label: "DaGama Crew" },
];

const AdminLayout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Wait for auth to restore from localStorage
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but not admin/moderator → show access denied
  if (!["admin", "moderator"].includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="font-heading text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        <Link to="/" className="text-primary underline hover:text-primary/80">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Compass className="h-6 w-6 text-sidebar-primary" />
          <span className="font-heading text-lg font-bold">Agra LocTour</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {/* Logged-in user info */}
          <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {(user.display_name || user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{user.display_name || user.email}</p>
              <p className="text-xs capitalize text-sidebar-foreground/50">{user.role}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
