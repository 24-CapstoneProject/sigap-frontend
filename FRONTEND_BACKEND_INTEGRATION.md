# Frontend-Backend Integration Guide

## 📱 Connecting React Frontend to Express Backend

### 1. Install API Client

Di folder `src`, buat file baru: `services/api.js`

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### 2. Create Auth Service

```javascript
// src/services/authService.js
import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(identifier, password) {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};
```

### 3. Create Booking Service

```javascript
// src/services/bookingService.js
import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getMyBookings(status) {
    const response = await api.get('/bookings/my-bookings', {
      params: { status }
    });
    return response.data.bookings;
  },

  async getAllBookings(status, roomId, date) {
    const response = await api.get('/bookings', {
      params: { status, roomId, date }
    });
    return response.data.bookings;
  },

  async getBookingById(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data.booking;
  },

  async updateBooking(bookingId, bookingData) {
    const response = await api.put(`/bookings/${bookingId}`, bookingData);
    return response.data;
  },

  async approveBooking(bookingId, adminNotes) {
    const response = await api.post(`/bookings/${bookingId}/approve`, { adminNotes });
    return response.data;
  },

  async rejectBooking(bookingId, rejectReason) {
    const response = await api.post(`/bookings/${bookingId}/reject`, { rejectReason });
    return response.data;
  },

  async cancelBooking(bookingId) {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
};
```

### 4. Create Room Service

```javascript
// src/services/roomService.js
import api from './api';

export const roomService = {
  async getAllRooms(status, floor) {
    const response = await api.get('/rooms', {
      params: { status, floor }
    });
    return response.data.rooms;
  },

  async getRoomById(roomId) {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data.room;
  },

  async checkAvailability(roomId, date, startTime, endTime) {
    const response = await api.post('/rooms/check-availability', {
      roomId,
      date,
      startTime,
      endTime
    });
    return response.data;
  }
};
```

### 5. Update LoginPage.jsx

```javascript
// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { authService } from "../../services/authService.js";

export default function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login(identifier, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">SIGAP Login</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIM atau Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 6. Update StudentBooking.jsx

```javascript
// src/pages/student/StudentBooking.jsx
import { useState, useEffect } from "react";
import { bookingService } from "../../services/bookingService.js";
import { roomService } from "../../services/roomService.js";

export default function StudentBooking() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [myBookings, allRooms] = await Promise.all([
        bookingService.getMyBookings(),
        roomService.getAllRooms()
      ]);
      setBookings(myBookings);
      setRooms(allRooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (formData) => {
    try {
      await bookingService.createBooking(formData);
      loadData();
      alert("Booking created successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create booking");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.room_name}</td>
                <td>{booking.booking_date}</td>
                <td>{booking.start_time} - {booking.end_time}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status === 'pending' && (
                    <button onClick={() => bookingService.cancelBooking(booking.id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## 📊 Environment Setup

### Frontend .env

```env
VITE_API_URL=http://localhost:5000
```

### Update vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## 🔄 Data Flow Diagram

```
React Component
      ↓
Service (api call)
      ↓
Axios (with token)
      ↓
Express Backend
      ↓
Middleware (auth, validation)
      ↓
Controller (business logic)
      ↓
Database (MySQL)
```

## 🚨 Error Handling

```javascript
try {
  const result = await authService.login(nim, password);
} catch (err) {
  if (err.response?.status === 401) {
    console.log("Invalid credentials");
  } else if (err.response?.status === 400) {
    console.log("Validation error:", err.response.data.details);
  } else {
    console.log("Server error");
  }
}
```

## ✅ Testing Checklist

- [ ] Backend running on localhost:5000
- [ ] Database migration completed
- [ ] Frontend can make API calls
- [ ] Login/Register working
- [ ] Token stored in localStorage
- [ ] Token included in all protected requests
- [ ] Bookings can be created
- [ ] Admin can approve/reject bookings
- [ ] Inventory borrowing working
- [ ] Lost & Found reports working

## 🐛 Debugging

```javascript
// Add this to see all API calls
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

---

**Next Step:** Install `axios` di frontend: `npm install axios`
