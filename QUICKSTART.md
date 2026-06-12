# 🚀 SIGAP - Quick Start Guide

## ⏱️ Setup Time: ~10 minutes

## 📋 Prerequisites Check

```bash
# Check Node.js version
node --version  # Should be v16+

# Check npm version
npm --version   # Should be v8+

# Check MySQL is running
mysql --version # Should be v8.0+
```

## 🔧 Step-by-Step Setup

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Create MySQL Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p

# Inside MySQL:
source database/schema.sql
source database/seed.sql
exit
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. File → Run SQL Script
3. Select `backend/database/schema.sql`
4. Click Run
5. Repeat for `backend/database/seed.sql`

### Step 3: Create .env File
```bash
cp .env.example .env
```

**Edit .env:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sigap_db
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
✅ SIGAP Backend Server running on http://localhost:5000
📝 Environment: development
```

## ✅ Verify Backend is Running

```bash
# In another terminal, test the health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"SIGAP Backend is running"}
```

## 🧪 Test Login

### Using Postman/Insomnia

1. **Create new POST request**
2. **URL:** `http://localhost:5000/api/auth/login`
3. **Body (JSON):**
```json
{
  "identifier": "F55123064",
  "password": "123456"
}
```
4. **Send** and verify you get a token

### Expected Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "nim": "F55123064",
    "email": "syaif.ali@student.untad.ac.id",
    "name": "Syaif Ali M. Risal",
    "role": "mahasiswa"
  }
}
```

## 🎯 Test Credentials

| Role | NIM/Email | Password |
|------|-----------|----------|
| Admin | ADMIN001 | admin123 |
| Student | F55123064 | 123456 |
| Student | F52123083 | 123456 |
| Student | F52123084 | 123456 |

## 🔗 Frontend Integration

### Step 1: Install Axios in Frontend
```bash
cd ..  # Go back to root
npm install axios
```

### Step 2: Create API Service
Create `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 3: Start Frontend
```bash
npm run dev
```

## 📚 Common API Calls

### Create Booking
```javascript
const api = require('./services/api').default;

await api.post('/bookings', {
  roomId: 'room-001',
  bookingDate: '2026-06-10',
  startTime: '08:00',
  endTime: '10:00',
  courseName: 'Capstone Project'
});
```

### Get My Bookings
```javascript
const bookings = await api.get('/bookings/my-bookings');
```

### Borrow Item
```javascript
await api.post('/inventory/inv-001/borrow', {
  ktpNumber: '1234567890123456'
});
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# If error, start MySQL:
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue: "Port 5000 already in use"
```bash
# Change PORT in .env to 5001
PORT=5001

# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9 <PID>
```

### Issue: "Unknown database 'sigap_db'"
```bash
# Run migration
mysql -u root -p < backend/database/schema.sql
```

### Issue: "Access denied for user 'root'"
```bash
# Update DB_PASSWORD in .env with correct MySQL password
# Make sure you set it during MySQL installation
```

## 📊 Database Tables

```
✅ users                 - User accounts
✅ rooms                 - Classroom information
✅ bookings              - Room bookings
✅ inventory             - Equipment/items
✅ inventory_loans       - Loan history
✅ lost_found            - Lost & Found reports
✅ lost_found_claims     - Claim requests
```

## 🔐 Security Notes

⚠️ **For Development Only:**
- Default credentials are for testing only
- Change JWT_SECRET in production
- Use strong database passwords in production
- Enable HTTPS in production
- Set NODE_ENV=production

## 📚 Full Documentation

- [Backend README](backend/README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Frontend-Backend Integration](FRONTEND_BACKEND_INTEGRATION.md)
- [Database Schema](backend/database/schema.sql)

## 🎉 You're Ready!

Your SIGAP system is now running! 🎊

### Next Steps:
1. ✅ Test API endpoints with Postman
2. ✅ Verify database has sample data
3. ✅ Start developing frontend components
4. ✅ Test booking flow end-to-end
5. ✅ Deploy to production

## 💬 Need Help?

Check the troubleshooting section in [Backend README](backend/README.md)

---

**Happy Coding! 🚀**
