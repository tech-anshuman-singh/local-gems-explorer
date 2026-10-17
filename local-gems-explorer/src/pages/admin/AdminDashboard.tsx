import { Users, MapPin, Clock, Star, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const { token } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats", token!),
    enabled: !!token,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const statCards = [
    { label: "Total Users",       value: stats?.totalUsers  ?? 0, icon: Users,         color: "text-blue-500" },
    { label: "Approved Places",   value: stats?.totalPlaces ?? 0, icon: MapPin,         color: "text-primary" },
    { label: "Total Reviews",     value: stats?.totalReviews ?? 0, icon: Star,          color: "text-accent" },
    { label: "Pending Approvals", value: stats?.pending     ?? 0, icon: Clock,          color: "text-orange-500" },
  ];

  const approvalRate = stats?.totalPlaces && (stats.totalPlaces + stats.pending + stats.rejected)
    ? Math.round((stats.totalPlaces / (stats.totalPlaces + stats.pending + stats.rejected)) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Live overview of your platform</p>

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {(stats?.activity || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {(stats?.activity || []).map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.type === "place" ? "bg-primary" : "bg-accent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-card">
          <CardHeader><CardTitle>Platform Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: "Approved places",  value: stats?.totalPlaces  ?? 0, max: Math.max(stats?.totalPlaces ?? 1, 1), suffix: "" },
                { label: "Pending review",   value: stats?.pending      ?? 0, max: Math.max(stats?.pending ?? 1, 1),     suffix: "" },
                { label: "Total reviews",    value: stats?.totalReviews ?? 0, max: Math.max(stats?.totalReviews ?? 1, 1), suffix: "" },
                { label: "Approval rate",    value: approvalRate,              max: 100,                                  suffix: "%" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}{s.suffix}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
