async function getMLBScores() {
    const url = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard";
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderGames(data.events);
    } catch (err) {
        document.getElementById('scores-container').innerHTML = "Failed to load scores.";
    }
}

function renderGames(events) {
    const container = document.getElementById('scores-container');
    container.innerHTML = '';

    events.forEach(event => {
        const game = event.competitions[0];
        const home = game.competitors.find(c => c.homeAway === 'home');
        const away = game.competitors.find(c => c.homeAway === 'away');
        const state = event.status.type.name;
        
        const card = document.createElement('div');
        card.className = `game-card game-${state}`;
        card.setAttribute('onclick', `expandGame('${event.id}', this)`);

        card.innerHTML = `
            <div class="game-info">
                ${state === 'STATUS_IN_PROGRESS' ? '<span class="live-indicator">● LIVE</span> | ' : ''}
                ${event.status.type.detail}
            </div>
            <div class="team-row">
                <span><img src="${away.team.logo}" width="20"> ${away.team.displayName}</span>
                <span class="score">${away.score}</span>
            </div>
            <div class="team-row">
                <span><img src="${home.team.logo}" width="20"> ${home.team.displayName}</span>
                <span class="score">${home.score}</span>
            </div>
            <div class="details-section" id="details-${event.id}" style="display:none; border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px;">
                <em>Loading details...</em>
            </div>
        `;
        container.appendChild(card);
    });
}

async function expandGame(gameId, element) {
    const detailsDiv = document.getElementById(`details-${gameId}`);
    
    // Toggle visibility if already loaded
    if (detailsDiv.style.display === 'block') {
        detailsDiv.style.display = 'none';
        return;
    }
    
    detailsDiv.style.display = 'block';
    
    // Fetch Summary Data
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${gameId}`;
    try {
        const response = await fetch(summaryUrl);
        const data = await response.json();

        // 1. Get Pitchers (Probable or Leaders)
        let pitcherHtml = '<strong>Pitchers:</strong><br>';
        const leaders = data.leaders?.find(l => l.name === 'pitching')?.leaders || [];
        if (leaders.length > 0) {
            pitcherHtml += leaders.map(l => `${l.athlete.shortName}: ${l.displayValue}`).join(' | ');
        } else {
            pitcherHtml += "Stats unavailable";
        }

        // 2. Get Scoring Plays
        let playsHtml = '<div style="margin-top:10px;"><strong>Scoring Plays:</strong><br>';
        const scoringPlays = data.plays?.filter(p => p.scoringPlay === true) || [];
        if (scoringPlays.length > 0) {
            // Get the last 3 scoring plays
            playsHtml += scoringPlays.slice(-3).reverse().map(p => 
                `<div style="font-size:0.85em; margin-bottom:4px;">- ${p.text}</div>`
            ).join('');
        } else {
            playsHtml += "No scoring plays yet.";
        }
        playsHtml += '</div>';

        detailsDiv.innerHTML = pitcherHtml + playsHtml;

    } catch (err) {
        detailsDiv.innerHTML = "Could not load details.";
    }
}

getMLBScores();