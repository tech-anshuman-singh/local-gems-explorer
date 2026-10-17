import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import AddPlacePage from "./pages/AddPlacePage";
import UserProfilePage from "./pages/UserProfilePage";
import AuthPage from "./pages/AuthPage";
import DaGamaCrewPage from "./pages/DaGamaCrewPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlaces from "./pages/admin/AdminPlaces";
import AdminImages from "./pages/admin/AdminImages";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMentions from "./pages/admin/AdminMentions";
import AdminAmenities from "./pages/admin/AdminAmenities";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminCrew from "./pages/admin/AdminCrew";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/explore"     element={<ExplorePage />} />
            <Route path="/place/:id"   element={<PlaceDetailPage />} />
            <Route path="/add-place"   element={<AddPlacePage />} />
            <Route path="/profile"     element={<UserProfilePage />} />
            <Route path="/auth"        element={<AuthPage />} />
            <Route path="/dagama-crew" element={<DaGamaCrewPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="places"          element={<AdminPlaces />} />
              <Route path="images"          element={<AdminImages />} />
              <Route path="reviews"         element={<AdminReviews />} />
              <Route path="mentions"        element={<AdminMentions />} />
              <Route path="amenities"       element={<AdminAmenities />} />
              <Route path="users"           element={<AdminUsers />} />
              <Route path="homepage"        element={<AdminHomepage />} />
              <Route path="crew"            element={<AdminCrew />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
