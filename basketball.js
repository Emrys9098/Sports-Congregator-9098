async function getNBAScores() {
    const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderNBAGames(data.events);
    } catch (err) {
        document.getElementById('basketball-scores-container').innerHTML = "Failed to load NBA scores.";
    }
}

function renderNBAGames(events) {
    const container = document.getElementById('basketball-scores-container');
    container.innerHTML = '';

    events.forEach(event => {
        const game = event.competitions[0];
        const home = game.competitors.find(c => c.homeAway === 'home');
        const away = game.competitors.find(c => c.homeAway === 'away');
        const state = event.status.type.name;
        
        const card = document.createElement('div');
        card.className = `game-card game-${state}`;
        card.onclick = () => expandNBAGame(event.id);

        card.innerHTML = `
            <div class="game-info">
                ${state === 'STATUS_IN_PROGRESS' ? '<span class="live-indicator">● LIVE</span> | ' : ''}
                ${event.status.type.detail}
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${away.team.logo}" class="team-logo"> 
                    ${away.team.displayName}
                </span>
                <span class="score">${away.score}</span>
            </div>
            <div class="team-row">
                <span class="team-name-wrapper">
                    <img src="${home.team.logo}" class="team-logo"> 
                    ${home.team.displayName}
                </span>
                <span class="score">${home.score}</span>
            </div>
            <div class="details-section" id="details-${event.id}" style="display:none;">
                <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                <div class="stats-content">Loading game stats...</div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function expandNBAGame(gameId) {
    const detailsDiv = document.getElementById(`details-${gameId}`);
    const contentDiv = detailsDiv.querySelector('.stats-content');
    
    if (detailsDiv.style.display === 'block') {
        detailsDiv.style.display = 'none';
        return;
    }
    
    detailsDiv.style.display = 'block';
    
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
    try {
        const response = await fetch(summaryUrl);
        const data = await response.json();

        // 1. Get Stat Leaders (Points, Rebounds, Assists)
        let leadersHtml = '<strong>Top Performers:</strong><br>';
        const leaders = data.leaders || [];
        
        if (leaders.length > 0) {
            // NBA leaders usually split by category (Points, Rebounds, Assists)
            leadersHtml += leaders.map(cat => {
                const topPlayer = cat.leaders[0];
                return `<div style="font-size:0.85em;">${cat.displayName}: ${topPlayer.athlete.shortName} (${topPlayer.displayValue})</div>`;
            }).join('');
        } else {
            leadersHtml += "Stats pending...";
        }

        contentDiv.innerHTML = leadersHtml;
    } catch (err) {
        contentDiv.innerHTML = "Details currently unavailable.";
    }
}

getNBAScores();
setInterval(getNBAScores, 30000); // Auto-refresh every 30s