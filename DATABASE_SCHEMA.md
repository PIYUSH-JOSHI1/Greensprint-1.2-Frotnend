# 🗄️ GREEN SPRINT - DATABASE SCHEMA DOCUMENTATION

**Comprehensive Supabase PostgreSQL Database Design**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
3. [Indexes](#indexes)
4. [Views](#views)
5. [Functions](#functions)
6. [Relationships](#relationships)
7. [Queries](#sample-queries)

---

## Overview

Green Sprint uses **Supabase** (PostgreSQL) as its primary database. The schema is designed for:
- Real-time updates via Supabase subscriptions
- Efficient querying with proper indexing
- Data integrity with foreign keys
- Scalability for millions of users and trees

### Database Naming Conventions
- **Tables**: snake_case, lowercase, plural (e.g., `users`, `campaigns`)
- **Columns**: snake_case, lowercase (e.g., `user_id`, `created_at`)
- **Indexes**: `idx_[table]_[column]` format
- **Views**: suffix with `_view` (e.g., `leaderboard_view`)

---

## Tables

### 1. USERS Table

Stores user profile information and authentication details.

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  
  -- Profile Information
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(255),
  phone VARCHAR(20),
  
  -- User Classification
  role VARCHAR(50) DEFAULT 'member',
  -- Roles: 'admin', 'organizer', 'member', 'donor'
  
  -- Statistics
  total_trees_planted INT DEFAULT 0,
  total_points INT DEFAULT 0,
  bio_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Constraints
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CHECK (total_trees_planted >= 0),
  CHECK (total_points >= 0)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active);
```

**Columns Description**:
- `id`: UUID (Universally Unique Identifier)
- `email`: Email address (unique, required)
- `username`: Handle/username (unique, required)
- `full_name`: User's real name (optional)
- `avatar_url`: Profile picture URL
- `bio`: Short biography
- `location`: Geographic location (city/state/country)
- `phone`: Contact phone number
- `role`: User type (determines permissions)
- `total_trees_planted`: Cumulative tree count (updated on each plant)
- `total_points`: Achievement points (gamification)
- `email_verified`: Email confirmation status
- `bio_verified`: Admin verification of user legitimacy
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp
- `last_login`: Most recent login time (for activity tracking)
- `is_active`: Account active status (soft delete)

---

### 2. CAMPAIGNS Table

Stores tree planting campaign information.

```sql
CREATE TABLE campaigns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Campaign Creator
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Campaign Details
  campaign_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Campaign Type
  objective VARCHAR(50) NOT NULL,
  -- Types: 'urban_forestry', 'reforestation', 'home_gardens', 'coastal_protection'
  
  -- Targets & Progress
  target_trees INT NOT NULL,
  trees_planted INT DEFAULT 0,
  
  -- Campaign Status
  status VARCHAR(50) DEFAULT 'active',
  -- Status: 'planning', 'active', 'paused', 'completed', 'archived'
  
  -- Visibility
  visibility VARCHAR(50) DEFAULT 'public',
  -- Visibility: 'public', 'private', 'community'
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Location
  location JSON, -- {latitude, longitude, address, region}
  
  -- Media
  campaign_image_url TEXT,
  
  -- Environmental Metrics
  total_co2_sequestered DECIMAL(10, 2) DEFAULT 0,
  total_water_saved DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (target_trees > 0),
  CHECK (trees_planted >= 0),
  CHECK (trees_planted <= target_trees * 1.2), -- Allow slight overage
  CHECK (end_date IS NULL OR end_date > start_date),
  CHECK (total_co2_sequestered >= 0),
  CHECK (total_water_saved >= 0)
);

-- Indexes
CREATE INDEX idx_campaigns_organizer ON campaigns(organizer_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_visibility ON campaigns(visibility);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
```

**Columns Description**:
- `id`: Unique campaign identifier
- `organizer_id`: Reference to campaign creator (user)
- `campaign_name`: Campaign title
- `description`: Detailed campaign information
- `objective`: Campaign type/category
- `target_trees`: Expected number of trees
- `trees_planted`: Current count of planted trees
- `status`: Campaign state (affects visibility/interactions)
- `visibility`: Who can see the campaign
- `start_date`: Campaign begin date
- `end_date`: Campaign end date (null = ongoing)
- `location`: JSON with geo coordinates and address
- `campaign_image_url`: Campaign banner/logo
- `total_co2_sequestered`: Sum of all tree CO₂ absorption
- `total_water_saved`: Sum of all tree water conservation
- `created_at`: Campaign creation timestamp
- `updated_at`: Last modification timestamp

---

### 3. TREES Table

Stores individual tree records and planting details.

```sql
CREATE TABLE trees (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  species_id UUID NOT NULL REFERENCES tree_species(id),
  planter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- QR Code Association
  qr_code_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Location Data
  location JSON NOT NULL,
  -- Structure: {latitude, longitude, address, landmark, planting_address}
  
  -- Planting Information
  planting_date DATE NOT NULL,
  photo_url TEXT,
  
  -- Tree Health
  health_status VARCHAR(50) DEFAULT 'healthy',
  -- Status: 'healthy', 'struggling', 'diseased', 'dead'
  
  height_cm DECIMAL(6, 2),
  survival_status BOOLEAN DEFAULT TRUE,
  estimated_age_years DECIMAL(5, 2),
  
  -- Environmental Impact
  co2_sequestered_kg DECIMAL(8, 2) DEFAULT 0,
  water_saved_liters DECIMAL(10, 2) DEFAULT 0,
  
  -- Maintenance & Verification
  maintenance_notes TEXT,
  verification_timestamp TIMESTAMP,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (height_cm >= 0),
  CHECK (estimated_age_years >= 0),
  CHECK (co2_sequestered_kg >= 0),
  CHECK (water_saved_liters >= 0),
  CHECK (planting_date <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_trees_campaign ON trees(campaign_id);
CREATE INDEX idx_trees_species ON trees(species_id);
CREATE INDEX idx_trees_planter ON trees(planter_id);
CREATE INDEX idx_trees_qr_code ON trees(qr_code_id);
CREATE INDEX idx_trees_health_status ON trees(health_status);
CREATE INDEX idx_trees_created_at ON trees(created_at);
CREATE INDEX idx_trees_location ON trees USING GiST(location::geometry); -- Geospatial
```

**Columns Description**:
- `id`: Unique tree identifier
- `campaign_id`: Parent campaign
- `species_id`: Tree species reference
- `planter_id`: User who planted the tree
- `qr_code_id`: Associated QR code
- `location`: JSON with GPS coordinates
- `planting_date`: When tree was planted
- `photo_url`: Evidence photo of planted tree
- `health_status`: Current tree condition
- `height_cm`: Tree height in centimeters
- `survival_status`: Whether tree is alive
- `estimated_age_years`: Tree age calculation
- `co2_sequestered_kg`: Carbon sequestration (per year × age)
- `water_saved_liters`: Water absorption contribution
- `maintenance_notes`: Care log entries
- `verification_timestamp`: When verified by admin
- `verified_by`: Admin who verified

---

### 4. TREE_SPECIES Table

Reference table for tree species information.

```sql
CREATE TABLE tree_species (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identification
  common_name VARCHAR(100) NOT NULL,
  scientific_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Characteristics
  native_region VARCHAR(255),
  height_m DECIMAL(6, 2),
  maturity_years INT,
  lifespan_years INT,
  
  -- Environmental Benefits
  annual_co2_absorption_kg DECIMAL(8, 2),
  annual_water_absorption_liters DECIMAL(10, 2),
  biodiversity_score INT, -- 1-10 scale
  
  -- Growing Information
  difficulty_level VARCHAR(20),
  -- Levels: 'easy', 'medium', 'hard'
  
  ideal_season VARCHAR(50),
  -- Example: 'spring', 'monsoon', 'all-year'
  
  -- Care & Management
  care_instructions TEXT,
  disease_susceptibility JSONB,
  -- Example: {"leaf_spot": "high", "root_rot": "medium"}
  
  -- Media
  image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (height_m > 0),
  CHECK (maturity_years > 0),
  CHECK (lifespan_years > 0),
  CHECK (annual_co2_absorption_kg > 0),
  CHECK (biodiversity_score >= 1 AND biodiversity_score <= 10)
);

-- Indexes
CREATE INDEX idx_species_common_name ON tree_species(common_name);
CREATE INDEX idx_species_scientific_name ON tree_species(scientific_name);
CREATE INDEX idx_species_difficulty ON tree_species(difficulty_level);
CREATE INDEX idx_species_season ON tree_species(ideal_season);
```

**Columns Description**:
- `common_name`: Local/common name (e.g., "Mango", "Oak")
- `scientific_name`: Botanical name (e.g., "Mangifera indica")
- `description`: Detailed species information
- `native_region`: Geographic origin
- `height_m`: Maximum mature height
- `maturity_years`: Years to reach maturity
- `lifespan_years`: Expected lifespan
- `annual_co2_absorption_kg`: CO₂ sequestration per year
- `annual_water_absorption_liters`: Water uptake per year
- `biodiversity_score`: Ecological value (1-10)
- `difficulty_level`: Ease of growing
- `ideal_season`: Best time to plant
- `care_instructions`: Growing guide
- `disease_susceptibility`: Known diseases and severity
- `image_url`: Tree species photo

---

### 5. QR_CODES Table

Manages QR code generation and scanning history.

```sql
CREATE TABLE qr_codes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Unique Identifier
  qr_code_unique_id VARCHAR(100) UNIQUE NOT NULL,
  -- Format: CAMPAIGN_ID-TIMESTAMP-RANDOM
  
  -- Media
  qr_image_url TEXT,
  
  -- Associations
  tree_id UUID REFERENCES trees(id) ON DELETE SET NULL,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'unused',
  -- Status: 'unused', 'assigned', 'scanned', 'verified'
  
  -- Tracking
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_scan_timestamp TIMESTAMP,
  scan_count INT DEFAULT 0,
  
  -- Scan History (JSON Array)
  scan_history JSONB[] DEFAULT ARRAY[]::JSONB[],
  -- Example: [
  --   {
  --     "timestamp": "2024-02-01T10:30:00Z",
  --     "user_id": "uuid",
  --     "location": {
  --       "latitude": 28.7041,
  --       "longitude": 77.1025
  --     },
  --     "device": "mobile",
  --     "app_version": "1.0"
  --   }
  -- ]
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (scan_count >= 0),
  CHECK (first_scan_timestamp IS NULL OR first_scan_timestamp >= generated_at)
);

-- Indexes
CREATE INDEX idx_qr_codes_unique_id ON qr_codes(qr_code_unique_id);
CREATE INDEX idx_qr_codes_campaign ON qr_codes(campaign_id);
CREATE INDEX idx_qr_codes_tree ON qr_codes(tree_id);
CREATE INDEX idx_qr_codes_status ON qr_codes(status);
CREATE INDEX idx_qr_codes_generated_at ON qr_codes(generated_at);
```

**Columns Description**:
- `qr_code_unique_id`: Unique code for verification
- `qr_image_url`: URL to QR code image
- `tree_id`: Associated tree (NULL until tree planted)
- `campaign_id`: Campaign this QR belongs to
- `status`: Lifecycle status
- `generated_at`: QR code creation time
- `first_scan_timestamp`: When first scanned
- `scan_count`: Number of times scanned
- `scan_history`: Array of all scans with details

---

### 6. USER_ACHIEVEMENTS Table

Tracks user badges and achievements.

```sql
CREATE TABLE user_achievements (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User Reference
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Achievement Details
  achievement_type VARCHAR(100) NOT NULL,
  -- Types: 'planter', 'conservationist', 'champion', 'guardian', 'leader'
  
  achievement_name VARCHAR(255) NOT NULL,
  -- Examples: 'Seedling Planter', 'Carbon Offset Hero'
  
  description TEXT,
  badge_icon_url TEXT,
  
  -- Milestone
  milestone_value INT,
  -- Example: milestone_value=10 means "planted 10 trees"
  
  -- Timestamps
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (milestone_value > 0)
);

-- Indexes
CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_achievements_earned_at ON user_achievements(earned_at);

-- Unique constraint to prevent duplicate achievements
CREATE UNIQUE INDEX idx_achievements_unique ON user_achievements(user_id, achievement_type, milestone_value);
```

**Columns Description**:
- `user_id`: User earning the achievement
- `achievement_type`: Category of achievement
- `achievement_name`: Display name
- `description`: Achievement description
- `badge_icon_url`: Badge image
- `milestone_value`: Associated milestone
- `earned_at`: When earned

---

### 7. ENVIRONMENTAL_IMPACT Table

Aggregated environmental metrics per campaign.

```sql
CREATE TABLE environmental_impact (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Campaign Reference
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Metrics
  total_trees_planted INT DEFAULT 0,
  total_co2_sequestered_kg DECIMAL(15, 2) DEFAULT 0,
  total_water_saved_liters DECIMAL(15, 2) DEFAULT 0,
  
  -- Advanced Metrics
  estimated_biodiversity_improvement DECIMAL(8, 2) DEFAULT 0,
  -- Percentage improvement in local biodiversity
  
  average_tree_health_score DECIMAL(3, 2),
  -- Average health status (1-10)
  
  -- Reporting
  report_date DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (total_trees_planted >= 0),
  CHECK (total_co2_sequestered_kg >= 0),
  CHECK (total_water_saved_liters >= 0),
  CHECK (estimated_biodiversity_improvement >= 0),
  CHECK (average_tree_health_score >= 0 AND average_tree_health_score <= 10)
);

-- Indexes
CREATE INDEX idx_impact_campaign ON environmental_impact(campaign_id);
CREATE INDEX idx_impact_report_date ON environmental_impact(report_date);
CREATE UNIQUE INDEX idx_impact_unique ON environmental_impact(campaign_id, report_date);
-- Ensures one report per day per campaign
```

**Columns Description**:
- `campaign_id`: Associated campaign
- `total_trees_planted`: Cumulative count
- `total_co2_sequestered_kg`: Total CO₂ absorbed
- `total_water_saved_liters`: Total water saved
- `estimated_biodiversity_improvement`: Ecological benefit
- `average_tree_health_score`: Health average
- `report_date`: Report date (daily rollup)

---

### 8. PHOTOS Table

Stores tree planting evidence photos.

```sql
CREATE TABLE photos (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Media
  image_url TEXT NOT NULL,
  caption TEXT,
  
  -- Classification
  is_cover_photo BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_photos_tree ON photos(tree_id);
CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);

-- Only one cover photo per tree
CREATE UNIQUE INDEX idx_photos_cover ON photos(tree_id) WHERE is_cover_photo = TRUE;
```

**Columns Description**:
- `tree_id`: Associated tree
- `user_id`: Photo uploader
- `image_url`: Photo URL in storage
- `caption`: Photo description
- `is_cover_photo`: Whether it's main photo
- `uploaded_at`: Upload timestamp

---

### 9. CAMPAIGN_PARTICIPANTS Table

Tracks user participation in campaigns.

```sql
CREATE TABLE campaign_participants (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role in Campaign
  role VARCHAR(50) DEFAULT 'participant',
  -- Roles: 'organizer', 'volunteer', 'donor', 'participant'
  
  -- Contribution Metrics
  trees_planted INT DEFAULT 0,
  hours_contributed DECIMAL(8, 2) DEFAULT 0,
  donation_amount DECIMAL(10, 2),
  
  -- Participation
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (trees_planted >= 0),
  CHECK (hours_contributed >= 0),
  CHECK (donation_amount IS NULL OR donation_amount > 0),
  UNIQUE(campaign_id, user_id)
  -- Prevent duplicate participants
);

-- Indexes
CREATE INDEX idx_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX idx_participants_user ON campaign_participants(user_id);
CREATE INDEX idx_participants_role ON campaign_participants(role);
CREATE INDEX idx_participants_joined_at ON campaign_participants(joined_at);
```

**Columns Description**:
- `campaign_id`: Campaign membership
- `user_id`: Participant user
- `role`: Participant type
- `trees_planted`: Contribution count
- `hours_contributed`: Volunteer hours
- `donation_amount`: Financial contribution
- `joined_at`: Participation start date

---

## Indexes

### Index Strategy

Indexes are created on:
1. **Foreign Keys**: For JOIN operations
2. **Frequently Searched Columns**: email, username, status
3. **Timestamp Columns**: For time-range queries
4. **Unique Columns**: For uniqueness enforcement

### Performance Optimization

```sql
-- Geospatial Index (Tree Location Search)
CREATE INDEX idx_trees_location_gist ON trees USING GiST(location::geometry);

-- Text Search Index (Campaign Search)
CREATE INDEX idx_campaigns_search ON campaigns 
USING GIN (to_tsvector('english', campaign_name || ' ' || description));

-- Partial Indexes (Active Campaigns Only)
CREATE INDEX idx_campaigns_active ON campaigns(id) 
WHERE status = 'active';

CREATE INDEX idx_users_active ON users(id) 
WHERE is_active = TRUE;
```

---

## Views

### 1. LEADERBOARD_VIEW

Real-time user rankings by trees planted.

```sql
CREATE VIEW leaderboard_view AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  u.location,
  COUNT(DISTINCT t.id) as total_trees,
  SUM(t.co2_sequestered_kg) as total_co2,
  u.total_points,
  ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT t.id) DESC) as global_rank,
  ROW_NUMBER() OVER (PARTITION BY u.location ORDER BY COUNT(DISTINCT t.id) DESC) as regional_rank,
  ROUND(SUM(t.co2_sequestered_kg)::numeric, 2) as co2_rounded,
  ROUND(SUM(t.water_saved_liters)::numeric, 0) as water_saved_rounded
FROM users u
LEFT JOIN trees t ON u.id = t.planter_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.avatar_url, u.location, u.total_points
ORDER BY global_rank;
```

**Usage**:
```javascript
// Fetch global leaderboard
const { data } = await supabase
  .from('leaderboard_view')
  .select('*')
  .limit(100);
```

---

### 2. CAMPAIGN_PROGRESS_VIEW

Real-time campaign progress tracking.

```sql
CREATE VIEW campaign_progress_view AS
SELECT 
  c.id,
  c.campaign_name,
  c.target_trees,
  c.trees_planted,
  ROUND((c.trees_planted::numeric / c.target_trees * 100)::numeric, 2) as progress_percentage,
  (c.target_trees - c.trees_planted) as remaining_trees,
  EXTRACT(DAY FROM c.end_date - CURRENT_DATE) as days_remaining,
  c.total_co2_sequestered,
  c.total_water_saved,
  COUNT(DISTINCT cp.user_id) as participant_count,
  c.status,
  c.visibility,
  u.username as organizer_name
FROM campaigns c
LEFT JOIN campaign_participants cp ON c.id = cp.campaign_id
LEFT JOIN users u ON c.organizer_id = u.id
GROUP BY c.id, u.username
ORDER BY c.created_at DESC;
```

---

### 3. USER_STATS_VIEW

Comprehensive user statistics.

```sql
CREATE VIEW user_stats_view AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  COUNT(DISTINCT t.id) as total_trees_planted,
  SUM(t.co2_sequestered_kg) as total_co2_sequestered,
  SUM(t.water_saved_liters) as total_water_saved,
  COUNT(DISTINCT c.id) as campaigns_participated,
  COUNT(DISTINCT ua.id) as achievements_earned,
  u.total_points,
  u.created_at as member_since,
  u.last_login,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - u.created_at) as days_active
FROM users u
LEFT JOIN trees t ON u.id = t.planter_id
LEFT JOIN campaign_participants cp ON u.id = cp.user_id
LEFT JOIN campaigns c ON cp.campaign_id = c.id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;
```

---

## Functions

### 1. Trigger Function: Update Campaign Progress

```sql
CREATE OR REPLACE FUNCTION update_campaign_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET 
    trees_planted = (SELECT COUNT(*) FROM trees WHERE campaign_id = NEW.campaign_id),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_campaign_progress
AFTER INSERT ON trees
FOR EACH ROW
EXECUTE FUNCTION update_campaign_progress();
```

### 2. Trigger Function: Calculate Environmental Impact

```sql
CREATE OR REPLACE FUNCTION calculate_environmental_impact()
RETURNS TRIGGER AS $$
DECLARE
  species_co2 DECIMAL;
  species_water DECIMAL;
BEGIN
  -- Get species data
  SELECT annual_co2_absorption_kg, annual_water_absorption_liters 
  INTO species_co2, species_water
  FROM tree_species 
  WHERE id = NEW.species_id;
  
  -- Calculate based on age
  NEW.co2_sequestered_kg = species_co2 * EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.planting_date));
  NEW.water_saved_liters = species_water * EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.planting_date));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_calculate_impact
BEFORE INSERT OR UPDATE ON trees
FOR EACH ROW
EXECUTE FUNCTION calculate_environmental_impact();
```

### 3. Function: Award Achievement

```sql
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id UUID,
  p_achievement_type VARCHAR,
  p_achievement_name VARCHAR,
  p_milestone_value INT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_achievements (user_id, achievement_type, achievement_name, milestone_value)
  VALUES (p_user_id, p_achievement_type, p_achievement_name, p_milestone_value)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

---

## Relationships

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      USERS                               │
│  (id, email, username, avatar, bio, total_trees, points)│
└───────────────┬──────────────────────────────────────────┘
                │
     ┌──────────┴──────────┬─────────────────┐
     │                     │                 │
     │ organizer_id        │ planter_id      │ user_id
     │                     │                 │
     ▼                     ▼                 ▼
┌─────────────┐      ┌──────────┐      ┌────────────────┐
│ CAMPAIGNS   │      │  TREES   │      │    PHOTOS      │
└─────────────┘      └──────────┘      └────────────────┘
     │                     │                 │
     │ campaign_id         │                 │ tree_id
     │                     │ species_id      │
     ├─────────┬───────────┘                 │
     │         │                             │
     │         ▼                             │
     │    ┌──────────────┐                   │
     │    │ TREE_SPECIES │                   │
     │    └──────────────┘                   │
     │
     ├─ campaign_id
     │
     ▼
┌─────────────────────────┐
│ CAMPAIGN_PARTICIPANTS   │
│ (many-to-many)          │
└─────────────────────────┘
     │
     ├─ campaign_id
     │
     ├─ user_id ──────────────────────────┐
     │                                     │
     ├──────────────────────────────────┐  │
     │                                  │  │
     ▼                                  ▼  ▼
┌──────────────────┐             ┌────────────┐
│  QR_CODES        │             │ USER_ACHIEVEMENTS
│                  │             └────────────┘
│ • qr_code_id     │
│ • campaign_id    │
│ • tree_id        │
│ • status         │
│ • scan_history   │
└──────────────────┘


CAMPAIGN ──has many──> TREES
CAMPAIGN ──has many──> QR_CODES
CAMPAIGN ──has many──> ENVIRONMENTAL_IMPACT
CAMPAIGN ──has many──> CAMPAIGN_PARTICIPANTS

TREE ──has one──> TREE_SPECIES
TREE ──has one──> QR_CODE
TREE ──has many──> PHOTOS

USER ──has many──> CAMPAIGN_PARTICIPANTS
USER ──has many──> TREES (as planter)
USER ──has many──> PHOTOS
USER ──has many──> USER_ACHIEVEMENTS
USER ──has many──> CAMPAIGNS (as organizer)
```

---

## Sample Queries

### 1. Get Top 10 Global Users by Trees Planted

```sql
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  COUNT(DISTINCT t.id) as trees_count,
  SUM(t.co2_sequestered_kg) as total_co2,
  ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT t.id) DESC) as rank
FROM users u
LEFT JOIN trees t ON u.id = t.planter_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.avatar_url
ORDER BY trees_count DESC
LIMIT 10;
```

---

### 2. Get Campaign Progress with All Metrics

```sql
SELECT 
  c.id,
  c.campaign_name,
  c.target_trees,
  c.trees_planted,
  ROUND((c.trees_planted::numeric / c.target_trees * 100)::numeric, 2) as progress_percent,
  c.total_co2_sequestered,
  c.total_water_saved,
  (SELECT COUNT(*) FROM campaign_participants WHERE campaign_id = c.id) as participant_count,
  (SELECT MAX(created_at) FROM trees WHERE campaign_id = c.id) as last_tree_planted,
  c.status,
  EXTRACT(DAY FROM c.end_date - CURRENT_DATE) as days_remaining
FROM campaigns c
WHERE c.visibility = 'public'
ORDER BY c.trees_planted DESC;
```

---

### 3. Get User's Campaign Contribution

```sql
SELECT 
  u.username,
  c.campaign_name,
  cp.role,
  cp.trees_planted,
  cp.hours_contributed,
  cp.donation_amount,
  COUNT(DISTINCT t.id) as trees_verified,
  SUM(t.co2_sequestered_kg) as co2_saved,
  cp.joined_at
FROM users u
JOIN campaign_participants cp ON u.id = cp.user_id
JOIN campaigns c ON cp.campaign_id = c.id
LEFT JOIN trees t ON c.id = t.campaign_id AND t.planter_id = u.id
WHERE u.id = '{{user_id}}'
GROUP BY u.id, u.username, c.id, c.campaign_name, cp.role, cp.trees_planted, cp.hours_contributed, cp.donation_amount, cp.joined_at
ORDER BY cp.joined_at DESC;
```

---

### 4. Get Unverified Trees (QA)

```sql
SELECT 
  t.id,
  t.qr_code_id,
  c.campaign_name,
  u.username as planter_name,
  ts.common_name as tree_species,
  t.planting_date,
  t.photo_url,
  t.location ->> 'address' as location_address,
  t.created_at
FROM trees t
JOIN campaigns c ON t.campaign_id = c.id
JOIN users u ON t.planter_id = u.id
JOIN tree_species ts ON t.species_id = ts.id
WHERE t.verified_by IS NULL
  AND t.created_at > NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC;
```

---

### 5. Monthly Environmental Impact Report

```sql
SELECT 
  DATE_TRUNC('month', t.created_at)::DATE as month,
  COUNT(DISTINCT t.id) as trees_planted_monthly,
  SUM(t.co2_sequestered_kg) as co2_monthly,
  SUM(t.water_saved_liters) as water_monthly,
  COUNT(DISTINCT t.planter_id) as unique_planters,
  COUNT(DISTINCT t.campaign_id) as active_campaigns
FROM trees t
WHERE t.verified_by IS NOT NULL
GROUP BY DATE_TRUNC('month', t.created_at)
ORDER BY month DESC;
```

---

### 6. User Achievement Progress

```sql
SELECT 
  u.username,
  COALESCE(COUNT(DISTINCT t.id), 0) as trees_planted,
  CASE 
    WHEN COUNT(DISTINCT t.id) >= 500 THEN 'Environmental Champion'
    WHEN COUNT(DISTINCT t.id) >= 100 THEN 'Forest Creator'
    WHEN COUNT(DISTINCT t.id) >= 25 THEN 'Green Guardian'
    WHEN COUNT(DISTINCT t.id) >= 1 THEN 'Seedling Planter'
    ELSE 'New Member'
  END as current_achievement,
  u.total_points,
  COUNT(DISTINCT ua.id) as badges_earned
FROM users u
LEFT JOIN trees t ON u.id = t.planter_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.total_points;
```

---

## Optimization Tips

1. **Regularly Vacuum**: Supabase auto-vacuums, but monitor `pg_stat_user_tables`
2. **Monitor Query Performance**: Use `EXPLAIN ANALYZE`
3. **Archive Old Data**: Move completed campaigns to archive table after 1 year
4. **Update Statistics**: Supabase auto-analyzes, but consider `ANALYZE` after bulk inserts
5. **Use Connection Pooling**: For multiple concurrent connections
6. **Implement Read Replicas**: For analytics queries (advanced feature)

---

## Backup & Recovery

Supabase automatically:
- ✅ Backs up data daily
- ✅ Retains backups for 7 days (paid) / 1 day (free)
- ✅ Point-in-time recovery available
- ✅ Automated replication for high availability

**Manual Backup**:
```sql
-- Export data as CSV
COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;

-- Or use pg_dump utility
pg_dump --username=postgres postgresql://user:password@host/green_sprint > backup.sql
```

---

## Security Considerations

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY users_view_own
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY users_update_own
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### Data Encryption

- ✅ HTTPS for all connections
- ✅ Passwords hashed with bcrypt
- ✅ Sensitive data encrypted at rest (Supabase)
- ✅ Never store secrets in code

---

## Conclusion

This database schema is designed to:
- ✅ Support millions of trees and users
- ✅ Provide real-time updates
- ✅ Enable complex analytics queries
- ✅ Maintain data integrity
- ✅ Scale horizontally with Supabase

For questions or schema updates, contact: **drigoon2512M@gmail.com**

**Version**: 1.0 | **Last Updated**: February 2026
