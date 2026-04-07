# 🌱 Green Sprint - Environmental Stewardship Platform

<div align="center">

![Green Sprint Logo](assets/images/green%20spirt%20(1).png)

**Empowering Communities to Plant, Track, and Celebrate Tree Planting Initiatives**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)]()
[![Built with](https://img.shields.io/badge/Built%20with-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Python-blue)]()

[Live Demo](https://piyush-joshi1.github.io/Green_Spirt/) • [Documentation](#table-of-contents) • [Features](#-features) • [Setup](#-installation--setup)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Installation & Setup](#-installation--setup)
- [Frontend Structure](#-frontend-structure)
- [Backend API](#-backend-api)
- [QR Code Integration](#-qr-code-integration)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌍 Overview

**Green Sprint** is a comprehensive environmental stewardship platform designed to mobilize communities in tree planting initiatives. By combining gamification, QR code tracking, and data analytics, Green Sprint makes environmental conservation engaging, transparent, and impactful.

### Vision
To create a global community that actively participates in environmental conservation through tree planting, tracking, and celebrating collective impact on our planet.

### Mission
- Simplify tree planting coordination for organizations and communities
- Provide transparent tracking of environmental impact
- Gamify conservation efforts to increase participation
- Create accountability through QR code verification
- Build a global community of environmental champions

---

## ✨ Features

### 🎯 Core Features

#### 1. **User Authentication & Profiles**
- Secure user registration and login
- Role-based access (Admin, Organizer, Community Member, Donor)
- User profiles with environmental impact statistics
- Social integration (share achievements)
- Leaderboards & rankings

#### 2. **Tree Planting Campaigns**
- Create and manage tree planting campaigns
- Set campaign targets and track progress in real-time
- Campaign categories (Urban Forestry, Reforestation, Home Gardens)
- Campaign visibility settings (Public, Private, Community-Only)
- Participation tracking with detailed analytics

#### 3. **QR Code Tree Tracking**
- Generate unique QR codes for each planted tree
- Mobile-friendly QR code scanning
- Tree registration upon QR scan
- Embedded tree information (location, species, planting date)
- Visual confirmation of tree planting with photo evidence
- Historical data logging for environmental impact assessment

#### 4. **Tree Database & Catalog**
- Comprehensive tree species database
- Tree characteristics (height, lifespan, CO₂ absorption, benefits)
- Care instructions and maintenance guides
- Seasonal planting recommendations
- Disease and pest information

#### 5. **Environmental Impact Dashboard**
- Real-time statistics on trees planted
- Carbon offset calculations (CO₂ sequestered)
- Water conservation metrics
- Air quality improvement estimates
- Biodiversity impact visualization

#### 6. **Gamification System**
- Achievement badges (Planter, Conservationist, Champion, Guardian)
- Points/XP system for various activities
- Daily challenges and missions
- Seasonal competitions
- Milestone celebrations

#### 7. **Community & Social Features**
- Community forums for sharing tips
- Photo gallery of planted trees
- Success stories and testimonials
- Member-to-member challenges
- Community events calendar

#### 8. **Mobile Responsive Interface**
- Full mobile optimization
- Progressive Web App (PWA) capabilities
- Offline functionality
- Touch-friendly UI/UX

#### 9. **Analytics & Reporting**
- Detailed campaign analytics
- Individual user statistics
- Environmental impact metrics
- Export reports (PDF, CSV)

#### 10. **AI-Powered Chatbot**
- Environmental education
- Tree care assistance
- Campaign guidance
- Q&A support (Botpress integration)

---

## 🏗️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive styling with animations
- **JavaScript (Vanilla)** - Interactive features
- **Bootstrap 5** - Responsive grid framework
- **Swiper.js** - Carousel functionality
- **Animate.css** - Smooth animations
- **Font Awesome** - Icon library
- **Chart.js** - Data visualization
- **Leaflet.js** - Interactive mapping
- **html5-qrcode** - QR code scanning

### Backend (Optional)
- **Python** - Server-side logic
- **Flask** - Lightweight web framework
- **Deployed on Render** - Cloud hosting

### Database
- **Supabase** - PostgreSQL-based BaaS
- **Authentication** - Supabase Auth
- **Real-time Updates** - Supabase Real-time subscriptions
- **Storage** - Supabase Storage

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐
│      USER INTERFACE (Frontend)       │
│   HTML/CSS/JS - All Pages & Forms    │
└──────────────────────────────────────┘
              ↓ (API Calls)
┌──────────────────────────────────────┐
│   API MIDDLEWARE (Backend Optional)  │
│      Python on Render Platform       │
│  • Authentication & Validation       │
│  • QR Code Generation & Scanning     │
│  • Image Processing                  │
│  • Calculations & Reports            │
└──────────────────────────────────────┘
              ↓ (REST API)
┌──────────────────────────────────────┐
│   SUPABASE DATABASE (PostgreSQL)     │
│  • Users & Authentication            │
│  • Campaigns & Trees                 │
│  • QR Codes & Images                 │
│  • Impact Metrics                    │
└──────────────────────────────────────┘
```

---

## 💾 Database Schema

### Supabase PostgreSQL Schema

#### **1. Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(50) DEFAULT 'member',
  location VARCHAR(255),
  phone VARCHAR(20),
  total_trees_planted INT DEFAULT 0,
  total_points INT DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### **2. Campaigns Table**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  description TEXT,
  objective VARCHAR(50) NOT NULL,
  target_trees INT NOT NULL,
  trees_planted INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  visibility VARCHAR(50) DEFAULT 'public',
  start_date DATE NOT NULL,
  end_date DATE,
  location JSON,
  campaign_image_url TEXT,
  total_co2_sequestered DECIMAL(10, 2) DEFAULT 0,
  total_water_saved DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

#### **3. Trees Table**
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  species_id UUID NOT NULL REFERENCES tree_species(id),
  qr_code_id VARCHAR(100) UNIQUE NOT NULL,
  planter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  location JSON NOT NULL,
  planting_date DATE NOT NULL,
  photo_url TEXT,
  health_status VARCHAR(50) DEFAULT 'healthy',
  height_cm DECIMAL(6, 2),
  survival_status BOOLEAN DEFAULT TRUE,
  co2_sequestered_kg DECIMAL(8, 2) DEFAULT 0,
  water_saved_liters DECIMAL(10, 2) DEFAULT 0,
  verification_timestamp TIMESTAMP,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trees_campaign ON trees(campaign_id);
CREATE INDEX idx_trees_species ON trees(species_id);
CREATE INDEX idx_trees_planter ON trees(planter_id);
```

#### **4. Tree Species Table**
```sql
CREATE TABLE tree_species (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  native_region VARCHAR(255),
  height_m DECIMAL(6, 2),
  maturity_years INT,
  annual_co2_absorption_kg DECIMAL(8, 2),
  annual_water_absorption_liters DECIMAL(10, 2),
  lifespan_years INT,
  biodiversity_score INT,
  difficulty_level VARCHAR(20),
  ideal_season VARCHAR(50),
  care_instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **5. QR Codes Table**
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_unique_id VARCHAR(100) UNIQUE NOT NULL,
  qr_image_url TEXT,
  tree_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'unused',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_scan_timestamp TIMESTAMP,
  scan_count INT DEFAULT 0,
  scan_history JSONB[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qr_codes_campaign ON qr_codes(campaign_id);
CREATE INDEX idx_qr_codes_status ON qr_codes(status);
```

#### **6. User Achievements Table**
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  milestone_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);
```

#### **7. Environmental Impact Table**
```sql
CREATE TABLE environmental_impact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_trees_planted INT DEFAULT 0,
  total_co2_sequestered_kg DECIMAL(15, 2) DEFAULT 0,
  total_water_saved_liters DECIMAL(15, 2) DEFAULT 0,
  estimated_biodiversity_improvement DECIMAL(8, 2) DEFAULT 0,
  report_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_campaign ON environmental_impact(campaign_id);
```

#### **8. Photos Table**
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_cover_photo BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_tree ON photos(tree_id);
```

#### **9. Campaign Participants Table**
```sql
CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'participant',
  trees_planted INT DEFAULT 0,
  hours_contributed DECIMAL(8, 2) DEFAULT 0,
  donation_amount DECIMAL(10, 2),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_participants_campaign ON campaign_participants(campaign_id);
```

---

## 📁 Frontend Structure

```
frontend/
├── index.html                # Landing Page
├── afterlogin.html           # Dashboard
├── campaign.html             # Campaign Management
├── tree-tracker.html         # QR Scanner
├── leaderboard.html          # Rankings
├── profile.html              # User Profile
├── analytics.html            # Impact Dashboard
├── achievements.html         # Badges
├── community.html            # Social Features
├── tree-species.html         # Tree Database
├── tree-care-guide.html      # Maintenance
├── help.html                 # Support
├── about.html                # About
│
├── css/
│   ├── templatemo-scholar.css
│   ├── animate.css
│   ├── flex-slider.css
│   ├── fontawesome.css
│   ├── owl.css
│   ├── responsive.css
│   ├── qr-scanner.css
│   ├── dashboard.css
│   ├── campaign.css
│   ├── leaderboard.css
│   └── analytics.css
│
├── js/
│   ├── custom.js
│   ├── counter.js
│   ├── qr-scanner.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── campaigns.js
│   ├── tree-tracker.js
│   ├── leaderboard.js
│   ├── analytics.js
│   ├── supabase-client.js
│   ├── api-handler.js
│   ├── storage.js
│   ├── geolocation.js
│   └── utils.js
│
└── assets/
    ├── images/
    ├── webfonts/
    └── json/
```

---

## 🔌 Backend API (Optional)

### Base URL
```
https://green-sprint-api.render.com/api/v1
```

### Key Endpoints

```
Authentication:
POST   /auth/register
POST   /auth/login
POST   /auth/logout

Users:
GET    /users/:id
PUT    /users/:id
GET    /users/leaderboard

Campaigns:
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PUT    /campaigns/:id
GET    /campaigns/:id/trees

Trees & QR:
POST   /trees
GET    /trees/:id
GET    /qr-codes/:qr_code_id
POST   /qr-codes/scan

Analytics:
GET    /analytics/dashboard
GET    /analytics/impact
GET    /analytics/reports
```

---

## 📱 QR Code Integration

### Workflow

1. **Generation**: Organizer creates campaign and generates QR codes
2. **Format**: `https://green-sprint.com/verify?id=CAMPAIGN_ID&qr=QR_HASH&tree=TREE_ID`
3. **Scanning**: User scans QR with phone camera via tree-tracker.html
4. **Registration**: System verifies QR, collects GPS, photo, and tree details
5. **Logging**: Scan recorded with timestamp, location, and user info
6. **Updates**: Campaign progress and impact metrics updated in real-time

### Libraries Used
```html
<!-- QR Generation -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<!-- QR Scanning -->
<script src="https://unpkg.com/html5-qrcode@2.1.47/dist/html5-qrcode.min.js"></script>
```

---

## 🚀 Installation & Setup

### Prerequisites
- Git
- Supabase account (free)
- Render account (free)
- Modern web browser with camera
- VS Code (recommended)

### Frontend Setup

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/Green_Spirt.git
cd Green_Spirt
```

2. **Configure Supabase**
   - Create project at supabase.com
   - Get Project URL and Anon Key
   - Update `js/supabase-client.js`:
   ```javascript
   const SUPABASE_URL = 'YOUR_URL';
   const SUPABASE_ANON_KEY = 'YOUR_KEY';
   ```

3. **Local Development**
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: VS Code Live Server
```

4. **Access**
```
http://localhost:8000
```

### Database Setup (Supabase)

1. Create project at supabase.com
2. Go to SQL Editor
3. Copy and execute all SQL from [Database Schema](#-database-schema)
4. Enable Real-time for all tables
5. Configure Authentication (Email/Password)
6. Create Storage bucket "tree-photos"

### Backend Setup (Python - Optional)

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install flask supabase python-dotenv requests pillow flask-cors
```

3. **Create requirements.txt**
```bash
pip freeze > requirements.txt
```

4. **Run Locally**
```bash
python app.py
# http://localhost:5000
```

5. **Deploy to Render**
   - Push to GitHub
   - Create new Web Service on render.com
   - Connect repository
   - Set environment variables
   - Deploy

---

## 🎮 Frontend JavaScript Examples

### **Supabase Client (js/supabase-client.js)**
```javascript
const SUPABASE_URL = 'YOUR_URL';
const SUPABASE_ANON_KEY = 'YOUR_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign Up
async function signUp(email, password, fullName) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  return { user, error };
}

// Login
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  return { data, error };
}

// Real-time Subscription
supabase.from('campaigns')
  .on('INSERT', payload => {
    console.log('New campaign:', payload.new);
    loadCampaigns();
  })
  .subscribe();
```

### **QR Scanner (js/qr-scanner.js)**
```javascript
const scanner = new Html5Qrcode('qr-reader');

async function startScanner() {
  await scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    onScanError
  );
}

function onScanSuccess(decodedText) {
  const url = new URL(decodedText);
  const treeId = url.searchParams.get('tree');
  registerTree(treeId);
  scanner.stop();
}

async function registerTree(treeId) {
  const location = await getLocation();
  const photoUrl = await uploadPhoto();
  
  const { error } = await supabase
    .from('trees')
    .update({ 
      verification_timestamp: new Date(),
      verified_by: currentUser.id 
    })
    .eq('id', treeId);
    
  if (!error) showSuccess('Tree registered!');
}
```

### **Analytics (js/analytics.js)**
```javascript
async function loadAnalytics() {
  const { data } = await supabase
    .from('environmental_impact')
    .select('*')
    .eq('campaign_id', currentCampaignId);

  if (data) createCharts(data[0]);
}

function createCharts(data) {
  const ctx = document.getElementById('co2Chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['CO₂ Sequestered', 'Target'],
      datasets: [{
        data: [data.total_co2_sequestered_kg, 100],
        backgroundColor: ['#46a758', '#e0e0e0']
      }]
    }
  });
}
```

---

## 📊 Environment Variables

### Frontend
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
VITE_API_BASE_URL=https://green-sprint-api.onrender.com/api/v1
VITE_BOTPRESS_ID=1c7bd4be-5b10-46ab-ae48-ccdf645365b9
```

### Backend (.env)
```env
FLASK_ENV=production
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1Ni...
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🔐 Security

- ✅ Client-side form validation
- ✅ HTTPS only
- ✅ No sensitive data in localStorage
- ✅ CSRF token handling
- ✅ Server-side validation
- ✅ Parameterized queries
- ✅ Row Level Security (RLS)
- ✅ Encryption at rest

---

## 🧪 Testing Checklist

- [ ] QR scanning on mobile
- [ ] Form validations
- [ ] Image uploads
- [ ] GPS/Location functionality
- [ ] Mobile responsiveness
- [ ] Browser compatibility
- [ ] Real-time updates
- [ ] Offline functionality

---

## 🛣️ Roadmap

**Phase 1: MVP** ✅
- User authentication
- Campaign management
- QR code scanning
- Basic analytics
- Gamification

**Phase 2: Enhancement** 🔄
- Mobile app (React Native)
- ML predictions
- Blockchain verification
- Donation integration

**Phase 3: Scale** 📋
- Internationalization
- Global partnerships
- IoT sensors
- Enterprise features

---

## 🤝 Contributing

```bash
# Fork & Clone
git clone https://github.com/yourusername/Green_Spirt.git

# Create Feature Branch
git checkout -b feature/amazing-feature

# Commit Changes
git commit -m "Add amazing feature"

# Push Branch
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👥 Contact & Support

**Project Lead:** Piyush Joshi
- 📧 Email: drigoon2512M@gmail.com
- 📱 Phone: +91 7588322212
- 🌐 Website: https://piyush-joshi1.github.io/Green_Spirt/

**Get Help:**
- 💬 Chatbot (24/7)
- 📧 Email support
- 🐛 GitHub Issues

---

## 🌍 Join the Green Revolution!

Together, we can create a greener planet. **Plant a tree today, inspire tomorrow!** 🌱

<div align="center">

**Made with 💚 for the environment**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=social&logo=github)](https://github.com/piyush-joshi1)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=social&logo=gmail)](mailto:drigoon2512M@gmail.com)

</div>
