import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  available:   "bg-primary/10 text-primary",
  limited:     "bg-orange-100 text-orange-700",
  unavailable: "bg-destructive/10 text-destructive",
};

const AdminAmenities = () => {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ["admin-amenities"],
    queryFn: () => api.get("/admin/amenities", token!),
    enabled: !!token,
  });

  const updateAmenity = useMutation({
    mutationFn: ({ placeId, amenityId, status }: { placeId: string; amenityId: string; status: string }) =>
      api.patch(`/admin/amenities/${placeId}/${amenityId}`, { status }, token!),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-amenities"] });
      setEdits((prev) => { const n = { ...prev }; delete n[vars.amenityId]; return n; });
      toast.success("Amenity updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold">Manage Amenities</h1>
      <p className="text-muted-foreground">Validate and update amenity information for each place</p>

      <div className="mt-6 rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>Amenity</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Update Status</TableHead>
                <TableHead className="text-right">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No amenities found</TableCell></TableRow>
              ) : amenities.map((a: any) => {
                const key = a._id;
                const currentStatus = edits[key] ?? a.status;
                const isDirty = edits[key] && edits[key] !== a.status;
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{a.placeTitle}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentStatus}
                        onValueChange={(v) => setEdits((prev) => ({ ...prev, [key]: v }))}
                      >
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-primary"
                        disabled={!isDirty || updateAmenity.isPending}
                        onClick={() => updateAmenity.mutate({ placeId: a.placeId, amenityId: a._id, status: edits[key] })}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminAmenities;
