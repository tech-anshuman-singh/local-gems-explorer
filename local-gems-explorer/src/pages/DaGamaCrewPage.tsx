import { MapPin, Star, Instagram, Twitter, Globe, Loader2, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const rankLabel = (i: number) => {
  if (i === 0) return { label: "🥇 Top Explorer", cls: "bg-accent text-accent-foreground" };
  if (i === 1) return { label: "🥈 2nd Place",    cls: "bg-muted text-muted-foreground" };
  if (i === 2) return { label: "🥉 3rd Place",    cls: "bg-orange-100 text-orange-700" };
  return null;
};

const DaGamaCrewPage = () => {
  const { data: crew = [], isLoading } = useQuery({
    queryKey: ["crew"],
    queryFn: () => api.get("/crew"),
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-hero py-16 text-center text-primary-foreground">
        <div className="container">
          <Compass className="mx-auto mb-4 h-12 w-12 opacity-90" />
          <h1 className="font-heading text-4xl font-bold md:text-5xl">The DaGama Crew</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg opacity-85">
            Meet the explorers behind the hidden gems. Ranked by their contributions to the community.
          </p>
        </div>
      </section>

      <div className="container py-14">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : crew.length === 0 ? (
          <p className="text-center text-muted-foreground">No crew members yet.</p>
        ) : (
          <>
            {/* Top 3 podium */}
            {crew.length >= 3 && (
              <div className="mb-14">
                <h2 className="mb-8 text-center font-heading text-2xl font-bold">Top Contributors</h2>
                <div className="flex flex-col items-end justify-center gap-4 sm:flex-row">
                  <PodiumCard member={crew[1]} rank={1} height="h-40" />
                  <PodiumCard member={crew[0]} rank={0} height="h-52" />
                  <PodiumCard member={crew[2]} rank={2} height="h-32" />
                </div>
              </div>
            )}

            {/* Full crew grid */}
            <h2 className="mb-6 font-heading text-2xl font-bold">All Crew Members</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {crew.map((member: any, i: number) => (
                <CrewCard key={member._id} member={member} rank={i} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

// ── Podium Card ───────────────────────────────────────────────────────────────
const PodiumCard = ({ member, rank, height }: { member: any; rank: number; height: string }) => (
  <div className="flex flex-1 flex-col items-center gap-3 text-center">
    <div className="relative">
      <Avatar member={member} size="lg" />
      <span className="absolute -top-2 -right-2 text-2xl">{rank === 0 ? "👑" : rank === 1 ? "🥈" : "🥉"}</span>
    </div>
    <div>
      <p className="font-heading font-bold">{member.display_name}</p>
      <p className="text-xs text-muted-foreground">{member.role_title}</p>
      <div className="mt-1 flex justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{member.stats?.places ?? 0}</span>
        <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{member.stats?.reviews ?? 0}</span>
      </div>
    </div>
    <div className={`w-full rounded-t-lg ${height} flex items-center justify-center ${
      rank === 0 ? "bg-accent/30" : rank === 1 ? "bg-muted" : "bg-orange-100"
    }`}>
      <span className="font-heading text-3xl font-bold text-muted-foreground/40">#{rank + 1}</span>
    </div>
  </div>
);

// ── Crew Card ─────────────────────────────────────────────────────────────────
const CrewCard = ({ member, rank }: { member: any; rank: number }) => {
  const badge = rankLabel(rank);
  return (
    <div className="group flex flex-col rounded-xl border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <Avatar member={member} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold truncate">{member.display_name}</h3>
            {badge && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-primary font-medium">{member.role_title}</p>
        </div>
      </div>

      {member.bio && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
        <Stat icon={<MapPin className="h-3.5 w-3.5" />}  value={member.stats?.places ?? 0}  label="Places"  />
        <Stat icon={<Star className="h-3.5 w-3.5" />}    value={member.stats?.reviews ?? 0} label="Reviews" />
        <Stat icon={<Compass className="h-3.5 w-3.5" />} value={member.stats?.total ?? 0}   label="Total"   />
      </div>

      {member.social_links && (
        <div className="mt-3 flex gap-2">
          {member.social_links.instagram && (
            <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {member.social_links.twitter && (
            <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {member.social_links.website && (
            <a href={member.social_links.website} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors">
              <Globe className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const Avatar = ({ member, size }: { member: any; size: "md" | "lg" }) => {
  const sz = size === "lg" ? "h-16 w-16 text-2xl" : "h-12 w-12 text-lg";
  const initials = member.display_name.substring(0, 2).toUpperCase();
  return member.avatar_url ? (
    <img src={member.avatar_url} alt={member.display_name}
      className={`${sz} rounded-full object-cover ring-2 ring-primary/20 shrink-0`} />
  ) : (
    <div className={`${sz} shrink-0 flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-primary/20`}>
      {initials}
    </div>
  );
};

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="flex items-center gap-1 text-primary">{icon}<span className="font-bold text-sm">{value}</span></div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export default DaGamaCrewPage;
