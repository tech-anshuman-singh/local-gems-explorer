# Agra LocTour — Local Gems Explorer (Backend API)

> A modern MERN-stack RESTful API power-driving **Agra LocTour** (Local Gems Explorer) — discovering, sharing, and curating off-the-beaten-path destinations, heritage spots, secret cafés, and local experiences in Agra and beyond.

---

## 📸 Application Preview

<details open>
<summary><b>Click to expand / collapse screenshots</b></summary>

### 🏠 Home Page
<img width="2560" height="6852" alt="Home Page" src="https://github.com/user-attachments/assets/4cc2bf36-6361-42cf-8b93-9833d37489fa" />

### 🧭 Explore Hidden Gems
<img width="2560" height="5420" alt="Explore Gems" src="https://github.com/user-attachments/assets/f42671a8-70e7-41b2-83b2-dd1e4158f199" />

### 📍 Place Detail & Reviews
<img width="2560" height="3928" alt="Place Details" src="https://github.com/user-attachments/assets/6096c1fc-d50b-4b82-81bb-f852f178180e" />

### 👥 DaGama Crew
<img width="2560" height="3158" alt="DaGama Crew" src="https://github.com/user-attachments/assets/424607d8-195a-4069-a92d-c333ba1d66b7" />

</details>

---

## ✨ Key Features & Capabilities

> 📖 **Looking for in-depth technical documentation?** Read our complete [Project Documentation & Architecture Guide](./PROJECT_DOCUMENTATION.md).

- **📍 Place Discovery & Community Submissions**:
  - **7 Curated Categories**: `cafes`, `temples`, `nature`, `food`, `mystery`, `sports`, `fun-activity`.
  - **Comprehensive Metadata**: Title, historical background, detailed narrative, and optimal visiting hours.
  - **Geolocation & Mapping**: Full street address and high-precision GPS coordinates (`latitude`, `longitude`) ready for map rendering and navigation.
  - **Multi-Status Amenities**: Granular status indicators (`available`, `limited`, `unavailable`) for essentials including Parking, Drinking Water, Washrooms, Shade, Safety, and Network connectivity.
  - **Cultural & Media Mentions**: Pop-culture references, books, films, and social media tags (`Movie`, `Book`, `Social`) with direct links.
  - **Cloud Media Pipeline**: Multi-image uploads handled with Multer and hosted via Cloudinary CDN.
  - **Moderation Workflow**: Submissions enter a `pending` state until reviewed and marked as `approved` or `rejected` by moderators.

- **🧭 DaGama Crew (Curated Community Explorers)**:
  - Featured explorer profiles showcasing specialized roles (e.g., *Temple Hunter*, *Trail Blazer*, *Café Connoisseur*, *Mystery Seeker*).
  - Profile bios, avatar headshots, and external social media links (Instagram, Twitter, personal sites).
  - **Live Contribution Engine**: Automatically aggregates and displays real-time counts of approved places submitted and reviews posted by each crew member.

- **🔐 Authentication & Role-Based Access Control (RBAC)**:
  - Salted and hashed passwords with `bcryptjs` (10 salt rounds).
  - Stateless JSON Web Token (`jsonwebtoken`) authentication with configurable expiration.
  - Multi-tier permissions: `admin` (system & layout control), `moderator` (review verification & submission management), and `user` (community explorer).
  - Pre-save Mongoose hooks ensuring automatic password encryption and sanitized JSON serialization.

- **⭐ Community Reviews & Quality Ratings**:
  - 1-to-5 star rating system with detailed commentary.
  - **Verified Visit Badging**: Moderators can flag authentic on-the-ground visitor reviews with `is_verified: true`.
  - **Dynamic Sorting & Filtering**: Sort places by highest rating, review counts, or recency.

- **🏠 Dynamic Homepage Management**:
  - Fully configurable sections (`hero`, `categories`, `trending`, `top_rated`, `recently_added`, `crew`, `cta`).
  - Admins can reorder sections (`sort_order`), customize marketing headlines and subtitles, or toggle visibility (`is_visible`) on the fly without frontend redeployment.

- **🛡️ Real-Time Admin Intelligence & Moderation Suite**:
  - Centralized dashboard analytics: Live counts of total users, approved places, pending submissions, rejected places, and total reviews.
  - Real-time audit activity feed capturing place submissions and review postings chronologically.
  - Dedicated moderation queues for place approval, amenity status toggling, mention verification, and image management.

- **🌱 Robust Database Seeding (`src/seed.js`)**:
  - Full seed data across all 6 collections: 5 test user accounts, 7 homepage sections, 16 comprehensive places (including authentic Agra locations), 24 reviews, and 4 DaGama Crew profiles.
  - Supports incremental, non-destructive upserts (`npm run seed`) and complete collection wipes (`npm run seed:fresh`).

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/)
- **Development**: [Nodemon](https://nodemon.io/)

---

## 📁 Project Structure

```text
backend-local/
├── src/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary SDK setup
│   │   └── db.js               # MongoDB connection logic
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & role authorization
│   │   └── upload.js           # Multer storage configuration
│   ├── models/
│   │   ├── CrewMember.js       # DaGama Crew schema
│   │   ├── HomepageSection.js  # Dynamic homepage sections schema
│   │   ├── Place.js            # Places, amenities & mentions schema
│   │   ├── Profile.js          # User profile schema
│   │   ├── Review.js           # Place reviews schema
│   │   └── User.js             # User accounts & auth schema
│   ├── routes/
│   │   ├── admin/              # Protected admin/moderator endpoints
│   │   │   ├── amenities.js
│   │   │   ├── images.js
│   │   │   ├── mentions.js
│   │   │   ├── places.js
│   │   │   ├── reviews.js
│   │   │   ├── stats.js
│   │   │   └── users.js
│   │   └── public/             # Public & authenticated client endpoints
│   │       ├── auth.js
│   │       ├── crew.js
│   │       ├── homepage.js
│   │       ├── places.js
│   │       ├── profiles.js
│   │       ├── reviews.js
│   │       └── upload.js
│   ├── index.js                # Express app entrypoint & middleware
│   └── seed.js                 # Complete database seeder
├── API.md                      # Detailed curl requests & API documentation
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **MongoDB** instance (local MongoDB URI or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- *(Optional)* **Cloudinary Account** for cloud image storage

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/local-gems-explorer.git
cd local-gems-explorer/backend-local
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agra-loctour
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Configuration (if using cloud image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Database Seeding

Populate the database with ready-to-use users, places, reviews, sections, and crew members:

```bash
# Seed or update existing records with newly added fields
npm run seed

# Or wipe collections and perform a clean re-seed
npm run seed:fresh
```

#### Pre-configured Test Accounts:
| Role | Display Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin | `admin@agraloctour.com` | `Admin@1234` |
| **Moderator** | Kamal | `kamal@agraloctour.com` | `Kamal@1234` |
| **User** | Divyansh | `divyansh@agraloctour.com` | `Divyansh@1234` |
| **User** | Suhas | `suhas@agraloctour.com` | `Suhas@1234` |
| **User** | Bindu | `bindu@agraloctour.com` | `Bindu@1234` |

### 5. Running the Application

```bash
# Start in development mode (with hot reloading via nodemon)
npm run dev

# Start in production mode
npm start
```

The API server will listen on `http://localhost:5000` (or your configured `PORT`).

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/signup` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user details | Authenticated |
| **Places** | | | |
| `GET` | `/api/places` | List approved places (filter/sort/search) | Public |
| `GET` | `/api/places/:id` | Get place details, images, amenities, mentions | Public |
| `POST` | `/api/places` | Submit a new place (with image uploads) | Authenticated |
| `PUT` | `/api/places/:id` | Update a submitted place | Owner / Admin |
| **Reviews** | | | |
| `GET` | `/api/reviews` | List reviews (by `place_id` or `user_id`) | Public |
| `POST` | `/api/reviews` | Submit a rating and review | Authenticated |
| `PATCH` | `/api/reviews/:id/verify` | Verify review authenticity | Admin / Mod |
| **DaGama Crew** | | | |
| `GET` | `/api/crew` | List featured crew members with live stats | Public |
| `GET` | `/api/crew/all` | List all crew members (including hidden) | Admin |
| `POST` | `/api/crew` | Add a new crew member | Admin |
| **Homepage** | | | |
| `GET` | `/api/homepage/sections` | List visible sections in sorted order | Public |
| `PUT` | `/api/homepage/sections/:id` | Update section title, subtitle, sort order | Admin |
| **Admin Dashboard** | | | |
| `GET` | `/api/admin/stats` | System metrics, counts, and recent activity | Admin / Mod |
| `PATCH`| `/api/admin/places/:id/status`| Approve, reject, or set place status to pending | Admin / Mod |
| `GET` | `/api/admin/amenities` | Moderation overview for all place amenities | Admin / Mod |
| `GET` | `/api/admin/images` | Moderation overview for all uploaded images | Admin / Mod |

> 📖 For full curl commands and request/response payloads, check out [API.md](./API.md).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
