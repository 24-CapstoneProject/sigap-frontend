# 🛠️ Development & Troubleshooting Guide

## 🐛 Common Issues & Solutions

### Database Connection Issues

#### Error: "connect ECONNREFUSED 127.0.0.1:3306"

**Cause:** MySQL server is not running

**Solution:**
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

**Verify MySQL is running:**
```bash
mysql -u root -p -e "SELECT 1;"
```

---

#### Error: "Access denied for user 'root'@'localhost'"

**Cause:** Wrong password or user doesn't exist

**Solution:**
1. Open `.env` file
2. Check `DB_PASSWORD` matches your MySQL password
3. If no password set during MySQL install, leave it empty:
   ```env
   DB_PASSWORD=
   ```

**Reset MySQL password (Windows):**
```bash
# Stop MySQL
net stop MySQL80

# Start with no grant tables
mysqld --skip-grant-tables

# In another terminal, connect to MySQL
mysql -u root

# Run:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

---

#### Error: "Unknown database 'sigap_db'"

**Cause:** Database hasn't been created

**Solution:**
```bash
# Navigate to backend folder
cd backend

# Run migration
mysql -u root -p < database/schema.sql

# Verify
mysql -u root -p -e "SHOW DATABASES;" | grep sigap_db
```

---

### Server Issues

#### Error: "EADDRINUSE :::5000"

**Cause:** Port 5000 is already in use

**Solution:**

**Option 1: Change PORT in .env**
```env
PORT=5001
```

**Option 2: Kill process using port 5000**

Windows:
```bash
netstat -ano | findstr :5000
# Find the PID, then:
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -i :5000
# Find the PID, then:
kill -9 <PID>
```

---

#### Error: "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd backend
npm install

# Verify
npm list express
```

---

#### Error: "Cannot find module 'dotenv'"

**Cause:** .env configuration missing

**Solution:**
```bash
cd backend
cp .env.example .env
npm install
```

---

### Authentication Issues

#### Token Not Working

**Symptom:** All protected endpoints return 401

**Check:**
1. Is token in localStorage?
```javascript
console.log(localStorage.getItem('token'));
```

2. Is token in Authorization header?
```javascript
// In your API client
headers: {
  'Authorization': `Bearer ${token}`  // Correct format!
}
```

3. Verify token format:
```bash
# Token should look like:
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAxIn0.xxx
```

---

#### "Invalid or expired token"

**Cause:** Token is malformed or expired

**Solution:**
```javascript
// Get new token by logging in again
await api.post('/auth/login', {
  identifier: 'F55123064',
  password: '123456'
});

// Store in localStorage
localStorage.setItem('token', response.data.token);
```

---

### API Request Issues

#### CORS Error: "Access to XMLHttpRequest blocked by CORS policy"

**Cause:** Frontend and backend origins don't match

**Solution:**

Update backend `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true,
}));
```

And update `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

---

#### Error 400: "Validation failed"

**Cause:** Missing or invalid request data

**Example request:**
```json
{
  "identifier": "F55123064",
  "password": "123456"
}
```

**Solution:** Check required fields in documentation

---

#### Error 409: "User already exists"

**Cause:** NIM or email already registered

**Solution:** Use different NIM/email or check database

---

### Data Validation Issues

#### Cannot create booking: "Time slot already booked"

**Debug:**
```javascript
// Check room availability first
await api.post('/rooms/check-availability', {
  roomId: 'room-001',
  date: '2026-06-10',
  startTime: '08:00',
  endTime: '10:00'
});

// Response tells you what's conflicting
```

---

#### Cannot borrow item: "Item out of stock"

**Cause:** All items currently borrowed

**Solution:**
- Wait for someone to return the item
- Admin can create more items

---

## 🔍 Debugging Tools

### 1. Check Server Status

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SIGAP Backend is running"
}
```

---

### 2. Check Database Connection

```javascript
// In a test file
import { query } from './config/database.js';

const result = await query('SELECT 1');
console.log('Database connected:', result);
```

---

### 3. Enable Request Logging

Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

---

### 4. Test with Postman

Import collection:
1. Open Postman
2. Click "Import"
3. Choose "Raw text"
4. Paste endpoint URL with authorization header
5. Add body and test

Example:
```
POST http://localhost:5000/api/auth/login
Headers:
  Content-Type: application/json

Body:
{
  "identifier": "F55123064",
  "password": "123456"
}
```

---

### 5. Check Error Logs

```bash
# Backend logs are printed to console
# Look for stack traces

# Also check MySQL logs
# Windows: C:\ProgramData\MySQL\MySQL Server 8.0\Data
# macOS: /usr/local/var/mysql/
# Linux: /var/log/mysql/
```

---

## 📊 Database Debugging

### Check Database Structure

```sql
USE sigap_db;

-- List all tables
SHOW TABLES;

-- Check table structure
DESCRIBE users;
DESCRIBE bookings;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM bookings;

-- View all users
SELECT * FROM users;

-- View pending bookings
SELECT * FROM bookings WHERE status = 'pending';
```

---

### Backup Database

```bash
# Backup
mysqldump -u root -p sigap_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u root -p sigap_db < backup.sql
```

---

### Reset Database

```bash
# Drop and recreate
mysql -u root -p
DROP DATABASE IF EXISTS sigap_db;
source backend/database/schema.sql
source backend/database/seed.sql
```

---

## 🔐 Security Debugging

### Check Password Hashing

```javascript
import bcrypt from 'bcryptjs';

// Hash a password
const hash = await bcrypt.hash('password123', 10);
console.log('Hashed:', hash);

// Verify password
const isValid = await bcrypt.compare('password123', hash);
console.log('Valid:', isValid);
```

---

### Verify JWT Token

```javascript
import jwt from 'jsonwebtoken';

// Create token
const token = jwt.sign({ id: 'user-001' }, 'secret');

// Verify token
const decoded = jwt.verify(token, 'secret');
console.log('Decoded:', decoded);
```

---

## 📈 Performance Issues

### Slow Queries

**Check:**
1. Queries without indexes
2. Missing WHERE clauses
3. N+1 query problems

**Add indexes:**
```sql
CREATE INDEX idx_user_id ON bookings(user_id);
CREATE INDEX idx_booking_date ON bookings(booking_date);
```

---

### Connection Pool Issues

**Check pool config in `config/database.js`:**
```javascript
{
  waitForConnections: true,
  connectionLimit: 10,  // Increase if getting "connection timeout"
  queueLimit: 0,
}
```

---

## 🧪 Testing Endpoints

### Test Script

Create `test.js`:
```javascript
import api from './services/api.js';

async function test() {
  try {
    // Test login
    const login = await api.post('/auth/login', {
      identifier: 'F55123064',
      password: '123456'
    });
    console.log('✅ Login:', login.data);

    // Set token
    const token = login.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test get rooms
    const rooms = await api.get('/rooms');
    console.log('✅ Rooms:', rooms.data);

    // Test create booking
    const booking = await api.post('/bookings', {
      roomId: 'room-001',
      bookingDate: '2026-06-10',
      startTime: '08:00',
      endTime: '10:00',
      courseName: 'Test'
    });
    console.log('✅ Booking:', booking.data);

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

test();
```

Run:
```bash
node test.js
```

---

## 🚀 Performance Optimization

### 1. Connection Pooling
Already configured in `config/database.js`

### 2. Database Indexes
Already added in schema

### 3. Response Caching
Future enhancement

### 4. Query Optimization
```sql
-- Good: With index
SELECT * FROM bookings WHERE user_id = ? AND status = 'pending';

-- Bad: Full table scan
SELECT * FROM bookings WHERE DATE(booking_date) = CURDATE();
```

---

## 📋 Deployment Debugging

### Check Production Environment

```bash
# SSH to server
ssh user@server.ip

# Check if Node is running
ps aux | grep node

# Check port 5000
netstat -tlnp | grep 5000

# Check MySQL
systemctl status mysql

# Check logs
tail -f /var/log/app.log
```

---

## 🆘 Get Support

1. Check this guide first
2. Look at error message carefully
3. Check backend logs
4. Check browser console
5. Check database directly
6. Ask for help with full error message & steps to reproduce

---

## 📚 Related Documentation

- [Backend README](backend/README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Frontend Integration](FRONTEND_BACKEND_INTEGRATION.md)
- [Quick Start](QUICKSTART.md)

---

**Last Updated:** June 2026  
**Version:** 1.0.0
