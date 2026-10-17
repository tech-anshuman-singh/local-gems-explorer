import { Trash2, ShieldCheck, ShieldOff, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdminReviews = () => {
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => api.get("/admin/reviews", token!),
    enabled: !!token,
  });

  const toggleVerify = useMutation({
    mutationFn: ({ id, is_verified }: { id: string; is_verified: boolean }) =>
      api.patch(`/admin/reviews/${id}/verify`, { is_verified }, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Manage Reviews</h1>
      <p className="text-muted-foreground">Moderate and verify user reviews</p>

      <div className="mt-6 rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Place</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No reviews found</TableCell></TableRow>
              ) : reviews.map((r: any) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.user_id?.display_name || "—"}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm">{r.place_id?.title || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span className="font-medium">{r.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {r.comment || <span className="italic">No comment</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {r.is_verified
                      ? <Badge className="bg-primary/10 text-primary text-xs border-0">Verified</Badge>
                      : <Badge variant="outline" className="text-xs text-muted-foreground">Unverified</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost" size="icon" className={`h-8 w-8 ${r.is_verified ? "text-muted-foreground" : "text-primary"}`}
                        title={r.is_verified ? "Unverify" : "Verify"}
                        onClick={() => toggleVerify.mutate({ id: r._id, is_verified: !r.is_verified })}
                      >
                        {r.is_verified ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete"
                        onClick={() => { if (confirm("Delete this review?")) deleteReview.mutate(r._id); }}
                      >
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

export default AdminReviews;
