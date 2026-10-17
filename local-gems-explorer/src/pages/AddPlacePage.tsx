import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/config/categories";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const amenityOptions = ["Parking", "Drinking Water", "Washroom", "Safety", "Network", "Food Nearby", "Shade", "Benches"];

const AddPlacePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, string>>({});
  const [mentions, setMentions] = useState([{ type: "Movie", title: "", link: "" }]);

  const addMention = () => setMentions([...mentions, { type: "Movie", title: "", link: "" }]);
  const removeMention = (i: number) => setMentions(mentions.filter((_, idx) => idx !== i));
  const updateMention = (i: number, field: string, value: string) => {
    const updated = [...mentions];
    updated[i] = { ...updated[i], [field]: value };
    setMentions(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) { toast.error("Please sign in"); navigate("/auth"); return; }
    if (!title || !category || !city || !country) { toast.error("Please fill in all required fields"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("history", history);
      formData.append("category", category);
      formData.append("city", city);
      formData.append("country", country);
      formData.append("address", address);
      formData.append("best_time_to_visit", bestTime);

      const amenityEntries = Object.entries(selectedAmenities).filter(([_, v]) => v);
      formData.append("amenities", JSON.stringify(amenityEntries.map(([name, status]) => ({ name, status }))));

      const validMentions = mentions.filter((m) => m.title.trim());
      formData.append("mentions", JSON.stringify(validMentions));

      images.forEach((file) => formData.append("images", file));

      const res = await fetch(`${BASE_URL}/places`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast.success("Place submitted for review!");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit place");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-heading text-2xl font-bold">Sign in Required</h1>
          <p className="mt-2 text-muted-foreground">You need to sign in to add a place.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl py-10">
        <h1 className="font-heading text-3xl font-bold">Add a Hidden Place</h1>
        <p className="mt-1 text-muted-foreground">Share your discovery with the world. All submissions are reviewed before publishing.</p>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <section className="space-y-4 rounded-lg border p-6">
            <h2 className="font-heading text-xl font-semibold">Basic Information</h2>
            <div>
              <Label htmlFor="title">Place Name *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Forgotten Alley Café" className="mt-1" required />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this place..." className="mt-1" rows={4} />
            </div>
            <div>
              <Label htmlFor="history">History & Origin</Label>
              <Textarea id="history" value={history} onChange={(e) => setHistory(e.target.value)} placeholder="Share the history or origin story..." className="mt-1" rows={3} />
            </div>
            <div>
              <Label htmlFor="bestTime">Best Time to Visit</Label>
              <Input id="bestTime" value={bestTime} onChange={(e) => setBestTime(e.target.value)} placeholder="e.g. Early morning, October-February" className="mt-1" />
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4 rounded-lg border p-6">
            <h2 className="font-heading text-xl font-semibold">Location</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>City *</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Agra" className="mt-1" required />
              </div>
              <div>
                <Label>Country *</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" className="mt-1" required />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Taj Mahal Gate, Tajganj, Agra"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">Street address, landmark, or area (optional)</p>
            </div>
          </section>

          {/* Images */}
          <section className="space-y-4 rounded-lg border p-6">
            <h2 className="font-heading text-xl font-semibold">Images</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((file, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${i}`} className="h-full w-full object-cover" />
                  <Button variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6" type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 transition-colors hover:border-primary hover:bg-muted">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-4 rounded-lg border p-6">
            <h2 className="font-heading text-xl font-semibold">Amenities</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {amenityOptions.map((a) => (
                <div key={a} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{a}</span>
                  <Select value={selectedAmenities[a] || ""} onValueChange={(v) => setSelectedAmenities({ ...selectedAmenities, [a]: v })}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="unavailable">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </section>

          {/* Mentions */}
          <section className="space-y-4 rounded-lg border p-6">
            <h2 className="font-heading text-xl font-semibold">Seen In / Mentions</h2>
            {mentions.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Select value={m.type} onValueChange={(v) => updateMention(i, "type", v)}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Movie">Movie</SelectItem>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Title" className="flex-1" value={m.title} onChange={(e) => updateMention(i, "title", e.target.value)} />
                <Input placeholder="Link (optional)" className="flex-1" value={m.link} onChange={(e) => updateMention(i, "link", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMention(i)}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addMention} className="gap-1">
              <Plus className="h-4 w-4" /> Add Mention
            </Button>
          </section>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AddPlacePage;
