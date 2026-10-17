import { useState, useRef } from "react";
import { GripVertical, Eye, EyeOff, Trash2, Loader2, MapPin, Star, UserPlus, Compass, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CrewMember {
  _id: string;
  display_name: string;
  role_title?: string;
  bio?: string;
  avatar_url?: string;
  is_featured: boolean;
  sort_order: number;
  user_id?: any;
  stats: { places: number; reviews: number; total: number };
}

interface PlatformUser {
  _id: string;
  display_name?: string;
  email: string;
  role: string;
  stats: { places: number; reviews: number; total: number };
  inCrew: boolean;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
const Avatar = ({ name, url, size = "sm" }: { name: string; url?: string; size?: "sm" | "md" }) => {
  const sz = size === "md" ? "h-10 w-10 text-base" : "h-8 w-8 text-xs";
  return url ? (
    <img src={url} alt={name} className={`${sz} shrink-0 rounded-full object-cover ring-2 ring-primary/20`} />
  ) : (
    <div className={`${sz} shrink-0 flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground`}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminCrew = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<CrewMember[] | null>(null);
  const dragOver = useRef<string | null>(null);

  // ── Queries ──
  const { data: crew = [], isLoading: crewLoading } = useQuery<CrewMember[]>({
    queryKey: ["admin-crew"],
    queryFn: () => api.get("/crew/all", token!),
    enabled: !!token,
    select: (d) => [...d].sort((a, b) => a.sort_order - b.sort_order),
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<PlatformUser[]>({
    queryKey: ["crew-users"],
    queryFn: () => api.get("/crew/users", token!),
    enabled: !!token,
  });

  const displayed = localOrder ?? crew;

  // ── Mutations ──
  const addMember = useMutation({
    mutationFn: (u: PlatformUser) =>
      api.post("/crew", {
        user_id: u._id,
        display_name: u.display_name || u.email,
        role_title: u.role === "moderator" ? "Moderator" : "Explorer",
        is_featured: true,
        sort_order: crew.length,
      }, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crew"] });
      qc.invalidateQueries({ queryKey: ["crew-users"] });
      qc.invalidateQueries({ queryKey: ["crew"] });
      toast.success("Added to crew!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: (m: CrewMember) =>
      api.put(`/crew/${m._id}`, { ...m, is_featured: !m.is_featured }, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crew"] });
      qc.invalidateQueries({ queryKey: ["crew"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMember = useMutation({
    mutationFn: (id: string) => api.delete(`/crew/${id}`, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crew"] });
      qc.invalidateQueries({ queryKey: ["crew-users"] });
      qc.invalidateQueries({ queryKey: ["crew"] });
      toast.success("Removed from crew");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveOrder = useMutation({
    mutationFn: (order: { id: string; sort_order: number }[]) =>
      api.patch("/crew/reorder", { order }, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crew"] });
      qc.invalidateQueries({ queryKey: ["crew"] });
      setLocalOrder(null);
      toast.success("Order saved!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Drag handlers ──
  const onDragStart = (id: string) => setDragging(id);
  const onDragEnter = (id: string) => { dragOver.current = id; };
  const onDragEnd = () => {
    if (!dragging || !dragOver.current || dragging === dragOver.current) {
      setDragging(null); dragOver.current = null; return;
    }
    const list = [...displayed];
    const fromIdx = list.findIndex((m) => m._id === dragging);
    const toIdx   = list.findIndex((m) => m._id === dragOver.current);
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    const reindexed = list.map((m, i) => ({ ...m, sort_order: i }));
    setLocalOrder(reindexed);
    setDragging(null);
    dragOver.current = null;
  };

  const hasOrderChange = localOrder !== null;

  // ── User picker filter ──
  const filteredUsers = allUsers.filter((u) => {
    const name = (u.display_name || u.email).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">DaGama Crew</h1>
        <p className="text-muted-foreground">Pick contributors, drag to reorder, toggle visibility on the public page</p>
      </div>

      {/* ── Section 1: Current Crew (drag to reorder) ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-semibold">Current Crew Order</h2>
          {hasOrderChange && (
            <Button size="sm" onClick={() =>
              saveOrder.mutate(localOrder!.map((m, i) => ({ id: m._id, sort_order: i })))
            } disabled={saveOrder.isPending} className="gap-2">
              {saveOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Order
            </Button>
          )}
        </div>

        {crewLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : displayed.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Compass className="mx-auto mb-2 h-8 w-8 opacity-30" />
            No crew members yet. Add users from the list below.
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((m, i) => (
              <div
                key={m._id}
                draggable
                onDragStart={() => onDragStart(m._id)}
                onDragEnter={() => onDragEnter(m._id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`flex items-center gap-3 rounded-lg border bg-card p-3 shadow-card transition-all cursor-grab active:cursor-grabbing select-none
                  ${dragging === m._id ? "opacity-40 scale-95" : ""}
                  ${!m.is_featured ? "opacity-60" : ""}
                `}
              >
                {/* Drag handle */}
                <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground/50" />

                {/* Rank */}
                <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>

                {/* Avatar */}
                <Avatar name={m.display_name} url={m.avatar_url} size="md" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{m.display_name}</span>
                    {m.role_title && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{m.role_title}</span>
                    )}
                    {!m.is_featured && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.stats.places} places</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{m.stats.reviews} reviews</span>
                    <span className="font-medium text-primary">{m.stats.total} total</span>
                  </div>
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {m.is_featured
                    ? <Eye className="h-4 w-4 text-primary" />
                    : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch
                    checked={!!m.is_featured}
                    onCheckedChange={() => toggleFeatured.mutate(m)}
                  />
                </div>

                {/* Delete */}
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive"
                  onClick={() => { if (confirm(`Remove ${m.display_name} from crew?`)) deleteMember.mutate(m._id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2: All Users Picker ── */}
      <section>
        <h2 className="font-heading text-lg font-semibold mb-1">All Users — Sorted by Contributions</h2>
        <p className="text-sm text-muted-foreground mb-3">Click "Add to Crew" to feature a user on the public page</p>

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 max-w-xs"
        />

        {usersLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-lg border overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Places</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Reviews</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u, i) => (
                  <tr key={u._id} className={`transition-colors hover:bg-muted/30 ${u.inCrew ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {(u.display_name || u.email).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.display_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        {i === 0 && <span className="text-base">🥇</span>}
                        {i === 1 && <span className="text-base">🥈</span>}
                        {i === 2 && <span className="text-base">🥉</span>}
                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          u.role === "admin" ? "bg-primary/10 text-primary" :
                          u.role === "moderator" ? "bg-blue-100 text-blue-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{u.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{u.stats.places}</td>
                    <td className="px-4 py-3 text-center font-semibold">{u.stats.reviews}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-primary">{u.stats.total}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.inCrew ? (
                        <Badge className="bg-primary/10 text-primary border-0">In Crew ✓</Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1 h-7"
                          onClick={() => addMember.mutate(u)}
                          disabled={addMember.isPending}>
                          <UserPlus className="h-3.5 w-3.5" /> Add
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCrew;
