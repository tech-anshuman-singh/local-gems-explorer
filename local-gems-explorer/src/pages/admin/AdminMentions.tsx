import { Check, X, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  active:   "bg-primary/10 text-primary",
  pending:  "bg-orange-100 text-orange-700",
  inactive: "bg-muted text-muted-foreground",
};

const AdminMentions = () => {
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: mentions = [], isLoading } = useQuery({
    queryKey: ["admin-mentions"],
    queryFn: () => api.get("/admin/mentions", token!),
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: ({ placeId, mentionId, status }: { placeId: string; mentionId: string; status: string }) =>
      api.patch(`/admin/mentions/${placeId}/${mentionId}/status`, { status }, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-mentions"] }); toast.success("Mention updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMention = useMutation({
    mutationFn: ({ placeId, mentionId }: { placeId: string; mentionId: string }) =>
      api.delete(`/admin/mentions/${placeId}/${mentionId}`, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-mentions"] }); toast.success("Mention deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Manage Mentions</h1>
      <p className="text-muted-foreground">Approve or remove media mentions and references</p>

      <div className="mt-6 rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No mentions found</TableCell></TableRow>
              ) : mentions.map((m: any) => (
                <TableRow key={m._id}>
                  <TableCell className="font-medium">{m.placeTitle}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{m.type}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{m.title}</TableCell>
                  <TableCell>
                    {m.link ? (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[m.status] || ""}`}>
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {m.status !== "active" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Approve"
                          onClick={() => updateStatus.mutate({ placeId: m.placeId, mentionId: m._id, status: "active" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {m.status === "active" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" title="Deactivate"
                          onClick={() => updateStatus.mutate({ placeId: m.placeId, mentionId: m._id, status: "inactive" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete"
                        onClick={() => { if (confirm("Delete this mention?")) deleteMention.mutate({ placeId: m.placeId, mentionId: m._id }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminMentions;
