-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Places
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  history TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  best_time_to_visit TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved places viewable by everyone" ON public.places
  FOR SELECT USING (status = 'approved' OR auth.uid() = submitted_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can submit places" ON public.places
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can update places" ON public.places
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete places" ON public.places
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Place Images
CREATE TABLE public.place_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved images viewable by everyone" ON public.place_images
  FOR SELECT USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can upload images" ON public.place_images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage images" ON public.place_images
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete images" ON public.place_images
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Amenities
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'limited', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Amenities viewable by everyone" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add amenities" ON public.amenities
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage amenities" ON public.amenities
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete amenities" ON public.amenities
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Mentions
CREATE TABLE public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Movie', 'Book', 'Social')),
  title TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved mentions viewable by everyone" ON public.mentions
  FOR SELECT USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can add mentions" ON public.mentions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage mentions" ON public.mentions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete mentions" ON public.mentions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Homepage Sections
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL UNIQUE CHECK (section_type IN ('hero', 'categories', 'trending', 'top_rated', 'recently_added', 'map', 'cta')),
  title TEXT NOT NULL,
  subtitle TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Homepage sections viewable by everyone" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage homepage sections" ON public.homepage_sections
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed homepage sections
INSERT INTO public.homepage_sections (section_type, title, subtitle, sort_order) VALUES
  ('hero', 'Discover Hidden Places Around You', 'Explore secret spots shared by travelers worldwide. From ancient temples to hidden cafes.', 0),
  ('categories', 'Explore by Category', 'Find places that match your interest', 1),
  ('trending', 'Trending Hidden Places', 'Most popular discoveries this week', 2),
  ('top_rated', 'Top Rated Places', 'Highest rated hidden gems by our community', 3),
  ('recently_added', 'Recently Added', 'Fresh discoveries from fellow explorers', 4),
  ('map', 'Places Around the World', 'Hidden gems are everywhere — discover what''s near you', 5),
  ('cta', 'Know a Hidden Gem?', 'Share your favorite secret spots with the world. Help fellow explorers discover the extraordinary.', 6);

-- Storage bucket for place images
INSERT INTO storage.buckets (id, name, public) VALUES ('place-images', 'place-images', true);

CREATE POLICY "Place images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'place-images');
CREATE POLICY "Authenticated users can upload place images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'place-images');
CREATE POLICY "Admins can delete place images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'place-images' AND public.has_role(auth.uid(), 'admin'));