/**
 * Green Sprint - Dashboard Module
 * Main dashboard functionality and data visualization
 */

const DashboardModule = {
    charts: {},
    stats: {},

    // Initialize dashboard
    async init() {
        if (!AuthService.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadUserStats();
        await this.loadGlobalStats();
        await this.loadRecentActivity();
        await this.loadUserCampaigns();
        await this.loadUserTrees();
        this.initCharts();
        this.initRealtime();
    },

    // Load user statistics
    async loadUserStats() {
        try {
            const profile = AuthService.getProfile();
            const userId = AuthService.getUser()?.id;
            
            // Get actual tree count from database
            let treesPlanted = 0;
            if (userId) {
                try {
                    const userTrees = await GreenSprintDB.trees.getByUser(userId);
                    treesPlanted = userTrees?.length || 0;
                } catch (e) {
                    console.warn('Could not fetch trees:', e);
                    // Fallback to profile data
                    treesPlanted = profile?.trees_planted || profile?.total_trees_planted || 0;
                }
            }
            
            const totalPoints = profile?.total_points || 0;
            
            // Update UI
            document.getElementById('user-name').textContent = profile?.full_name || profile?.username || 'User';
            document.getElementById('user-avatar').src = profile?.avatar_url || 'assets/images/default-avatar.png';
            document.getElementById('trees-planted').textContent = treesPlanted;
            document.getElementById('total-points').textContent = this.formatNumber(totalPoints);
            
            // Calculate environmental impact based on actual tree count
            const impact = this.calculateImpact(treesPlanted);
            document.getElementById('co2-saved').textContent = this.formatNumber(impact.co2) + ' kg';
            document.getElementById('water-saved').textContent = this.formatNumber(impact.water) + ' L';
            document.getElementById('oxygen-produced').textContent = this.formatNumber(impact.oxygen) + ' kg';

            // Update trend messages based on actual data
            this.updateTrendMessages(treesPlanted, totalPoints, impact);

            // Load and display badges
            await this.loadUserBadges();

        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    },

    // Update trend messages dynamically
    updateTrendMessages(treesPlanted, totalPoints, impact) {
        const treesTrend = document.getElementById('trees-trend');
        const co2Trend = document.getElementById('co2-trend');
        const waterTrend = document.getElementById('water-trend');
        const pointsTrend = document.getElementById('points-trend');

        if (treesPlanted === 0) {
            // No trees planted yet - show encouraging messages
            if (treesTrend) treesTrend.innerHTML = '<i class="fa fa-seedling"></i> <span>Plant your first tree!</span>';
            if (co2Trend) co2Trend.innerHTML = '<i class="fa fa-info-circle"></i> <span>~22 kg per tree/year</span>';
            if (waterTrend) waterTrend.innerHTML = '<i class="fa fa-info-circle"></i> <span>~378 L per tree/year</span>';
        } else if (treesPlanted === 1) {
            // First tree planted - celebrate!
            if (treesTrend) treesTrend.innerHTML = '<i class="fa fa-check-circle"></i> <span>Great start! 🎉</span>';
            if (co2Trend) co2Trend.innerHTML = '<i class="fa fa-leaf"></i> <span>Your first impact!</span>';
            if (waterTrend) waterTrend.innerHTML = '<i class="fa fa-tint"></i> <span>Making a difference!</span>';
        } else {
            // Multiple trees - show progress
            if (treesTrend) treesTrend.innerHTML = `<i class="fa fa-arrow-up"></i> <span>${treesPlanted} trees strong!</span>`;
            if (co2Trend) co2Trend.innerHTML = `<i class="fa fa-leaf"></i> <span>${impact.co2} kg absorbed/year</span>`;
            if (waterTrend) waterTrend.innerHTML = `<i class="fa fa-tint"></i> <span>${impact.water} L filtered/year</span>`;
        }

        // Points trend
        if (pointsTrend) {
            if (totalPoints === 0) {
                pointsTrend.innerHTML = '<i class="fa fa-star"></i> <span>Earn points by planting!</span>';
            } else if (totalPoints < 100) {
                pointsTrend.innerHTML = '<i class="fa fa-fire"></i> <span>Good start!</span>';
            } else if (totalPoints < 500) {
                pointsTrend.innerHTML = '<i class="fa fa-fire"></i> <span>Growing fast!</span>';
            } else {
                pointsTrend.innerHTML = '<i class="fa fa-trophy"></i> <span>Eco Champion!</span>';
            }
        }
    },

    // Load global statistics
    async loadGlobalStats() {
        try {
            const stats = await GreenSprintDB.analytics.getGlobalStats();
            
            document.getElementById('global-trees').textContent = this.formatNumber(stats.totalTrees);
            document.getElementById('global-users').textContent = this.formatNumber(stats.totalUsers);
            document.getElementById('global-co2').textContent = this.formatNumber(stats.totalCO2) + ' kg';
            document.getElementById('active-campaigns').textContent = stats.activeCampaigns;

            this.stats.global = stats;
        } catch (error) {
            console.error('Failed to load global stats:', error);
        }
    },

    // Load user's badges from profile.badges JSON column
    async loadUserBadges() {
        const container = document.getElementById('user-badges');
        if (!container) return;

        try {
            const userId = AuthService.getUser()?.id;
            if (!userId) return;

            // Fetch fresh profile from DB to get latest badges array
            let badges = [];
            try {
                const sb = GreenSprintDB.supabase();
                if (sb) {
                    const { data } = await sb
                        .from('user_profiles')
                        .select('badges')
                        .eq('id', userId)
                        .maybeSingle();
                    badges = data?.badges || [];
                }
            } catch (_) {
                // Fallback to cached profile
                badges = AuthService.getProfile()?.badges || [];
            }

            // Badge catalog (copy of community.html ALL_BADGES)
            const BADGE_MAP = {
                seedling:        { emoji: '🌱', name: 'Seedling' },
                sapling:         { emoji: '🌿', name: 'Sapling Scout' },
                tree_hugger:     { emoji: '🌳', name: 'Tree Hugger' },
                forest_guardian: { emoji: '🏕️', name: 'Forest Guardian' },
                eco_warrior:     { emoji: '⚔️',  name: 'Eco Warrior' },
                nature_champion: { emoji: '🏅', name: 'Nature Champion' },
                earth_protector: { emoji: '🌍', name: 'Earth Protector' },
                climate_hero:    { emoji: '🦸', name: 'Climate Hero' },
                ambassador:      { emoji: '💠', name: 'Green Ambassador' },
                campaign_leader: { emoji: '📻', name: 'Campaign Leader' },
                century:         { emoji: '💥', name: 'Century Planter' },
                legend:          { emoji: '👑', name: 'Green Legend' },
                // Legacy/other IDs from achievements table
                first_tree:      { emoji: '🌱', name: 'First Tree' },
                five_trees:      { emoji: '🌿', name: 'Grove Starter' },
                ten_trees:       { emoji: '🌳', name: 'Forest Friend' },
                twentyfive_trees:{ emoji: '🏆', name: 'Tree Champion' },
                fifty_trees:     { emoji: '🦸', name: 'Eco Warrior' },
                hundred_trees:   { emoji: '👑', name: 'Forest Guardian' },
            };

            if (!badges || badges.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center;padding:30px 10px;">
                        <div style="font-size:2.5rem;margin-bottom:12px;">🌱</div>
                        <p style="color:#888;font-size:14px;margin:0 0 12px;">No badges yet — plant your first tree to start earning!</p>
                        <a href="tree-tracker.html" class="btn btn-primary" style="font-size:13px;padding:8px 20px;">
                            <i class="fa fa-tree"></i> Plant a Tree
                        </a>
                    </div>`;
                return;
            }

            // Render unlocked badges as rich cards
            container.innerHTML = `
                <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;">
                    ${badges.map(id => {
                        const b = BADGE_MAP[id] || { emoji: '🏆', name: id.replace(/_/g,' ') };
                        return `
                            <div title="${b.name}" style="
                                display:flex;flex-direction:column;align-items:center;
                                background:linear-gradient(135deg,#f0fff4,#e8f5e9);
                                border:2px solid #a5d6a7;border-radius:14px;
                                padding:14px 10px;min-width:80px;max-width:100px;
                                text-align:center;cursor:default;
                                box-shadow:0 2px 8px rgba(45,90,39,0.1);
                                transition:transform 0.2s;
                            " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
                                <div style="font-size:1.9rem;margin-bottom:6px;">${b.emoji}</div>
                                <div style="font-size:11px;font-weight:700;color:#2d5a27;line-height:1.2;">${b.name}</div>
                                <div style="font-size:10px;color:#4a9c3f;margin-top:4px;">✔ Earned</div>
                            </div>`;
                    }).join('')}
                </div>
                <div style="margin-top:14px;font-size:13px;color:#666;">
                    🏅 <strong>${badges.length}</strong> badge${badges.length !== 1 ? 's' : ''} earned
                    &nbsp;·&nbsp;
                    <a href="community.html" onclick="localStorage.setItem('openTab','achievements')" 
                       style="color:#2d5a27;font-weight:600;">View all badges →</a>
                </div>`;

        } catch (error) {
            console.error('Failed to load badges:', error);
            const container2 = document.getElementById('user-badges');
            if (container2) container2.innerHTML = '<p class="no-badges" style="color:#888;">Could not load badges.</p>';
        }
    },


    // Load recent activity
    async loadRecentActivity() {
        try {
            const trees = await GreenSprintDB.trees.getByUser(AuthService.getUser().id);
            const recentTrees = trees.slice(0, 5);

            const container = document.getElementById('recent-activity');
            if (!container) return;

            if (recentTrees.length === 0) {
                container.innerHTML = `
                    <div class="no-activity">
                        <i class="fa fa-tree"></i>
                        <p>No trees planted yet. Start your journey!</p>
                        <a href="tree-tracker.html" class="btn btn-primary">Plant a Tree</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = recentTrees.map(tree => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fa fa-leaf"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${tree.species?.common_name || 'Tree'} planted</h4>
                        <p>${tree.campaign?.campaign_name || 'Personal planting'}</p>
                        <span class="activity-date">${this.formatDate(tree.created_at)}</span>
                    </div>
                    <div class="activity-points">+${CONFIG.POINTS.TREE_PLANTED} pts</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    },

    // Load user campaigns
    async loadUserCampaigns() {
        try {
            const campaigns = await GreenSprintDB.campaigns.getUserCampaigns(
                AuthService.getUser().id
            );

            const container = document.getElementById('my-campaigns');
            if (!container) return;

            if (campaigns.length === 0) {
                container.innerHTML = `
                    <div class="no-campaigns">
                        <i class="fa fa-bullhorn"></i>
                        <p>You haven't created any campaigns yet.</p>
                        <a href="campaigns.html#create" class="btn btn-secondary">Create Campaign</a>
                    </div>
                `;
                return;
            }

            container.innerHTML = campaigns.map(c => `
                <div class="campaign-card mini" onclick="window.location.href='campaign-details.html?id=${c.id}'">
                    <div class="campaign-progress">
                        <div class="progress-bar" style="width: ${(c.trees_planted / c.target_trees * 100)}%"></div>
                    </div>
                    <h4>${c.campaign_name}</h4>
                    <div class="campaign-stats">
                        <span><i class="fa fa-tree"></i> ${c.trees_planted}/${c.target_trees}</span>
                        <span class="status ${c.status}">${c.status}</span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    },

    // Load user trees
    async loadUserTrees() {
        try {
            const trees = await GreenSprintDB.trees.getByUser(AuthService.getUser().id);

            const container = document.getElementById('my-trees-list');
            if (!container) return;

            if (trees.length === 0) {
                container.innerHTML = `
                    <div class="no-trees">
                        <i class="fa fa-seedling"></i>
                        <p>Your tree collection is empty.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = trees.slice(0, 8).map(tree => `
                <div class="tree-card" onclick="DashboardModule.showTreeDetails('${tree.id}')">
                    <div class="tree-image">
                        <img src="${tree.photo_url || 'assets/images/default-tree.jpg'}" alt="Tree">
                        <span class="health-status ${tree.health_status}">${tree.health_status}</span>
                    </div>
                    <div class="tree-info">
                        <h4>${tree.species?.common_name || 'Tree'}</h4>
                        <p>Planted: ${this.formatDate(tree.planting_date)}</p>
                        <div class="tree-impact">
                            <span><i class="fa fa-cloud"></i> ${tree.co2_sequestered_kg || 0} kg CO₂</span>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load trees:', error);
        }
    },

    // Initialize charts
    initCharts() {
        this.initTreesChart();
        this.initImpactChart();
        this.initSpeciesChart();
    },

    // Trees over time chart
    async initTreesChart() {
        const ctx = document.getElementById('trees-chart');
        if (!ctx) return;

        try {
            const userId = AuthService.getUser()?.id;
            const data = await GreenSprintDB.analytics.getTreesOverTime(30, userId);
            
            // Group by date
            const dailyCount = {};
            data.forEach(tree => {
                const date = (tree.planting_date || tree.created_at).split('T')[0];
                dailyCount[date] = (dailyCount[date] || 0) + 1;
            });

            const labels = Object.keys(dailyCount).sort();
            const values = labels.map(d => dailyCount[d]);

            // If no data, show clean empty state
            if (labels.length === 0) {
                const container = ctx.parentElement;
                container.innerHTML = `
                    <div class="empty-chart-state">
                        <div class="empty-timeline">
                            <svg width="200" height="80" viewBox="0 0 200 80">
                                <line x1="20" y1="60" x2="180" y2="60" stroke="#e0e0e0" stroke-width="2"/>
                                <circle cx="40" cy="60" r="4" fill="#e0e0e0"/>
                                <circle cx="80" cy="60" r="4" fill="#e0e0e0"/>
                                <circle cx="120" cy="60" r="4" fill="#e0e0e0"/>
                                <circle cx="160" cy="60" r="4" fill="#e0e0e0"/>
                                <path d="M100 20 L100 45" stroke="#4a9c3f" stroke-width="2" stroke-dasharray="4"/>
                                <circle cx="100" cy="20" r="8" fill="#4a9c3f"/>
                                <text x="100" y="24" text-anchor="middle" fill="white" font-size="10">🌱</text>
                            </svg>
                        </div>
                        <h4>Your Timeline Awaits</h4>
                        <p>Plant trees to see your progress here</p>
                        <a href="tree-tracker.html" class="empty-chart-btn">
                            <i class="fa fa-plus"></i> Plant a Tree
                        </a>
                    </div>
                `;
                return;
            }

            this.charts.trees = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.map(d => this.formatDateShort(d)),
                    datasets: [{
                        label: 'Trees Planted',
                        data: values,
                        borderColor: '#2d5a27',
                        backgroundColor: 'rgba(45, 90, 39, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Failed to init trees chart:', error);
        }
    },

    // Environmental impact chart
    async initImpactChart() {
        const ctx = document.getElementById('impact-chart');
        if (!ctx) return;

        // Get actual tree count from database
        const userId = AuthService.getUser()?.id;
        let trees = 0;
        
        if (userId) {
            try {
                const userTrees = await GreenSprintDB.trees.getByUser(userId);
                trees = userTrees?.length || 0;
            } catch (e) {
                const profile = AuthService.getProfile();
                trees = profile?.trees_planted || profile?.total_trees_planted || 0;
            }
        }
        
        const impact = this.calculateImpact(trees);

        // If no trees planted, show clean empty state
        if (trees === 0) {
            const container = ctx.parentElement;
            container.innerHTML = `
                <div class="empty-chart-state">
                    <div class="impact-preview">
                        <div class="impact-ring">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" stroke="#e8e8e8" stroke-width="6" fill="none"/>
                                <text x="50" y="45" text-anchor="middle" fill="#555" font-size="18" font-weight="700">0</text>
                                <text x="50" y="62" text-anchor="middle" fill="#888" font-size="11">trees</text>
                            </svg>
                        </div>
                        <div class="impact-stats-preview">
                            <div class="impact-stat-item">
                                <span class="stat-value">0 kg</span>
                                <span class="stat-label">CO₂</span>
                            </div>
                            <div class="impact-stat-item">
                                <span class="stat-value">0 L</span>
                                <span class="stat-label">Water</span>
                            </div>
                            <div class="impact-stat-item">
                                <span class="stat-value">0 kg</span>
                                <span class="stat-label">O₂</span>
                            </div>
                        </div>
                    </div>
                    <p class="impact-hint">Plant trees to track your environmental impact!</p>
                </div>
            `;
            return;
        }

        this.charts.impact = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['CO₂ Absorbed', 'Water Filtered', 'Oxygen Produced'],
                datasets: [{
                    data: [impact.co2, impact.water / 10, impact.oxygen],
                    backgroundColor: [
                        '#2d5a27',
                        '#4a9c3f',
                        '#7bc96f'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '60%'
            }
        });
    },

    // Species distribution chart
    async initSpeciesChart() {
        const ctx = document.getElementById('species-chart');
        if (!ctx) return;

        try {
            const distribution = await GreenSprintDB.analytics.getSpeciesDistribution();
            
            const labels = Object.keys(distribution).slice(0, 5);
            const values = labels.map(l => distribution[l]);

            this.charts.species = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Trees by Species',
                        data: values,
                        backgroundColor: '#4a9c3f'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Failed to init species chart:', error);
        }
    },

    // Initialize real-time updates
    initRealtime() {
        GreenSprintDB.realtime.subscribeToLeaderboard((payload) => {
            console.log('Leaderboard updated:', payload);
            this.loadGlobalStats();
        });
    },

    // Calculate environmental impact
    calculateImpact(treeCount) {
        return {
            co2: Math.round(treeCount * CONFIG.IMPACT.CO2_KG_PER_TREE),
            water: Math.round(treeCount * CONFIG.IMPACT.WATER_LITERS_PER_TREE),
            oxygen: Math.round(treeCount * CONFIG.IMPACT.OXYGEN_KG_PER_TREE),
            pollutants: Math.round(treeCount * CONFIG.IMPACT.AIR_POLLUTANTS_G_PER_TREE)
        };
    },

    // Show tree details modal
    async showTreeDetails(treeId) {
        // Open tree details page or modal
        window.location.href = `tree-details.html?id=${treeId}`;
    },

    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format date short
    formatDateShort(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
};

// Campaigns Module
const CampaignsModule = {
    campaigns: [],
    filters: {
        status: 'all',
        objective: 'all'
    },

    // Initialize campaigns page
    async init() {
        await this.loadCampaigns();
        this.bindEvents();
    },

    // Load campaigns
    async loadCampaigns() {
        try {
            const filters = {};
            if (this.filters.status !== 'all') filters.status = this.filters.status;
            if (this.filters.objective !== 'all') filters.objective = this.filters.objective;

            this.campaigns = await GreenSprintDB.campaigns.getAll(filters);
            this.renderCampaigns();
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    },

    // Render campaigns
    renderCampaigns() {
        const container = document.getElementById('campaigns-grid');
        if (!container) return;

        if (this.campaigns.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fa fa-search"></i>
                    <p>No campaigns found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.campaigns.map(c => this.renderCampaignCard(c)).join('');
    },

    // Render single campaign card
    renderCampaignCard(campaign) {
        const progress = Math.round((campaign.trees_planted / campaign.target_trees) * 100);
        
        return `
            <div class="campaign-card" onclick="window.location.href='campaign-details.html?id=${campaign.id}'">
                <div class="campaign-image">
                    <img src="${campaign.campaign_image_url || 'assets/images/default-campaign.jpg'}" alt="${campaign.campaign_name}">
                    <span class="campaign-status ${campaign.status}">${campaign.status}</span>
                </div>
                <div class="campaign-content">
                    <h3>${campaign.campaign_name}</h3>
                    <p class="campaign-organizer">
                        <img src="${campaign.organizer?.avatar_url || 'assets/images/default-avatar.png'}" alt="Organizer">
                        ${campaign.organizer?.full_name || 'Anonymous'}
                    </p>
                    <p class="campaign-description">${campaign.description?.substring(0, 100)}...</p>
                    <div class="campaign-progress-container">
                        <div class="progress-info">
                            <span>${campaign.trees_planted} / ${campaign.target_trees} trees</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="campaign-meta">
                        <span><i class="fa fa-calendar"></i> ${this.formatDate(campaign.start_date)}</span>
                        <span><i class="fa fa-map-marker"></i> ${campaign.location?.address || 'Global'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Bind events
    bindEvents() {
        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.filterType;
                const value = e.target.dataset.filter;
                this.setFilter(type, value);
            });
        });

        // Search
        const searchInput = document.getElementById('campaign-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCampaigns(e.target.value);
            });
        }
    },

    // Set filter
    setFilter(type, value) {
        this.filters[type] = value;
        this.loadCampaigns();

        // Update active state
        document.querySelectorAll(`[data-filter-type="${type}"]`).forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === value) {
                btn.classList.add('active');
            }
        });
    },

    // Search campaigns
    searchCampaigns(query) {
        if (query.length < 2) {
            this.renderCampaigns();
            return;
        }

        const filtered = this.campaigns.filter(c => 
            c.campaign_name.toLowerCase().includes(query.toLowerCase()) ||
            c.description?.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.getElementById('campaigns-grid');
        if (container) {
            container.innerHTML = filtered.map(c => this.renderCampaignCard(c)).join('');
        }
    },

    // Format date
    formatDate(dateStr) {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

// Leaderboard Module
const LeaderboardModule = {
    async init() {
        await this.loadLeaderboard();
        this.initRealtime();
    },

    async loadLeaderboard() {
        try {
            const leaders = await GreenSprintDB.users.getLeaderboard(50);
            this.renderLeaderboard(leaders);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    },

    renderLeaderboard(leaders) {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        container.innerHTML = leaders.map((user, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                <div class="rank">
                    ${index < 3 ? this.getRankIcon(index + 1) : index + 1}
                </div>
                <div class="user-info">
                    <img src="${user.avatar_url || 'assets/images/default-avatar.png'}" alt="${user.username}">
                    <div class="user-details">
                        <h4>${user.full_name || user.username}</h4>
                        <span>@${user.username}</span>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat">
                        <i class="fa fa-tree"></i>
                        <span>${user.total_trees_planted}</span>
                    </div>
                    <div class="stat points">
                        <i class="fa fa-star"></i>
                        <span>${this.formatNumber(user.total_points)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    getRankIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return icons[rank] || rank;
    },

    initRealtime() {
        GreenSprintDB.realtime.subscribeToLeaderboard(() => {
            this.loadLeaderboard();
        });
    },

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

// Profile Module
const ProfileModule = {
    async init() {
        if (!AuthService.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        await this.loadProfile();
        this.bindEvents();
    },

    async loadProfile() {
        const profile = AuthService.getProfile();
        if (!profile) return;

        // Populate form fields
        document.getElementById('profile-avatar-img').src = profile.avatar_url || 'assets/images/default-avatar.png';
        document.getElementById('profile-fullname').value = profile.full_name || '';
        document.getElementById('profile-username').value = profile.username || '';
        document.getElementById('profile-email').value = profile.email || '';
        document.getElementById('profile-bio').value = profile.bio || '';
        document.getElementById('profile-location').value = profile.location || '';
        document.getElementById('profile-phone').value = profile.phone || '';

        // Stats
        document.getElementById('profile-trees').textContent = profile.total_trees_planted || 0;
        document.getElementById('profile-points').textContent = this.formatNumber(profile.total_points || 0);
        document.getElementById('profile-joined').textContent = this.formatDate(profile.created_at);
    },

    bindEvents() {
        // Avatar upload
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.uploadAvatar(e.target.files[0]));
        }

        // Profile form
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
    },

    async uploadAvatar(file) {
        if (!file) return;

        try {
            const url = await GreenSprintDB.storage.uploadAvatar(AuthService.getUser().id, file);
            await GreenSprintDB.users.updateProfile(AuthService.getUser().id, { avatar_url: url });
            document.getElementById('profile-avatar-img').src = url;
            await AuthService.loadProfile();
            alert('Avatar updated successfully!');
        } catch (error) {
            console.error('Avatar upload failed:', error);
            alert('Failed to upload avatar');
        }
    },

    async saveProfile() {
        try {
            const updates = {
                full_name: document.getElementById('profile-fullname').value,
                bio: document.getElementById('profile-bio').value,
                location: document.getElementById('profile-location').value,
                phone: document.getElementById('profile-phone').value
            };

            await GreenSprintDB.users.updateProfile(AuthService.getUser().id, updates);
            await AuthService.loadProfile();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile save failed:', error);
            alert('Failed to save profile');
        }
    },

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
};

// Export modules
window.DashboardModule = DashboardModule;
window.CampaignsModule = CampaignsModule;
window.LeaderboardModule = LeaderboardModule;
window.ProfileModule = ProfileModule;
