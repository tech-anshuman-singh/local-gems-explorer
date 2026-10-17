import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import placeCafe from "@/assets/place-cafe.jpg";

const AdminImages = () => {
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin-images"],
    queryFn: () => api.get("/admin/images", token!),
    enabled: !!token,
  });

  const deleteImage = useMutation({
    mutationFn: ({ placeId, imageId }: { placeId: string; imageId: string }) =>
      api.delete(`/admin/images/${placeId}/${imageId}`, token!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-images"] }); toast.success("Image deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Manage Images</h1>
      <p className="text-muted-foreground">Review and remove uploaded place images</p>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : images.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">No images found.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img: any) => (
            <div key={img._id} className="overflow-hidden rounded-lg border shadow-card">
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={img.image_url || placeCafe}
                  alt={img.placeTitle}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = placeCafe; }}
                />
              </div>
              <div className="p-3">
                <p className="truncate font-medium text-sm">{img.placeTitle}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {img.is_primary && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Primary</span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                      img.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{img.status}</span>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => { if (confirm("Delete this image?")) deleteImage.mutate({ placeId: img.placeId, imageId: img._id }); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminImages;
