# SIGAP - Complete API Documentation

## 📌 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication

Semua request (kecuali login/register) memerlukan JWT token di header:
```
Authorization: Bearer {token}
```

---

## 👤 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "nim": "F55123100",
  "email": "user@student.untad.ac.id",
  "name": "John Doe",
  "password": "password123",
  "phone": "081234567890",
  "prodi": "Teknik Informatika"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "nim": "F55123100",
    "email": "user@student.untad.ac.id",
    "name": "John Doe",
    "role": "mahasiswa"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "identifier": "F55123100",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "nim": "F55123100",
    "email": "user@student.untad.ac.id",
    "name": "John Doe",
    "role": "mahasiswa",
    "phone": "081234567890",
    "prodi": "Teknik Informatika"
  }
}
```

### Verify Token
**GET** `/auth/verify`

**Headers:** `Authorization: Bearer {token}`

**Success Response (200):**
```json
{
  "message": "Token valid",
  "user": {
    "id": "user-001",
    "nim": "F55123100",
    "email": "user@student.untad.ac.id",
    "name": "John Doe",
    "role": "mahasiswa"
  }
}
```

---

## 👥 User Endpoints

### Get My Profile
**GET** `/users/profile`

**Headers:** `Authorization: Bearer {token}`

**Success Response (200):**
```json
{
  "user": {
    "id": "user-001",
    "nim": "F55123100",
    "email": "user@student.untad.ac.id",
    "name": "John Doe",
    "role": "mahasiswa",
    "phone": "081234567890",
    "prodi": "Teknik Informatika",
    "address": "Jl. Raya No. 123",
    "avatar": "https://..."
  }
}
```

### Update Profile
**PUT** `/users/profile`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "phone": "081234567891",
  "address": "Jl. Baru No. 456",
  "prodi": "Teknik Informatika"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully"
}
```

### Get All Users (Admin Only)
**GET** `/users?role=mahasiswa`

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `role` (optional): Filter by role ('mahasiswa' or 'admin')

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "user-001",
      "nim": "F55123100",
      "email": "user@student.untad.ac.id",
      "name": "John Doe",
      "role": "mahasiswa",
      "phone": "081234567890",
      "prodi": "Teknik Informatika",
      "created_at": "2026-06-01T10:00:00Z"
    }
  ]
}
```

### Get User by ID (Admin Only)
**GET** `/users/{userId}`

**Headers:** `Authorization: Bearer {admin_token}`

**Success Response (200):**
```json
{
  "user": {
    "id": "user-001",
    "nim": "F55123100",
    "email": "user@student.untad.ac.id",
    "name": "John Doe",
    "role": "mahasiswa",
    "phone": "081234567890",
    "prodi": "Teknik Informatika"
  }
}
```

---

## 🏛️ Room Endpoints

### Get All Rooms
**GET** `/rooms?status=available&floor=1`

**Query Parameters:**
- `status` (optional): 'available', 'maintenance', 'unavailable'
- `floor` (optional): Floor number

**Success Response (200):**
```json
{
  "rooms": [
    {
      "id": "room-001",
      "name": "SG-01",
      "capacity": 40,
      "floor": 1,
      "location": "Gedung SG Lantai 1",
      "features": ["Proyektor", "AC", "Papan Tulis"],
      "status": "available",
      "currentBookings": [],
      "created_at": "2026-06-01T10:00:00Z"
    }
  ]
}
```

### Get Room Details
**GET** `/rooms/{roomId}`

**Success Response (200):**
```json
{
  "room": {
    "id": "room-001",
    "name": "SG-01",
    "capacity": 40,
    "floor": 1,
    "location": "Gedung SG Lantai 1",
    "features": ["Proyektor", "AC", "Papan Tulis"],
    "status": "available",
    "currentBookings": [
      {
        "id": "booking-001",
        "start_time": "08:00",
        "end_time": "10:00",
        "course_name": "Capstone Project",
        "lecturer": "Dr. Ahmad Fauzi"
      }
    ]
  }
}
```

### Check Room Availability
**POST** `/rooms/check-availability`

**Request Body:**
```json
{
  "roomId": "room-001",
  "date": "2026-06-10",
  "startTime": "08:00",
  "endTime": "10:00"
}
```

**Success Response (200) - Available:**
```json
{
  "available": true,
  "conflictingBookings": []
}
```

**Response - Not Available:**
```json
{
  "available": false,
  "conflictingBookings": [
    {
      "id": "booking-001",
      "course_name": "Capstone Project",
      "start_time": "08:00",
      "end_time": "10:00"
    }
  ]
}
```

### Create Room (Admin Only)
**POST** `/rooms`

**Request Body:**
```json
{
  "name": "SG-13",
  "capacity": 50,
  "floor": 3,
  "features": ["Proyektor", "AC", "Papan Tulis", "Lab Komputer"]
}
```

---

## 📅 Booking Endpoints

### Create Booking
**POST** `/bookings`

**Request Body:**
```json
{
  "roomId": "room-001",
  "bookingDate": "2026-06-10",
  "startTime": "08:00",
  "endTime": "10:00",
  "courseCode": "IF001",
  "courseName": "Capstone Project",
  "lecturer": "Dr. Ahmad Fauzi",
  "duration": 2
}
```

**Success Response (201):**
```json
{
  "message": "Booking created successfully",
  "bookingId": "booking-001"
}
```

**Error Response (409):**
```json
{
  "error": "Time slot already booked"
}
```

### Get My Bookings
**GET** `/bookings/my-bookings?status=pending`

**Query Parameters:**
- `status` (optional): 'pending', 'approved', 'rejected', 'cancelled'

**Success Response (200):**
```json
{
  "bookings": [
    {
      "id": "booking-001",
      "room_name": "SG-01",
      "capacity": 40,
      "booking_date": "2026-06-10",
      "start_time": "08:00",
      "end_time": "10:00",
      "course_name": "Capstone Project",
      "lecturer": "Dr. Ahmad Fauzi",
      "status": "pending",
      "created_at": "2026-06-04T10:00:00Z"
    }
  ]
}
```

### Get All Bookings (Admin Only)
**GET** `/bookings?status=pending&roomId=room-001&date=2026-06-10`

**Query Parameters:**
- `status` (optional): Filter by status
- `roomId` (optional): Filter by room
- `date` (optional): Filter by date

**Success Response (200):**
```json
{
  "bookings": [
    {
      "id": "booking-001",
      "user_name": "Syaif Ali M. Risal",
      "nim": "F55123064",
      "room_name": "SG-01",
      "booking_date": "2026-06-10",
      "start_time": "08:00",
      "end_time": "10:00",
      "status": "pending"
    }
  ]
}
```

### Get Booking Details
**GET** `/bookings/{bookingId}`

**Success Response (200):**
```json
{
  "booking": {
    "id": "booking-001",
    "user_name": "Syaif Ali M. Risal",
    "nim": "F55123064",
    "room_name": "SG-01",
    "room_floor": 1,
    "booking_date": "2026-06-10",
    "start_time": "08:00",
    "end_time": "10:00",
    "course_name": "Capstone Project",
    "status": "pending",
    "created_at": "2026-06-04T10:00:00Z"
  }
}
```

### Update Booking (Owner Only, Status Must be Pending)
**PUT** `/bookings/{bookingId}`

**Request Body:**
```json
{
  "startTime": "09:00",
  "endTime": "11:00"
}
```

### Approve Booking (Admin Only)
**POST** `/bookings/{bookingId}/approve`

**Request Body:**
```json
{
  "adminNotes": "Ruangan tersedia"
}
```

**Success Response (200):**
```json
{
  "message": "Booking approved successfully"
}
```

### Reject Booking (Admin Only)
**POST** `/bookings/{bookingId}/reject`

**Request Body:**
```json
{
  "rejectReason": "Jadwal bentrok dengan kelas reguler"
}
```

### Cancel Booking (User Only)
**POST** `/bookings/{bookingId}/cancel`

---

## 📦 Inventory Endpoints

### Get All Inventory
**GET** `/inventory?status=available`

**Query Parameters:**
- `status` (optional): 'available', 'maintenance', 'unavailable'

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "inv-001",
      "name": "Proyektor",
      "description": "Proyektor Epson EB-X51",
      "quantity": 5,
      "category": "Elektronik",
      "location": "Ruang Penyimpanan Gedung SG",
      "status": "available"
    }
  ]
}
```

### Get Inventory Details
**GET** `/inventory/{itemId}`

**Success Response (200):**
```json
{
  "item": {
    "id": "inv-001",
    "name": "Proyektor",
    "description": "Proyektor Epson EB-X51",
    "quantity": 4,
    "category": "Elektronik",
    "location": "Ruang Penyimpanan Gedung SG",
    "status": "available"
  },
  "loanHistory": [
    {
      "id": "loan-001",
      "user_name": "Syaif Ali M. Risal",
      "nim": "F55123064",
      "status": "borrowed",
      "borrowed_at": "2026-06-02T10:00:00Z"
    }
  ]
}
```

### Borrow Item
**POST** `/inventory/{itemId}/borrow`

**Request Body:**
```json
{
  "ktpNumber": "1234567890123456"
}
```

**Success Response (201):**
```json
{
  "message": "Item borrowed successfully",
  "loanId": "loan-001"
}
```

**Error Response (400):**
```json
{
  "error": "Item out of stock"
}
```

```json
{
  "error": "Please return previous borrowed items first"
}
```

### Return Item
**POST** `/inventory/{loanId}/return`

**Request Body:**
```json
{
  "condition": "Baik"
}
```

**Success Response (200):**
```json
{
  "message": "Item returned successfully"
}
```

### Get Loan History (Admin Only)
**GET** `/inventory/history?userId=user-001`

**Query Parameters:**
- `userId` (optional): Filter by user

---

## 🔍 Lost & Found Endpoints

### Create Report
**POST** `/lostfound`

**Request Body:**
```json
{
  "type": "lost",
  "itemName": "Dompet Hitam",
  "description": "Dompet kulit warna hitam dengan inisial SAR",
  "location": "Lantai 1 Gedung SG",
  "date": "2026-06-02",
  "category": "Barang Pribadi"
}
```

**Success Response (201):**
```json
{
  "message": "Report created successfully",
  "reportId": "lf-001"
}
```

### Get All Reports
**GET** `/lostfound?type=lost&status=pending&category=Barang%20Pribadi`

**Query Parameters:**
- `type` (optional): 'lost' or 'found'
- `status` (optional): 'pending', 'claimed', 'returned', 'archived'
- `category` (optional): Filter by category

### Get My Reports
**GET** `/lostfound/my-reports`

### Get Report Details
**GET** `/lostfound/{reportId}`

**Success Response (200):**
```json
{
  "report": {
    "id": "lf-001",
    "type": "lost",
    "item_name": "Dompet Hitam",
    "description": "Dompet kulit warna hitam dengan inisial SAR",
    "location": "Lantai 1 Gedung SG",
    "date_occurred": "2026-06-02",
    "status": "pending",
    "user_name": "Syaif Ali M. Risal",
    "user_email": "syaif.ali@student.untad.ac.id"
  },
  "claims": [
    {
      "id": "claim-001",
      "claimer_name": "Andi Pratama",
      "status": "pending",
      "message": "Saya melihat dompet ini di meja informasi"
    }
  ]
}
```

### Claim Item
**POST** `/lostfound/{reportId}/claim`

**Request Body:**
```json
{
  "message": "Saya melihat dompet ini di meja informasi"
}
```

**Success Response (201):**
```json
{
  "message": "Claim submitted successfully",
  "claimId": "claim-001"
}
```

### Approve Claim (Admin Only)
**POST** `/lostfound/claims/{claimId}/approve`

### Reject Claim (Admin Only)
**POST** `/lostfound/claims/{claimId}/reject`

**Request Body:**
```json
{
  "reason": "Barang sudah diambil oleh pemilik"
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Booking not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Request/Response Examples

### Complete Booking Flow

**1. Check Availability**
```bash
POST /api/rooms/check-availability
{
  "roomId": "room-001",
  "date": "2026-06-10",
  "startTime": "08:00",
  "endTime": "10:00"
}
```

**2. Create Booking**
```bash
POST /api/bookings
Authorization: Bearer {token}
{
  "roomId": "room-001",
  "bookingDate": "2026-06-10",
  "startTime": "08:00",
  "endTime": "10:00",
  "courseName": "Capstone Project"
}
```

**3. Admin Reviews (After 1-2 days)**
```bash
GET /api/bookings?status=pending
Authorization: Bearer {admin_token}
```

**4. Admin Approves**
```bash
POST /api/bookings/{bookingId}/approve
Authorization: Bearer {admin_token}
{
  "adminNotes": "Approved"
}
```

---

## 🔗 Rate Limiting (Future Enhancement)
- Currently: No rate limiting
- Recommended: 100 requests per minute per user

## 📊 Data Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| NIM | Length 8-20, alphanumeric | F55123064 |
| Email | Valid email format | user@untad.ac.id |
| Password | Min 6 characters | password123 |
| Phone | 10-15 digits | 081234567890 |
| Date | YYYY-MM-DD | 2026-06-10 |
| Time | HH:MM | 08:00 |

---

**Last Updated:** June 2026
**Version:** 1.0.0
**API Status:** ✅ Production Ready
