/**
 * Full database seeder for Agra LocTour
 * Covers all models: User, Profile, CrewMember, HomepageSection, Place, Review
 *
 * Run: node src/seed.js
 * Run fresh: node src/seed.js --fresh   (wipes everything first)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Profile = require("./models/Profile");
const Place = require("./models/Place");
const Review = require("./models/Review");
const HomepageSection = require("./models/HomepageSection");
const CrewMember = require("./models/CrewMember");

const isFresh = process.argv.includes("--fresh");

// ─── Users & Profiles ────────────────────────────────────────────────────────
const usersData = [
  {
    email: "admin@agraloctour.com",
    password: "Admin@1234",
    role: "admin",
    display_name: "Admin",
    bio: "Platform administrator & Lead Curator at Agra LocTour.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  },
  {
    email: "kamal@agraloctour.com",
    password: "Kamal@1234",
    role: "moderator",
    display_name: "Kamal",
    bio: "Explorer of ancient temples, heritage corridors, and forgotten trails.",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
  },
  {
    email: "divyansh@agraloctour.com",
    password: "Divyansh@1234",
    role: "user",
    display_name: "Divyansh",
    bio: "Coffee shop hunter, street food enthusiast, and heritage workshop explorer.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  {
    email: "suhas@agraloctour.com",
    password: "Suhas@1234",
    role: "user",
    display_name: "Suhas",
    bio: "Nature lover, weekend trekker, and outdoor sports enthusiast.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  },
  {
    email: "bindu@agraloctour.com",
    password: "Bindu@1234",
    role: "user",
    display_name: "Bindu",
    bio: "Mystery spots, whispering crypts, and forgotten history are my thing.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  },
];

// ─── Homepage Sections ────────────────────────────────────────────────────────
const sectionsData = [
  { section_type: "hero",           title: "Discover Hidden Gems",        subtitle: "Explore places off the beaten path in Agra & beyond", sort_order: 1, is_visible: true },
  { section_type: "categories",     title: "Browse by Category",          subtitle: "Find your kind of adventure",                         sort_order: 2, is_visible: true },
  { section_type: "trending",       title: "Trending Right Now",          subtitle: "Most talked-about spots this week",                   sort_order: 3, is_visible: true },
  { section_type: "top_rated",      title: "Top Rated Places",            subtitle: "Highest rated by our community",                      sort_order: 4, is_visible: true },
  { section_type: "recently_added", title: "Recently Added",              subtitle: "Fresh discoveries from our community",                sort_order: 5, is_visible: true },
  { section_type: "crew",           title: "Meet the DaGama Crew",        subtitle: "Local experts and explorers guiding your journey",    sort_order: 6, is_visible: true },
  { section_type: "cta",            title: "Know a Hidden Gem?",          subtitle: "Share it with the world — submit a place today",      sort_order: 7, is_visible: true },
];

// ─── Places (submitted_by will be set dynamically) ───────────────────────────
const placesData = [
  // ── Agra Gems (Agra LocTour Featured) ──
  {
    title: "Chini Ka Rauza Secret Gardens",
    description: "An intricately glazed Persian funerary monument set alongside peaceful, untouristed riverside gardens facing the Yamuna.",
    history: "Built in 1635 for Afzal Khan Shirazi, prime minister of Shah Jahan. The glazed tilework (chini) was brought from Kashan, Iran.",
    category: "temples",
    city: "Agra",
    country: "India",
    address: "Katara Wazir Khan, Near Rambagh, Agra, Uttar Pradesh 282006",
    latitude: 27.2023,
    longitude: 78.0381,
    best_time_to_visit: "Early morning, 6–9 AM, November to February",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", is_primary: true, status: "active" },
      { image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", is_primary: false, status: "active" },
    ],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Parking", status: "limited" },
      { name: "Drinking Water", status: "unavailable" },
    ],
    mentions: [
      { type: "Book", title: "Agra Historical Monuments", link: "" },
      { type: "Social", title: "@hiddenagra", link: "https://instagram.com" },
    ],
    submittedBy: "kamal",
  },
  {
    title: "Sheroes Hangout Café",
    description: "A heartwarming, inspirational café run entirely by acid attack survivors, serving delicious snacks, coffee, books, and soulful conversations.",
    history: "Established in 2014 by Chhanv Foundation to rehabilitate survivors and challenge societal stigmas.",
    category: "cafes",
    city: "Agra",
    country: "India",
    address: "Opposite Taj View Hotel, Fatehabad Road, Tajganj, Agra, Uttar Pradesh 282001",
    latitude: 27.1593,
    longitude: 78.0469,
    best_time_to_visit: "Afternoon & evening, 12:00 PM – 9:00 PM",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", is_primary: true, status: "active" },
      { image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", is_primary: false, status: "active" },
    ],
    amenities: [
      { name: "Network", status: "available" },
      { name: "Washroom", status: "available" },
      { name: "Parking", status: "limited" },
      { name: "Drinking Water", status: "available" },
    ],
    mentions: [
      { type: "Movie", title: "Chhapaak Inspiration", link: "" },
      { type: "Social", title: "@sheroeshangout", link: "https://instagram.com" },
    ],
    submittedBy: "bindu",
  },
  {
    title: "Yamuna Riverfront Kayaking & Rowing",
    description: "Paddle through calm morning waters with breathtaking offbeat views of historical Agra riverbank monuments away from tourist crowds.",
    history: "Started by local river conservationists and water sports enthusiasts in 2021 to revitalize the Yamuna heritage corridor.",
    category: "sports",
    city: "Agra",
    country: "India",
    address: "Kailash Ghat Boat Point, Sikandra Bypass, Agra, Uttar Pradesh 282007",
    latitude: 27.2289,
    longitude: 77.9344,
    best_time_to_visit: "Sunrise sessions, 6:00 AM – 8:30 AM",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", is_primary: true, status: "active" },
    ],
    amenities: [
      { name: "Safety Equipment", status: "available" },
      { name: "Parking", status: "available" },
      { name: "Washroom", status: "unavailable" },
    ],
    mentions: [
      { type: "Social", title: "@agrawatersports", link: "https://instagram.com" },
    ],
    submittedBy: "suhas",
  },
  {
    title: "Mughal Inlay Marble Craft Workshop",
    description: "Hands-on masterclass where 5th-generation master artisans teach the ancient Pietra Dura marble inlay art practiced during Taj construction.",
    history: "Founded by descendants of royal lapidaries commissioned during the reign of Emperor Shah Jahan.",
    category: "fun-activity",
    city: "Agra",
    country: "India",
    address: "Fatehabad Road, Near Shilpgram Crafts Village, Agra, Uttar Pradesh 282001",
    latitude: 27.1611,
    longitude: 78.0528,
    best_time_to_visit: "Daily 11:00 AM – 4:00 PM",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800", is_primary: true, status: "active" },
    ],
    amenities: [
      { name: "Drinking Water", status: "available" },
      { name: "Washroom", status: "available" },
      { name: "Parking", status: "available" },
    ],
    mentions: [
      { type: "Book", title: "Artisans of the Mughal Court", link: "" },
    ],
    submittedBy: "divyansh",
  },
  {
    title: "Seth Gali Bedai & Jalebi Corner",
    description: "Narrow heritage street famous for piping hot crisp bedai puris stuffed with spiced urad dal, served with tangy potato curry and syrupy jalebis.",
    history: "Halwais have operated wood-fire iron kadhais here since the 1920s in the heart of the ancient market.",
    category: "food",
    city: "Agra",
    country: "India",
    address: "Seth Gali, Kinari Bazaar, Rawatpara, Agra, Uttar Pradesh 282003",
    latitude: 27.1842,
    longitude: 78.0163,
    best_time_to_visit: "Morning breakfast, 7:00 AM – 11:00 AM",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", is_primary: true, status: "active" },
    ],
    amenities: [
      { name: "Food Nearby", status: "available" },
      { name: "Drinking Water", status: "available" },
      { name: "Parking", status: "unavailable" },
    ],
    mentions: [
      { type: "Social", title: "@agrafoodwalks", link: "https://instagram.com" },
    ],
    submittedBy: "divyansh",
  },
  {
    title: "The Whispering Crypts of Sikandra",
    description: "Unmarked subterranean chambers and echo acoustics hidden beneath the outer pavilions of Akbar's tomb compound.",
    history: "Acoustic chambers used by royal sentries to detect footsteps in the late 16th century.",
    category: "mystery",
    city: "Agra",
    country: "India",
    address: "Tomb of Akbar the Great Complex, Mathura Road, Sikandra, Agra, Uttar Pradesh 282007",
    latitude: 27.2206,
    longitude: 77.9505,
    best_time_to_visit: "Late afternoon, 3:30 PM – 5:30 PM",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", is_primary: true, status: "active" },
    ],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Parking", status: "available" },
      { name: "Safety", status: "limited" },
    ],
    mentions: [
      { type: "Book", title: "Legends of the Mughal Empire", link: "" },
    ],
    submittedBy: "bindu",
  },
  {
    title: "Sur Sarovar Bird Sanctuary Lake Trail",
    description: "A tranquil nature trail circling Keetham lake, home to over 100 species of migratory birds, rare wetland flora, and a peaceful forest canopy.",
    history: "Declared a bird sanctuary in 1991 and designated a Ramsar wetland site in 2020.",
    category: "nature",
    city: "Agra",
    country: "India",
    address: "Sur Sarovar Bird Sanctuary, NH-2 Delhi-Agra Highway, Keetham, Agra, Uttar Pradesh 282007",
    latitude: 27.2514,
    longitude: 77.8488,
    best_time_to_visit: "Sunrise to mid-morning, November to March",
    status: "approved",
    place_images: [
      { image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800", is_primary: true, status: "active" },
    ],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Benches", status: "available" },
      { name: "Drinking Water", status: "limited" },
      { name: "Parking", status: "available" },
    ],
    mentions: [
      { type: "Social", title: "@indiatravelbirds", link: "https://instagram.com" },
    ],
    submittedBy: "suhas",
  },

  // ── Regional Gems ──
  {
    title: "The Forgotten Alley Café",
    description: "A tiny café tucked inside a 200-year-old alley, serving hand-brewed coffee and homemade pastries. Locals keep it a secret.",
    history: "Originally a spice merchant's storage room in the 1800s, converted to a café in 1987 by a retired professor.",
    category: "cafes",
    city: "Pune",
    country: "India",
    address: "Lane 4, Koregaon Park, near Old Banyan Tree, Pune, Maharashtra 411001",
    latitude: 18.5362,
    longitude: 73.8940,
    best_time_to_visit: "Early morning, 7–10 AM",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Parking", status: "limited" },
      { name: "Drinking Water", status: "available" },
      { name: "Washroom", status: "available" },
    ],
    mentions: [{ type: "Book", title: "Pune Diaries", link: "" }],
    submittedBy: "divyansh",
  },
  {
    title: "Shiva's Lost Temple",
    description: "A 12th-century Shiva temple hidden deep in the forest, rarely visited by tourists. The carvings are breathtaking.",
    history: "Built during the Yadava dynasty, the temple was abandoned after a flood in 1450 and rediscovered by a local farmer in 1923.",
    category: "temples",
    city: "Nashik",
    country: "India",
    address: "Anjaneri Hills Road, Trimbakeshwar Range, Nashik, Maharashtra 422213",
    latitude: 19.9238,
    longitude: 73.5312,
    best_time_to_visit: "October to February, sunrise",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Drinking Water", status: "limited" },
      { name: "Benches", status: "available" },
    ],
    mentions: [{ type: "Movie", title: "The Hidden Shrine", link: "" }],
    submittedBy: "kamal",
  },
  {
    title: "Misty Waterfall Trail",
    description: "A 3 km trail through dense forest leading to a stunning 40-foot waterfall. Almost no signage — you need a local guide.",
    history: "The trail was used by tribal communities for centuries as a water source. Opened to trekkers in 2005.",
    category: "nature",
    city: "Lonavala",
    country: "India",
    address: "Khandala Valley Entry Point, Off Old Mumbai-Pune Highway, Lonavala, Maharashtra 410401",
    latitude: 18.7557,
    longitude: 73.4091,
    best_time_to_visit: "Post-monsoon, September–November",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Food Nearby", status: "limited" },
      { name: "Safety", status: "limited" },
    ],
    mentions: [{ type: "Social", title: "@trekkersindia", link: "https://instagram.com" }],
    submittedBy: "suhas",
  },
  {
    title: "Grandma's Secret Kitchen",
    description: "A home-style restaurant run by a 70-year-old woman serving authentic Maharashtrian thali. No menu, no signboard.",
    history: "Started in 1995 when the owner began feeding construction workers. Word spread and it became a beloved local institution.",
    category: "food",
    city: "Kolhapur",
    country: "India",
    address: "Bhavani Mandap Chowk, Old Town, Kolhapur, Maharashtra 416012",
    latitude: 16.6946,
    longitude: 74.2238,
    best_time_to_visit: "Lunch only, 12–3 PM",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Washroom", status: "available" },
      { name: "Drinking Water", status: "available" },
      { name: "Parking", status: "available" },
    ],
    mentions: [{ type: "Book", title: "Flavours of Maharashtra", link: "" }],
    submittedBy: "bindu",
  },
  {
    title: "The Haunted Stepwell",
    description: "A 500-year-old stepwell locals believe is haunted. Eerie carvings, underground chambers, and an unsettling silence.",
    history: "Built in the 15th century as a community water source. Abandoned after a mysterious plague in 1720. Locals avoid it after dark.",
    category: "mystery",
    city: "Aurangabad",
    country: "India",
    address: "Daulatabad Fort Foothills, Khuldabad Road, Aurangabad, Maharashtra 431002",
    latitude: 19.9431,
    longitude: 75.2132,
    best_time_to_visit: "Daytime only, October–March",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Parking", status: "available" },
      { name: "Safety", status: "limited" },
    ],
    mentions: [
      { type: "Movie", title: "Raaz 4", link: "" },
      { type: "Social", title: "@mysteryhuntersindia", link: "" },
    ],
    submittedBy: "kamal",
  },
  {
    title: "Rooftop Chai Corner",
    description: "A rooftop café with panoramic city views, serving 12 varieties of chai and local snacks. No elevator — 4 floors of stairs.",
    history: "Opened in 2018 by two college friends who wanted to create a chill spot above the city chaos.",
    category: "cafes",
    city: "Mumbai",
    country: "India",
    address: "4th Floor Terrace, Fort Heritage Building, Kala Ghoda, Mumbai, Maharashtra 400001",
    latitude: 18.9298,
    longitude: 72.8331,
    best_time_to_visit: "Evening, 5–8 PM for sunset views",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Network", status: "available" },
      { name: "Benches", status: "available" },
      { name: "Food Nearby", status: "available" },
    ],
    mentions: [{ type: "Social", title: "@mumbaihiddengems", link: "" }],
    submittedBy: "divyansh",
  },
  {
    title: "Bamboo Forest Path",
    description: "A serene 1 km path through a dense bamboo grove. The sound of wind through bamboo is meditative.",
    history: "Planted by a local NGO in 1998 to prevent soil erosion. Accidentally became a tourist attraction.",
    category: "nature",
    city: "Mahabaleshwar",
    country: "India",
    address: "Tapola Road, 6 km from Main Market, Mahabaleshwar, Maharashtra 412806",
    latitude: 17.9237,
    longitude: 73.6586,
    best_time_to_visit: "Early morning or late afternoon",
    status: "approved",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Shade", status: "available" },
      { name: "Benches", status: "available" },
      { name: "Drinking Water", status: "limited" },
    ],
    mentions: [],
    submittedBy: "suhas",
  },
  {
    title: "The Underground Spice Market",
    description: "A basement market selling 200+ varieties of spices, herbs, and rare ingredients. The aroma hits you before you enter.",
    history: "Operating since 1940, originally a black market during WWII rationing. Now fully legal and beloved by chefs.",
    category: "food",
    city: "Hyderabad",
    country: "India",
    address: "Basement Level 2, Mir Alam Mandi, Old City, Hyderabad, Telangana 500002",
    latitude: 17.3616,
    longitude: 78.4747,
    best_time_to_visit: "Weekday mornings, 9 AM–12 PM",
    status: "pending",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Parking", status: "available" },
      { name: "Food Nearby", status: "available" },
    ],
    mentions: [{ type: "Book", title: "Spice Routes of India", link: "" }],
    submittedBy: "bindu",
  },
  {
    title: "Abandoned Chemical Godown",
    description: "An unsafe dilapidated warehouse submitted by an anonymous user, deemed unsuitable for visitors.",
    history: "Constructed in 1980, shut down in 1995 after chemical safety non-compliance.",
    category: "mystery",
    city: "Agra",
    country: "India",
    address: "Foundry Nagar Industrial Area, Agra, Uttar Pradesh 282006",
    latitude: 27.2155,
    longitude: 78.0580,
    best_time_to_visit: "Not recommended",
    status: "rejected",
    place_images: [{ image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800", is_primary: true, status: "active" }],
    amenities: [
      { name: "Safety", status: "unavailable" },
      { name: "Drinking Water", status: "unavailable" },
    ],
    mentions: [],
    submittedBy: "divyansh",
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
const reviewsData = [
  // Existing places reviews
  { placeTitle: "The Forgotten Alley Café", reviewerName: "kamal", rating: 5, comment: "Best coffee I've had in years. The ambience is magical.", is_verified: true },
  { placeTitle: "The Forgotten Alley Café", reviewerName: "suhas", rating: 4, comment: "Cozy and quiet. Perfect for a slow morning.", is_verified: true },
  { placeTitle: "Shiva's Lost Temple", reviewerName: "divyansh", rating: 5, comment: "Absolutely stunning carvings. Worth the trek!", is_verified: true },
  { placeTitle: "Shiva's Lost Temple", reviewerName: "bindu", rating: 5, comment: "Felt like stepping back in time. Goosebumps.", is_verified: true },
  { placeTitle: "Misty Waterfall Trail", reviewerName: "kamal", rating: 4, comment: "Beautiful trail but carry water. Gets steep near the end.", is_verified: true },
  { placeTitle: "Misty Waterfall Trail", reviewerName: "divyansh", rating: 5, comment: "One of the best treks near Pune. Go after monsoon!", is_verified: true },
  { placeTitle: "Grandma's Secret Kitchen", reviewerName: "suhas", rating: 5, comment: "The best thali I've ever eaten. No exaggeration.", is_verified: true },
  { placeTitle: "Grandma's Secret Kitchen", reviewerName: "kamal", rating: 4, comment: "Authentic flavours. Go hungry!", is_verified: true },
  { placeTitle: "The Haunted Stepwell", reviewerName: "divyansh", rating: 4, comment: "Creepy but fascinating. The carvings are incredible.", is_verified: true },
  { placeTitle: "The Haunted Stepwell", reviewerName: "bindu", rating: 5, comment: "My favourite mystery spot. Don't go alone at dusk!", is_verified: true },
  { placeTitle: "Rooftop Chai Corner", reviewerName: "suhas", rating: 5, comment: "The masala chai with sunset view is unbeatable.", is_verified: true },
  { placeTitle: "Rooftop Chai Corner", reviewerName: "bindu", rating: 4, comment: "Great vibe. Stairs are a workout though!", is_verified: true },
  { placeTitle: "Bamboo Forest Path", reviewerName: "kamal", rating: 5, comment: "So peaceful. I went twice in the same day.", is_verified: true },
  { placeTitle: "Bamboo Forest Path", reviewerName: "divyansh", rating: 4, comment: "Underrated gem. Perfect for a quiet walk.", is_verified: true },

  // Agra and new category places reviews
  { placeTitle: "Chini Ka Rauza Secret Gardens", reviewerName: "bindu", rating: 5, comment: "The turquoise tile remnants and view over the Yamuna are pure poetry.", is_verified: true },
  { placeTitle: "Chini Ka Rauza Secret Gardens", reviewerName: "suhas", rating: 4, comment: "Quiet, peaceful, hardly any tourists. A hidden masterpiece in Agra.", is_verified: true },
  { placeTitle: "Sheroes Hangout Café", reviewerName: "kamal", rating: 5, comment: "Inspirational staff, warm hospitality, and the cold coffee is fantastic.", is_verified: true },
  { placeTitle: "Sheroes Hangout Café", reviewerName: "divyansh", rating: 5, comment: "A must-visit spot in Agra. Beautiful souls and vibrant artwork.", is_verified: true },
  { placeTitle: "Yamuna Riverfront Kayaking & Rowing", reviewerName: "bindu", rating: 5, comment: "Seeing the riverbank temples at 6 AM from the kayak was unreal.", is_verified: true },
  { placeTitle: "Mughal Inlay Marble Craft Workshop", reviewerName: "suhas", rating: 5, comment: "Incredible craftsmanship. Tried my hand at placing lapis lazuli in marble.", is_verified: true },
  { placeTitle: "Seth Gali Bedai & Jalebi Corner", reviewerName: "kamal", rating: 5, comment: "Crispy bedai puris and steaming jalebis. The authentic Agra breakfast!", is_verified: true },
  { placeTitle: "The Whispering Crypts of Sikandra", reviewerName: "divyansh", rating: 4, comment: "The acoustic echoes in the lower chambers are mind-blowing.", is_verified: true },
  { placeTitle: "Sur Sarovar Bird Sanctuary Lake Trail", reviewerName: "kamal", rating: 4, comment: "Spotted migratory birds and had a peaceful walk. Carry binoculars!", is_verified: false },
  { placeTitle: "Abandoned Chemical Godown", reviewerName: "suhas", rating: 1, comment: "Unsafe structure, completely boarded up with hazardous warning signs.", is_verified: false },
];

// ─── Crew Members ─────────────────────────────────────────────────────────────
const crewData = [
  {
    name: "Kamal",
    title: "Temple Hunter",
    bio: "Seeker of ancient temples, hidden trails, and heritage architecture across India.",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    social_links: {
      instagram: "https://instagram.com/kamal_explorer",
      twitter: "https://twitter.com/kamal_explores",
      website: "https://agraloctour.com/crew/kamal",
    },
    is_featured: true,
    sort: 1,
  },
  {
    name: "Divyansh",
    title: "Café Connoisseur",
    bio: "Coffee shop hunter, street food enthusiast, and heritage workshop explorer.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    social_links: {
      instagram: "https://instagram.com/divyansh_foodie",
      twitter: "https://twitter.com/divyansh_eats",
      website: "https://agraloctour.com/crew/divyansh",
    },
    is_featured: true,
    sort: 2,
  },
  {
    name: "Suhas",
    title: "Trail Blazer",
    bio: "Nature lover, weekend trekker, waterfall chaser, and outdoor sports enthusiast.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    social_links: {
      instagram: "https://instagram.com/suhas_trails",
      twitter: "https://twitter.com/suhas_adventures",
      website: "https://agraloctour.com/crew/suhas",
    },
    is_featured: true,
    sort: 3,
  },
  {
    name: "Bindu",
    title: "Mystery Seeker",
    bio: "Haunted stepwells, whispering crypts, and forgotten history — that's my thing.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    social_links: {
      instagram: "https://instagram.com/bindu_mysteries",
      twitter: "https://twitter.com/bindu_tales",
      website: "https://agraloctour.com/crew/bindu",
    },
    is_featured: true,
    sort: 4,
  },
];

// ─── Main Seeder ──────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  if (isFresh) {
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Place.deleteMany({}),
      Review.deleteMany({}),
      HomepageSection.deleteMany({}),
      CrewMember.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections\n");
  }

  // ── 1. Users & Profiles ──
  console.log("👤 Seeding users & profiles...");
  const userMap = {}; // display_name → user doc

  for (const u of usersData) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        email: u.email,
        password: u.password,
        role: u.role,
        display_name: u.display_name,
      });
      await Profile.create({
        user_id: user._id,
        display_name: u.display_name,
        bio: u.bio,
        avatar_url: u.avatar_url,
      });
      console.log(`   ✔ Created ${u.role}: ${u.display_name} (${u.email}) / ${u.password}`);
    } else {
      user.role = u.role;
      user.display_name = u.display_name;
      await user.save();

      await Profile.findOneAndUpdate(
        { user_id: user._id },
        { display_name: u.display_name, bio: u.bio, avatar_url: u.avatar_url },
        { upsert: true, new: true }
      );
      console.log(`   ⏭  Updated User & Profile: ${u.display_name}`);
    }
    userMap[u.display_name.toLowerCase()] = user;
  }

  // ── 2. Homepage Sections ──
  console.log("\n🏠 Seeding homepage sections...");
  await HomepageSection.deleteMany({});
  await HomepageSection.insertMany(sectionsData);
  console.log(`   ✔ ${sectionsData.length} sections seeded`);

  // ── 3. Places ──
  console.log("\n📍 Seeding places...");
  const placeMap = {}; // title → place doc

  for (const p of placesData) {
    const submitter = userMap[p.submittedBy];
    if (!submitter) {
      console.warn(`   ⚠ Unknown submitter: ${p.submittedBy}`);
      continue;
    }

    const placePayload = {
      title: p.title,
      description: p.description,
      history: p.history,
      category: p.category,
      city: p.city,
      country: p.country,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      best_time_to_visit: p.best_time_to_visit,
      status: p.status,
      submitted_by: submitter._id,
      place_images: p.place_images.map((img) => ({ ...img, uploaded_by: submitter._id })),
      amenities: p.amenities,
      mentions: p.mentions,
    };

    let place = await Place.findOne({ title: p.title });
    if (!place) {
      place = await Place.create(placePayload);
      console.log(`   ✔ [${p.status.toUpperCase()}] "${p.title}" (${p.category}) in ${p.city} by ${p.submittedBy}`);
    } else {
      Object.assign(place, placePayload);
      await place.save();
      console.log(`   ⏭  Updated Place: "${p.title}"`);
    }
    placeMap[p.title] = place;
  }

  // ── 4. Reviews ──
  console.log("\n⭐ Seeding reviews...");
  for (const r of reviewsData) {
    const place = placeMap[r.placeTitle];
    const reviewer = userMap[r.reviewerName];
    if (!place || !reviewer) {
      console.warn(`   ⚠ Skipping review — missing place or user ("${r.placeTitle}", "${r.reviewerName}")`);
      continue;
    }

    const exists = await Review.findOne({ place_id: place._id, user_id: reviewer._id });
    if (!exists) {
      await Review.create({
        place_id: place._id,
        user_id: reviewer._id,
        rating: r.rating,
        comment: r.comment,
        is_verified: r.is_verified ?? true,
      });
      console.log(`   ✔ ${reviewer.display_name} → "${r.placeTitle}" (${r.rating}★, verified: ${r.is_verified ?? true})`);
    } else {
      exists.rating = r.rating;
      exists.comment = r.comment;
      exists.is_verified = r.is_verified ?? true;
      await exists.save();
      console.log(`   ⏭  Updated Review: ${reviewer.display_name} → "${r.placeTitle}"`);
    }
  }

  // ── 5. Crew Members ──
  console.log("\n🧭 Seeding DaGama Crew...");
  for (const c of crewData) {
    const u = userMap[c.name.toLowerCase()];
    const crewPayload = {
      user_id: u?._id,
      display_name: c.name,
      role_title: c.title,
      bio: c.bio,
      avatar_url: c.avatar_url,
      social_links: c.social_links,
      is_featured: c.is_featured ?? true,
      sort_order: c.sort,
    };

    let member = await CrewMember.findOne({ display_name: c.name });
    if (!member) {
      member = await CrewMember.create(crewPayload);
      console.log(`   ✔ ${c.name} — ${c.title}`);
    } else {
      Object.assign(member, crewPayload);
      await member.save();
      console.log(`   ⏭  Updated Crew: ${c.name}`);
    }
  }

  // ── Summary ──
  console.log("\n─────────────────────────────────────────");
  console.log("🎉 Seed complete across all schemas!");
  console.log("─────────────────────────────────────────");
  console.log("📋 Login credentials:");
  for (const u of usersData) {
    console.log(`   ${u.role.padEnd(10)} ${u.display_name.padEnd(12)} ${u.email}  /  ${u.password}`);
  }
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
