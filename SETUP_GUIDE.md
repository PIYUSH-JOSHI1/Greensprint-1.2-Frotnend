# 🚀 GREEN SPRINT - COMPLETE SETUP GUIDE

**Step-by-Step Instructions to Get Green Sprint Running Locally and Deploy to Production**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Setup](#frontend-setup)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Backend Setup (Python - Optional)](#backend-setup-python-optional)
5. [Deployment](#deployment)
6. [Environment Configuration](#environment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Git** - Version control (download: https://git-scm.com/)
- **Node.js & npm** - JavaScript runtime (optional, for build tools)
- **Python 3.9+** - Server-side logic (download: https://python.org/)
- **VS Code** - Code editor (download: https://code.visualstudio.com/)
- **Modern Browser** - Chrome/Firefox/Safari with camera access

### Required Accounts
- **Supabase Account** - Free at https://supabase.com/
- **Render Account** - Free at https://render.com/
- **GitHub Account** - Free at https://github.com/

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **Internet Connection**: Required for cloud services

---

## Frontend Setup

### Step 1: Clone the Repository

```bash
# Navigate to desired directory
cd ~/Documents  # or your preferred location

# Clone the Green Sprint repository
git clone https://github.com/PIYUSH-JOSHI1/Green_Spirt.git

# Navigate into project directory
cd Green_Spirt
```

**Verification**:
```bash
# Should show these files
ls -la
# index.html
# afterlogin.html
# README.md
# assets/
# css/
# js/
# vendor/
```

### Step 2: Create Project Structure (If Files Missing)

Ensure you have all necessary frontend files:

```
Green_Spirt/
├── index.html                 # Landing page
├── afterlogin.html            # Main dashboard
├── campaign.html              # Campaign management
├── tree-tracker.html          # QR scanner
├── leaderboard.html           # Rankings
├── profile.html               # User profile
├── analytics.html             # Analytics dashboard
│
├── css/
│   ├── templatemo-scholar.css # Main styles
│   ├── responsive.css         # Mobile styles
│   ├── qr-scanner.css         # QR interface
│   ├── dashboard.css          # Dashboard styles
│   └── *.css                  # Other CSS files
│
├── js/
│   ├── custom.js              # Main scripts
│   ├── supabase-client.js     # Supabase integration
│   ├── qr-scanner.js          # QR code scanner
│   ├── auth.js                # Authentication
│   ├── campaigns.js           # Campaign logic
│   └── *.js                   # Other JS files
│
└── assets/
    ├── images/
    ├── webfonts/
    └── json/
```

### Step 3: Start Local Development Server

**Option 1: Using Python (Recommended)**

```bash
# Windows
python -m http.server 8000

# macOS/Linux
python3 -m http.server 8000

# Output should show:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

**Option 2: Using Node.js**

```bash
# Install http-server (one-time)
npm install -g http-server

# Run server
http-server

# Output should show:
# Starting up http-server, serving .
# Available on:
#   http://127.0.0.1:8080
```

**Option 3: Using VS Code Live Server**

```
1. Install "Live Server" extension by Ritwick Dey
2. Right-click on index.html
3. Select "Open with Live Server"
```

### Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

You should see the Green Sprint landing page.

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Click **"Start your project"**
3. **Sign up** with email or GitHub account
4. Click **"New Project"**
5. Fill in project details:
   - **Name**: `green-sprint` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Select closest to your location
6. Click **"Create new project"**
7. Wait for initialization (2-3 minutes)

### Step 2: Get Connection Details

Once project is created:

1. Go to **Settings** → **API**
2. Copy these credentials:
   - **Project URL**: `https://xxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...`
3. Save these in a safe place

### Step 3: Create Database Tables

1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire SQL schema from [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
4. Paste into SQL editor
5. Click **"Run"** button
6. Wait for completion (should see green checkmark)

**Or Execute Tables One By One**:

```sql
-- 1. Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  -- ... (full schema in DATABASE_SCHEMA.md)
);

-- 2. Create campaigns table
CREATE TABLE campaigns (
  -- ... (full schema in DATABASE_SCHEMA.md)
);

-- Continue with other tables...
```

### Step 4: Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. For each sensitive table (`users`, `trees`, `campaigns`):
   - Click the table name
   - Click **"Enable RLS"**
   - Add policies as needed

### Step 5: Enable Real-time

1. Go to **Database** → **Replication**
2. Select all tables
3. Click **"Enable"** for real-time

### Step 6: Configure Authentication

1. Go to **Authentication** → **Providers**
2. **Email/Password**: Already enabled by default
3. Optional: Enable **Google OAuth**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add credentials to Supabase
4. Go to **Authentication** → **Settings**
5. Configure:
   - **Site URL**: `http://localhost:8000` (dev) or your domain (prod)
   - **Redirect URLs**: Add all applicable URLs
   - **JWT Expiry**: 3600 seconds (1 hour)

### Step 7: Create Storage Bucket

1. Go to **Storage** → **New Bucket**
2. Name: `tree-photos`
3. Public: **ON** (for image display)
4. Click **"Create bucket"**
5. Go to **Policies** and set appropriate permissions

---

## Backend Setup (Python - Optional)

### Step 1: Create Backend Directory

```bash
# In your project root
mkdir backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### Step 2: Create Requirements File

Create `requirements.txt`:

```
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
supabase==2.0.0
requests==2.31.0
pillow==10.0.0
gunicorn==21.0.0
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 4: Create .env File

Create `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# API Settings
API_KEY=your-secret-api-key
JWT_SECRET=your-jwt-secret-key
```

### Step 5: Create Main App File

Create `backend/app.py`:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', '').split(','))

# Configure app
app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Test route
@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Green Sprint API is running',
        'timestamp': datetime.now().isoformat()
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Run app
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
```

### Step 6: Test Backend Locally

```bash
# Run Flask development server
python app.py

# Should output:
# WARNING: This is a development server. Do not use it in production.
# Running on http://127.0.0.1:5000

# Test in another terminal:
curl http://localhost:5000/api/v1/health

# Should return:
# {"status":"ok","message":"Green Sprint API is running","timestamp":"..."}
```

### Step 7: Create Additional Backend Modules

Create `backend/routes/auth.py`:

```python
from flask import Blueprint, request, jsonify
import supabase

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    try:
        # Register with Supabase
        user = supabase.auth.sign_up({
            'email': email,
            'password': password,
            'options': {
                'data': {'full_name': full_name}
            }
        })
        
        return jsonify({
            'status': 'success',
            'user': user.user.model_dump() if user.user else None
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    try:
        response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        
        return jsonify({
            'status': 'success',
            'session': response.session.model_dump() if response.session else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401
```

---

## Deployment

### Deploy Frontend to GitHub Pages

```bash
# Build/prepare frontend (optional)
# If using build tools, run: npm run build

# Create gh-pages branch
git checkout --orphan gh-pages

# Push to GitHub Pages
git subtree push --prefix . origin gh-pages

# Verify at: https://yourusername.github.io/Green_Spirt/
```

### Deploy Backend to Render

1. **Push Code to GitHub**:
   ```bash
   cd backend
   git add .
   git commit -m "Add backend"
   git push origin main
   ```

2. **Create Render Service**:
   - Go to https://render.com/
   - Click **"New"** → **"Web Service"**
   - Connect GitHub repository
   - Select the `backend` directory

3. **Configure Service**:
   - **Name**: `green-sprint-api`
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free (or paid for production)

4. **Add Environment Variables**:
   - Click **"Environment"**
   - Add all variables from `.env` file
   - **IMPORTANT**: Use Supabase **Service Key** (not Anon Key) for backend

5. **Deploy**:
   - Click **"Create Web Service"**
   - Render auto-deploys on git push

6. **Get API URL**:
   - Once deployed, you'll get URL like: `https://green-sprint-api.onrender.com`
   - Update frontend to use this URL

### Update Frontend with Backend URL

Edit `js/supabase-client.js`:

```javascript
// Development
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Production
// const API_BASE_URL = 'https://green-sprint-api.onrender.com/api/v1';

// Use based on environment
const CURRENT_ENV = window.location.hostname === 'localhost' ? 'dev' : 'prod';
const API_URL = CURRENT_ENV === 'dev' ? API_BASE_URL : 'https://green-sprint-api.onrender.com/api/v1';
```

---

## Environment Configuration

### Frontend Configuration

Create `js/config.js`:

```javascript
// Environment detection
const ENV = {
  DEV: 'development',
  PROD: 'production'
};

const CURRENT_ENV = window.location.hostname === 'localhost' 
  ? ENV.DEV 
  : ENV.PROD;

// Supabase Configuration
const SUPABASE_CONFIG = {
  development: {
    url: 'https://xxxx.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIs...'
  },
  production: {
    url: 'https://xxxx.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIs...'
  }
};

// API Configuration
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:5000/api/v1'
  },
  production: {
    baseUrl: 'https://green-sprint-api.onrender.com/api/v1'
  }
};

// Botpress Configuration
const BOTPRESS_ID = '1c7bd4be-5b10-46ab-ae48-ccdf645365b9';

// Export
export { CURRENT_ENV, ENV, SUPABASE_CONFIG, API_CONFIG, BOTPRESS_ID };
```

### Backend Configuration

Use environment variables in `backend/.env`:

```env
# Environment
FLASK_ENV=production

# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_key

# Security
JWT_SECRET=your_secret_key
API_KEY=your_api_key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (optional)
SENDGRID_API_KEY=your_key
```

---

## Testing & Verification

### Frontend Testing

1. **Landing Page**: Open `http://localhost:8000`
   - [ ] Logo and navigation visible
   - [ ] Features section loads
   - [ ] Call-to-action buttons work

2. **Authentication**:
   - [ ] Sign up form accepts email/password
   - [ ] Verification email received
   - [ ] Login with credentials works
   - [ ] Password reset flow works

3. **Dashboard**:
   - [ ] User profile displays
   - [ ] Campaign list loads
   - [ ] Stats and metrics visible

4. **QR Code Scanner**:
   - [ ] Camera permission request shows
   - [ ] Camera feed displays
   - [ ] QR code detection works
   - [ ] Tree registration form appears

5. **Mobile Testing**:
   - [ ] Responsive layout on mobile
   - [ ] Touch interactions work
   - [ ] Camera access on phone

### Backend Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/v1/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Test with bearer token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/users/me
```

### Database Testing

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count users
SELECT COUNT(*) FROM users;

-- Check indexes
SELECT * FROM pg_stat_user_indexes;

-- View recent data
SELECT * FROM users LIMIT 5;
```

---

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Error

**Error**: `Failed to connect to Supabase`

**Solution**:
```javascript
// Check credentials in supabase-client.js
const SUPABASE_URL = 'https://xxxx.supabase.co'; // Should be valid URL
const SUPABASE_ANON_KEY = 'eyJ...'; // Should be long string

// Check browser console for CORS errors
// Fix: Ensure origin is whitelisted in Supabase

// Test connection
const { data, error } = await supabase.from('users').select('*').limit(1);
if (error) console.error('Error:', error.message);
```

#### 2. QR Scanner Not Working

**Error**: `Camera permission denied` or `Scanner not initializing`

**Solution**:
```javascript
// Check if HTTPS (required for camera)
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  console.error('Camera requires HTTPS');
}

// Check library loaded
if (typeof Html5Qrcode === 'undefined') {
  console.error('html5-qrcode library not loaded');
}

// Request permissions explicitly
navigator.permissions.query({name: 'camera'})
  .then(result => {
    if (result.state === 'granted') {
      // Camera access granted
    }
  });
```

#### 3. Frontend Cannot Reach Backend

**Error**: `Failed to fetch from API`

**Solution**:
```javascript
// Check API URL
console.log('API URL:', API_BASE_URL);

// Check CORS is enabled on backend
app.use(CORS({
  origin: window.location.origin,
  credentials: true
}));

// Test basic connectivity
fetch('http://localhost:5000/api/v1/health')
  .then(r => r.json())
  .then(data => console.log('Backend response:', data))
  .catch(e => console.error('Backend unreachable:', e));
```

#### 4. Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -i :8000
kill -9 [PID]

# Or use different port
python -m http.server 9000
```

#### 5. Database Migration Errors

**Error**: `Column already exists` or `Table exists`

**Solution**:
```sql
-- Drop and recreate (development only!)
DROP TABLE IF EXISTS public.trees CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Then re-execute all CREATE TABLE statements

-- Or use transactions
BEGIN;
  -- Your SQL statements
COMMIT;

-- Rollback if error
ROLLBACK;
```

---

## Performance Optimization

### Frontend Optimization

```bash
# Minify CSS/JS (optional)
npm install -g csso-cli terser

csso assets/css/*.css -o assets/css/min/
terser assets/js/*.js -o assets/js/min/

# Enable compression in server
# For Python: pip install flask-gzip
# For Nginx: gzip on; gzip_types text/css text/javascript;
```

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM campaigns WHERE status = 'active';

-- Update statistics
ANALYZE;

-- Check slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC;
```

### Backend Optimization

```python
# Use connection pooling
from sqlalchemy import create_engine
engine = create_engine('postgresql://...', poolclass=QueuePool)

# Cache responses
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/v1/campaigns')
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_campaigns():
    pass
```

---

## Next Steps

1. **Customize Domain**:
   - Register domain (GoDaddy, Namecheap, etc.)
   - Point DNS to Render/GitHub Pages
   - Update authentication URLs

2. **Setup Monitoring**:
   - Monitor Supabase dashboard
   - Set up error tracking (Sentry)
   - Monitor API performance

3. **Launch Campaign**:
   - Announce platform
   - Recruit early users
   - Gather feedback

4. **Scale Infrastructure**:
   - Upgrade Supabase plan
   - Upgrade Render instance
   - Add CDN for static assets

---

## Support

For issues or questions:

- 📧 **Email**: drigoon2512M@gmail.com
- 📱 **Phone**: +91 7588322212
- 💬 **Chatbot**: Available in application
- 🐛 **Issues**: GitHub Issues
- 📖 **Documentation**: README.md, PROJECT_IDEA.md, DATABASE_SCHEMA.md

---

**Happy Coding! 🌱**

**Version**: 1.0 | **Last Updated**: February 2026
