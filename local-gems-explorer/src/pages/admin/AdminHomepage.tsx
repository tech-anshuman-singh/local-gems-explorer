import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sectionLabels: Record<string, string> = {
  hero:           "🏔️ Hero Section",
  categories:     "📂 Categories",
  trending:       "🔥 Trending Places",
  top_rated:      "⭐ Top Rated",
  recently_added: "🆕 Recently Added",
  map:            "🗺️ Map Preview",
  cta:            "📣 Call to Action",
};

const AdminHomepage = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, any>>({});

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: () => api.get("/homepage/sections"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        Object.entries(edits).map(([id, changes]) =>
          api.put(`/homepage/sections/${id}`, changes, token!)
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      setEdits({});
      toast.success("Homepage sections saved!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setField = (id: string, field: string, value: any) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const moveSection = (index: number, dir: "up" | "down") => {
    const sorted = [...sections].sort((a: any, b: any) => a.sort_order - b.sort_order);
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[index] as any;
    const b = sorted[swapIdx] as any;
    setField(a._id, "sort_order", b.sort_order);
    setField(b._id, "sort_order", a.sort_order);
  };

  const sorted = [...sections]
    .sort((a: any, b: any) => {
      const ao = edits[a._id]?.sort_order ?? a.sort_order;
      const bo = edits[b._id]?.sort_order ?? b.sort_order;
      return ao - bo;
    });

  const hasChanges = Object.keys(edits).length > 0;

  if (isLoading) return (
    <div className="flex justify-center p-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Homepage Sections</h1>
          <p className="text-muted-foreground">Reorder, toggle visibility, and edit section content</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={!hasChanges || saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {sorted.map((section: any, index: number) => {
          const e = edits[section._id] || {};
          const isVisible = e.is_visible ?? section.is_visible;

          return (
            <Card key={section._id} className={`shadow-card transition-opacity ${!isVisible ? "opacity-50" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-xs" onClick={() => moveSection(index, "up")} disabled={index === 0}>▲</Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-xs" onClick={() => moveSection(index, "down")} disabled={index === sorted.length - 1}>▼</Button>
                </div>

                <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {sectionLabels[section.section_type] || section.section_type}
                  </p>
                  <Input
                    value={e.title ?? section.title}
                    onChange={(ev) => setField(section._id, "title", ev.target.value)}
                    placeholder="Section title"
                    className="font-semibold"
                  />
                  <Input
                    value={e.subtitle ?? section.subtitle ?? ""}
                    onChange={(ev) => setField(section._id, "subtitle", ev.target.value)}
                    placeholder="Subtitle (optional)"
                    className="text-sm"
                  />
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {isVisible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch
                    checked={!!isVisible}
                    onCheckedChange={(v) => setField(section._id, "is_visible", v)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHomepage;
