async function getNHLScores() {
    const url = "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard";
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderHockeyGames(data.events);
    } catch (err) {
        document.getElementById('hockey-scores-container').innerHTML = "Failed to load NHL scores.";
    }
}

function renderHockeyGames(events) {
    const container = document.getElementById('hockey-scores-container');
    container.innerHTML = '';

    events.forEach(event => {
        const game = event.competitions[0];
        const home = game.competitors.find(c => c.homeAway === 'home');
        const away = game.competitors.find(c => c.homeAway === 'away');
        const state = event.status.type.name;
        
        const card = document.createElement('div');
        card.className = `game-card game-${state}`;
        card.onclick = () => expandHockeyGame(event.id);

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
                <hr>
                <div class="stats-content">Loading summary...</div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function expandHockeyGame(gameId) {
    const detailsDiv = document.getElementById(`details-${gameId}`);
    const contentDiv = detailsDiv.querySelector('.stats-content');
    
    if (detailsDiv.style.display === 'block') {
        detailsDiv.style.display = 'none';
        return;
    }
    
    detailsDiv.style.display = 'block';
    
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=${gameId}`;
    try {
        const response = await fetch(summaryUrl);
        const data = await response.json();

        // 1. Get Goalies (Saves/Save Percentage)
        let goalieHtml = '<strong>Goalies:</strong><br>';
        const goalieLeaders = data.leaders?.find(l => l.name === 'goaltending')?.leaders || [];
        if (goalieLeaders.length > 0) {
            goalieHtml += goalieLeaders.map(g => `${g.athlete.shortName}: ${g.displayValue}`).join(' | ');
        } else {
            goalieHtml += "Goalie stats pending";
        }

        // 2. Get Scoring Summary (Recent Goals)
        let scoringHtml = '<div style="margin-top:8px;"><strong>Scoring Summary:</strong><br>';
        const scoringPlays = data.plays?.filter(p => p.scoringPlay === true) || [];
        if (scoringPlays.length > 0) {
            scoringHtml += scoringPlays.slice(-3).reverse().map(p => 
                `<div style="font-size:0.8em; margin-bottom:2px;">- ${p.text}</div>`
            ).join('');
        } else {
            scoringHtml += "No goals scored yet.";
        }
        scoringHtml += '</div>';

        contentDiv.innerHTML = goalieHtml + scoringHtml;
    } catch (err) {
        contentDiv.innerHTML = "Details unavailable.";
    }
}

getNHLScores();
setInterval(getNHLScores, 30000);