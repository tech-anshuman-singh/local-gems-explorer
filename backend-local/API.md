# Agra LocTour — API Reference

Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

---

## AUTH

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Jane@1234",
    "display_name": "Jane Explorer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agraloctour.com",
    "password": "Admin@1234"
  }'
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## PLACES

### Get All Approved Places
```bash
curl http://localhost:5000/api/places
```

### Filter by Category
```bash
curl "http://localhost:5000/api/places?category=cafes"
```

### Sort by Rating / Reviews / Recent
```bash
curl "http://localhost:5000/api/places?sort=rating"
curl "http://localhost:5000/api/places?sort=reviews"
curl "http://localhost:5000/api/places?sort=recent"
```

### Limit Results
```bash
curl "http://localhost:5000/api/places?limit=4&sort=recent"
```

### Get Places by User
```bash
curl "http://localhost:5000/api/places?submitted_by=<userId>"
```

### Get Single Place (with reviews, amenities, mentions)
```bash
curl http://localhost:5000/api/places/<placeId>
```

### Submit a New Place (with images)
```bash
curl -X POST http://localhost:5000/api/places \
  -H "Authorization: Bearer <token>" \
  -F "title=The Rooftop Garden" \
  -F "category=nature" \
  -F "city=Mumbai" \
  -F "country=India" \
  -F "description=A hidden rooftop garden above an old building." \
  -F "history=Planted in 1990 by a local artist." \
  -F "best_time_to_visit=Evening, 5-7 PM" \
  -F 'amenities=[{"name":"Parking","status":"limited"},{"name":"Shade","status":"available"}]' \
  -F 'mentions=[{"type":"Movie","title":"Dil Chahta Hai","link":""}]' \
  -F "images=@/path/to/photo.jpg"
```

### Update Place Status (admin/moderator)
```bash
# Approve
curl -X PATCH http://localhost:5000/api/places/<placeId>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Reject
curl -X PATCH http://localhost:5000/api/places/<placeId>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected"}'
```

### Delete Place (admin)
```bash
curl -X DELETE http://localhost:5000/api/places/<placeId> \
  -H "Authorization: Bearer <token>"
```

---

## REVIEWS

### Get Reviews for a Place
```bash
curl "http://localhost:5000/api/reviews?place_id=<placeId>"
```

### Get Reviews by a User
```bash
curl "http://localhost:5000/api/reviews?user_id=<userId>"
```

### Submit a Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "<placeId>",
    "rating": 5,
    "comment": "Absolutely stunning place, highly recommend!"
  }'
```

### Verify a Review (admin/moderator)
```bash
curl -X PATCH http://localhost:5000/api/reviews/<reviewId>/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"is_verified": true}'
```

### Delete a Review (admin/moderator)
```bash
curl -X DELETE http://localhost:5000/api/reviews/<reviewId> \
  -H "Authorization: Bearer <token>"
```

---

## PROFILES

### Get My Profile
```bash
curl http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer <token>"
```

### Get Profile by User ID
```bash
curl http://localhost:5000/api/profiles/<userId>
```

### Update My Profile
```bash
curl -X PUT http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Jane Explorer",
    "bio": "Lover of hidden cafes and ancient temples.",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

### Get Badges for a User
```bash
curl http://localhost:5000/api/profiles/<userId>/badges
```
Response:
```json
{
  "badges": ["Explorer", "Contributor"],
  "placeCount": 2,
  "reviewCount": 5
}
```

---

## UPLOAD

### Upload a Single Image
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/photo.jpg"
```
Response:
```json
{ "url": "/uploads/1718000000000-123456789.jpg" }
```

---

## HOMEPAGE SECTIONS

### Get All Sections (public)
```bash
curl http://localhost:5000/api/homepage/sections
```

### Update a Section (admin)
```bash
curl -X PUT http://localhost:5000/api/homepage/sections/<sectionId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Discover Hidden Gems",
    "subtitle": "Explore places off the beaten path",
    "is_visible": true,
    "sort_order": 1
  }'
```

---

## ADMIN

> All admin routes require `Authorization: Bearer <token>` with admin or moderator role.

### Dashboard Stats
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <token>"
```
Response:
```json
{
  "totalUsers": 5,
  "totalPlaces": 7,
  "totalReviews": 14,
  "pending": 1,
  "rejected": 0,
  "activity": [...]
}
```

### Get All Users (admin only)
```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <token>"
```

### Change User Role (admin only)
```bash
curl -X PATCH http://localhost:5000/api/admin/users/<userId>/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "moderator"}'
```

### Delete User (admin only)
```bash
curl -X DELETE http://localhost:5000/api/admin/users/<userId> \
  -H "Authorization: Bearer <token>"
```

### Get All Places (all statuses)
```bash
curl http://localhost:5000/api/admin/places \
  -H "Authorization: Bearer <token>"

# Filter by status
curl "http://localhost:5000/api/admin/places?status=pending" \
  -H "Authorization: Bearer <token>"
```

### Approve / Reject Place
```bash
curl -X PATCH http://localhost:5000/api/admin/places/<placeId>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Delete Place (admin/moderator)
```bash
curl -X DELETE http://localhost:5000/api/admin/places/<placeId> \
  -H "Authorization: Bearer <token>"
```

### Get All Reviews
```bash
curl http://localhost:5000/api/admin/reviews \
  -H "Authorization: Bearer <token>"
```

### Verify / Unverify Review
```bash
curl -X PATCH http://localhost:5000/api/admin/reviews/<reviewId>/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"is_verified": true}'
```

### Delete Review
```bash
curl -X DELETE http://localhost:5000/api/admin/reviews/<reviewId> \
  -H "Authorization: Bearer <token>"
```

### Get All Amenities
```bash
curl http://localhost:5000/api/admin/amenities \
  -H "Authorization: Bearer <token>"
```

### Update Amenity Status
```bash
curl -X PATCH http://localhost:5000/api/admin/amenities/<placeId>/<amenityId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "limited"}'
```

### Get All Mentions
```bash
curl http://localhost:5000/api/admin/mentions \
  -H "Authorization: Bearer <token>"
```

### Update Mention Status
```bash
curl -X PATCH http://localhost:5000/api/admin/mentions/<placeId>/<mentionId>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

### Delete Mention
```bash
curl -X DELETE http://localhost:5000/api/admin/mentions/<placeId>/<mentionId> \
  -H "Authorization: Bearer <token>"
```

### Get All Images
```bash
curl http://localhost:5000/api/admin/images \
  -H "Authorization: Bearer <token>"
```

### Delete Image
```bash
curl -X DELETE http://localhost:5000/api/admin/images/<placeId>/<imageId> \
  -H "Authorization: Bearer <token>"
```

---

## QUICK START WORKFLOW

```bash
# 1. Login and grab token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agraloctour.com","password":"Admin@1234"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 2. Check stats
curl http://localhost:5000/api/admin/stats -H "Authorization: Bearer $TOKEN"

# 3. Approve a pending place
curl -X PATCH http://localhost:5000/api/admin/places/<placeId>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

---

## SEED CREDENTIALS

| Role      | Email                      | Password      |
|-----------|----------------------------|---------------|
| admin     | admin@agraloctour.com      | Admin@1234    |
| moderator | kamal@agraloctour.com      | Kamal@1234    |
| user      | divyansh@agraloctour.com   | Divyansh@1234 |
| user      | suhas@agraloctour.com      | Suhas@1234    |
| user      | bindu@agraloctour.com      | Bindu@1234    |
