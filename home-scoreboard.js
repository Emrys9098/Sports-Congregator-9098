async function getHomeHeroScores() {
    const container = document.getElementById('hero-scoreboard');
    
    // We are going directly to ESPN now
    const leagues = [
        { name: 'MLB', url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard' },
        { name: 'NBA', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
        { name: 'NHL', url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard' }
    ];

    try {
        const results = await Promise.all(leagues.map(async (l) => {
            try {
                // Fetching directly without a proxy
                const res = await fetch(l.url);
                if (!res.ok) return [];
                const data = await res.json();
                return data.events ? data.events.map(e => ({ ...e, leagueName: l.name })) : [];
            } catch (e) {
                console.warn(`Direct fetch failed for ${l.name}. Ensure CORS extension is ON.`);
                return [];
            }
        }));
        
        let allGames = results.flat();

        if (allGames.length === 0) {
            container.innerHTML = "<p style='color:white;'>Turn on CORS extension to see scores.</p>";
            return;
        }

        // Filter: Live > Final > Scheduled
        const live = allGames.filter(g => g.status?.type?.state === 'in');
        const final = allGames.filter(g => g.status?.type?.state === 'post');
        const scheduled = allGames.filter(g => g.status?.type?.state === 'pre');

        let pool = live.length > 0 ? live : (final.length > 0 ? final : scheduled);
        
        // Pick 1 random game
        const featuredGame = pool[Math.floor(Math.random() * pool.length)];

        renderHeroScores([featuredGame]);
    } catch (err) {
        console.error("Home Script Error:", err);
    }
}

function renderHeroScores(games) {
    const container = document.getElementById('hero-scoreboard');
    container.innerHTML = '';

    games.forEach(game => {
        const info = game.competitions?.[0];
        const home = info?.competitors?.find(c => c.homeAway === 'home');
        const away = info?.competitors?.find(c => c.homeAway === 'away');

        const card = document.createElement('div');
        card.className = `game-card hero-card featured-single game-${game.status?.type?.name}`;
        
        card.innerHTML = `
            <div class="game-info">
                <span class="league-tag">${game.leagueName}</span> | ${game.status?.type?.detail}
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${away?.team?.logo || ''}" width="30" onerror="this.style.display='none'"> 
                    <strong>${away?.team?.shortDisplayName || 'Away'}</strong>
                </span>
                <span class="score">${away?.score || '0'}</span>
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${home?.team?.logo || ''}" width="30" onerror="this.style.display='none'"> 
                    <strong>${home?.team?.shortDisplayName || 'Home'}</strong>
                </span>
                <span class="score">${home?.score || '0'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

getHomeHeroScores();